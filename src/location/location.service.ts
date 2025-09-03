import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationQueryDto } from './dto/locationQuery.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  //kreiranje lokacije
  async createNewLocation(dto: CreateLocationDto, userId: string) {//dto dolazi iz dto, userId dolazi iz JWT tokena(req.user.sub)
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

  //vracanje liste zadnjih lokacija(mogu dodati paginaciju)
  async getLatestLocation(locationQueryDto: LocationQueryDto) {
    const { limit = 10, offset = 0 } = locationQueryDto;

    const [data, count] = await this.prisma.$transaction([
      this.prisma.location.findMany({
        orderBy: { createdAt: 'desc' },//orderBy je objekat koji prosledjujem
        skip: offset,
        take: limit,
      }),
      this.prisma.location.count(),
    ]);
    return { data, count };
  }

  //vracanje jedne random lokacije
  async getOneRandomLocation() {//ne prosledjujem nista jer baza sama izabere nasumicnu lokaciju
const [ randomLocation] = await this.prisma.$queryRaw<Location[]>`
    SELECT * FROM "Location" ORDER BY RANDOM() LIMIT 1
  `;//Location[] uvek vraca niz i uzima prvi element niza
  return randomLocation ?? null ; //ako je tabela prazna vraca nul
    
  }

//vracanje vise lokacija
async getMultipleRandomLocation() {

}

  //pogodi lokaciju lat, lon
}



//asc = ascending = rastući redosled (od manjeg ka većem, od A do Z, od starijeg ka novijem).
// desc = descending = opadajući redosled (od većeg ka manjem, od Z ka A, od novijeg ka starijem).