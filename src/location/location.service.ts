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
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.location.count(),
    ]);
    return { data, count };
  }

  //vracanje random lokacije
  async getRandomLocation() {}

  //pogodi lokaciju lat, lon
}
