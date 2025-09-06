import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationQueryDto } from './dto/locationQuery.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { GuessLocationDto } from './dto/guessLocation.dto';
import { GuessLocationResponseDto } from './dto/guessLocationResponse.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  constructor(private prisma: PrismaService) {}

  //KREIRANJE LOKACIJE
  async createNewLocation(dto: CreateLocationDto, userId: string) {
    //dto dolazi iz dto, userId dolazi iz JWT tokena(req.user.sub)
    const [createdLocation, updatedUser] = await this.prisma.$transaction([
      this.prisma.location.create({
        data: {
          latitude: dto.latitude,
          longitude: dto.longitude,
          imageUrl: dto.imageUrl,
          userId,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 10 } }, //increment-dodaj na postojecu vrednost
      }),
    ]);
    this.logger.log(
      `User ${userId} create new location ${createdLocation.id} and earned 10 points`,
    );

    return createdLocation;
  }

  //VRACANJE LISTE ZADNJIH LOKACIJA(PAGINACIJA)
  async getLatestLocation(locationQueryDto: LocationQueryDto) {
    const { limit = 10, offset = 0 } = locationQueryDto;

    const [data, count] = await this.prisma.$transaction([
      this.prisma.location.findMany({
        orderBy: { createdAt: 'desc' }, //orderBy je objekat koji prosledjujem
        skip: offset,
        take: limit,
      }),
      this.prisma.location.count(),
    ]);
    return { data, count };
  }

  //VRACANJE JEDNE RANDOM LOKACIJE
  async getOneRandomLocation() {
    //ne prosledjujem nista jer baza sama izabere nasumicnu lokaciju
    const [randomLocation] = await this.prisma.$queryRaw<Location[]>` 
    SELECT * FROM "Location" ORDER BY RANDOM() LIMIT 1
  `; //Location vraca niz.
    // const [ randomLocation] je array destructuring. Prisma vrazi niz ali odmah uzmima prvi element niza.
    //Znači randomLocation više nije niz (Location[]), nego jedan objekat (Location | undefined).
    return randomLocation ?? null; //ako je tabela prazna vraca null
  }
  // ?? -> vratili levi operand, osim ako je null ili undefined , tad vrati desni

  //VRACANJE VISE RANDOM LOKACIJA
  async getMultipleRandomLocation() {
    // const bez [] jer zelim prvih 5 lokacija e ne samo jednu
    const multipleRandomLocation = await this.prisma.$queryRaw<Location[]>`
  SELECT * FROM "Location" ORDER BY RANDOM() LIMIT 5
  `;
    return multipleRandomLocation ?? null;
  }

  //GUESS LOCATION LON,LAT
  async guessLocation(
    locationId: string, // id lokacije iz URL-a
    dto: GuessLocationDto, // latitude i longitude iz body-ja
    currentUserId: string, // id korisnika iz JWT
  ) {
    // Pronađi lokaciju u bazi
    const findLocation = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!findLocation) {
      this.logger.warn(
        `User ${currentUserId} tried to guess non-existing location ${locationId}`,
      );
      throw new NotFoundException('Location not found');
    }

    if (findLocation.userId === currentUserId) {
      this.logger.warn(
        `User ${currentUserId} tried to guess their own location ${locationId}`,
      );
      throw new BadRequestException('You cannot guess your own location');
    }

    // Prebroji prethodne pokušaje korisnika za ovu lokaciju
    const previousGuessesCount = await this.prisma.guess.count({
      where: {
        userId: currentUserId,
        locationId: locationId,
      },
    });

    // Odredi koliko poena se oduzima po pravilima
    let pointsDeduct = 1; //prvi pogodak -1 poen
    if (previousGuessesCount === 1) pointsDeduct = 2; //drugi pogodak -2 poen
    if (previousGuessesCount >= 2) pointsDeduct = 3; //treci pogodak -3 poen

    //proveri da li korisnik ima dovoljno poenta pre nego sto nastavimo
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { points: true },
    });
    if (!user) throw new NotFoundException('User is not found');

    if (user.points < pointsDeduct) {
      this.logger
        .warn(`User ${currentUserId} tried to guess location ${locationId}
         with insufficient points (${user.points} < ${pointsDeduct})`);
      throw new BadRequestException(
        `Not enough points to play. Required: ${pointsDeduct}, you have: ${user.points}`,
      );
    }

    // Izracunaj distancu, pomocu postGis
    const [row] = await this.prisma.$queryRaw<
      { meters: number }[]
    >`SELECT ST_DistanceSphere(
    ST_MakePoint(${dto.longitude}, ${dto.latitude}),  
    ST_MakePoint(${findLocation.longitude}, ${findLocation.latitude})   
  ) AS meters
  `;

    const distance = row ? row.meters / 1000 : null; //ako row postoji->onda racunaj km->u suprotom vrati null

    //odredjujemo da li je pogodjeno
    const CORRECT_THRESHOLD_KM = 0.05; //0.1=100m, ako je igracev pogodak bio blizi od 100m racunamo da je pogodjeno
    const isCorrect = distance !== null && distance <= CORRECT_THRESHOLD_KM; //ako postoji distanc ai manja je od 100m-> true, inace IsCorrect= false

    //ako je pogodjeno dodaj 10 poena ali i oduzmi pointstodeduct
    const pointsToAward = isCorrect ? 10 : 0; //ako je isCorrest= true korisnik dobija 10 poenta. /ako je isCorrest= false korisnik ne dobija nista.

    this.logger.log(
      `User ${currentUserId} guessed location ${locationId} - distance ${distance} km,c correct: ${isCorrect}`,
    );
    const [createdGuess, updatedUser] = await this.prisma.$transaction([
      //transaction-grupisanje vise query-ja u jednu baznu transakciju.Moraju oba da uspeju u suprotnom rollback
      this.prisma.guess.create({
        data: {
          userId: currentUserId,
          locationId: findLocation.id,
          latitude: dto.latitude,
          longitude: dto.longitude,
          distance,
        },
      }),
      // Ažuriraj korisnikove poene
      this.prisma.user.update({
        where: { id: currentUserId },
        data: {
          points: { decrement: pointsDeduct, increment: pointsToAward },
        },
        select: { points: true },
      }),
    ]);

    // Vrati rezultat korisniku
    const response = {
      guessId: createdGuess.id,
      locationId: findLocation.id,
      latitude: dto.latitude,
      longitude: dto.longitude,
      distance,
      pointsDeduct: pointsDeduct,
      pointsAwarded: pointsToAward,
      userPointsAfter: updatedUser.points,
    };

    return this.validateGuessLocationResponse(response);
  }

  // Helper funkcija za runtime validaciju
  private validateGuessLocationResponse(obj: any): GuessLocationResponseDto {
    if (
      typeof obj.guessId !== 'string' || //ako guessid nije string, izraz postaje true(ako tip nije string, nesto je pogresno)
      typeof obj.locationId !== 'string' ||
      typeof obj.latitude !== 'number' ||
      typeof obj.longitude !== 'number' ||
      typeof obj.distance !== 'number' ||
      typeof obj.pointsDeduct !== 'number'
    ) {
      throw new BadRequestException(
        'Invalid GuessLocationResposneDto structure',
      );
    }
    return obj;
  }
}
