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

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  //KREIRANJE LOKACIJE
  async createNewLocation(dto: CreateLocationDto, userId: string) {
    //dto dolazi iz dto, userId dolazi iz JWT tokena(req.user.sub)
    const newLocation = await this.prisma.location.create({
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        imageUrl: dto.imageUrl,
        userId,
      },
    });

    return newLocation;
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
      throw new NotFoundException('Location not found');
    }

    // Izracunaj rastojanje, postGis
    const [row] = await this.prisma.$queryRaw<
      { meters: number }[]
    >`SELECT ST_DistanceSphere(
    ST_MakePoint(${dto.longitude}, ${dto.latitude}),  
    ST_MakePoint(${findLocation.longitude}, ${findLocation.latitude})   
  ) AS meters
  `;

    const distance = row ? row.meters / 1000 : null; //ako row postoji->onda racunaj km->u suprotom vrati null

    // Prebroji prethodne pokušaje korisnika za ovu lokaciju
    const previousGuessesCount = await this.prisma.guess.count({
      where: {
        userId: currentUserId,
        locationId: locationId,
      },
    });

    // Odredi koliko poena se oduzima po pravilima
    let pointsToDeduct = 1; //prvi pogodak -1 poen
    if (previousGuessesCount === 1) pointsToDeduct = 2; //drugi pogodak -2 poen
    if (previousGuessesCount >= 2) pointsToDeduct = 3; //treci pogodak -3 poen

    // Ažuriraj korisnikove poene
    await this.prisma.user.update({
      where: { id: currentUserId },
      data: { points: { decrement: pointsToDeduct } },
    });

    // Sačuvaj guess u tabeli
    const guess = await this.prisma.guess.create({
      data: {
        userId: currentUserId,
        locationId: findLocation.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
        distance,
      },
    });

    // Vrati rezultat korisniku
    const response = {
      guessId: guess.id,
      locationId: findLocation.id,
      latitude: dto.latitude,
      longitude: dto.longitude,
      distance,
      pointsDeduct: pointsToDeduct,
    };

    return this.validateGuessLocationResponse(response);
  }

  // Helper funkcija za runtime validaciju
  private validateGuessLocationResponse(obj: any): GuessLocationResponseDto {
    if (
      typeof obj.guessId !== 'string' || //ako guessid nije strin, izraz postaje true(ako tip nije string, nesto je pogresno)
      typeof obj.locationId !== 'string' ||
      typeof obj.latitude !== 'number' ||
      typeof obj.longitude !== 'number' ||
      typeof obj.distance !== 'number' ||
      typeof obj.pointsDeducted !== 'number'
    ) {
      throw new BadRequestException(
        'Invalid GuessLocationResposneDto structure',
      );
    }
    return obj;
  }
}

//asc = ascending = rastući redosled (od manjeg ka većem, od A do Z, od starijeg ka novijem).
// desc = descending = opadajući redosled (od većeg ka manjem, od Z ka A, od novijeg ka starijem).
//findLocation je objekat iz baze sa pravom lokacijom, dok je dto ono što je korisnik poslao.
