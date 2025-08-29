import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from 'generated/prisma/client';
import * as bcrypt from 'bcrypt' ;

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService, //prismaService dolazi iz PrismaModule
  ) {}

  async getProfile(username: string, email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (!user) throw new BadRequestException('User is not found');

    return user;
  }

  async update(currentUser: User, dto: UpdateUserDto) {
  const user = await this.prisma.user.findUnique({
    where: { id: currentUser.id },
  });

  if (!user) throw new BadRequestException('User not found.');

  const updateData: Prisma.UserUpdateInput = {
    username: dto.username,
    email: dto.email,
    password: dto.password ? await bcrypt.hash(dto.password, 10) : undefined,
    points: dto.points,
    resetToken: dto.resetToken,
    resetTokenExpiry: dto.resetTokenExpiry,
  };

  return this.prisma.user.update({
    where: { id: currentUser.id },
    data: updateData, 
  });
}

//DOHVAT TRENUTNIH POENTA KORISNIKA
async getPoints( userId: number ) {
    const user = await this.prisma.user.findUnique({
        where: { id: userId},
        select: { points: true }, //-vrati mi samo polje points a ne celu user tabelu
    });

    if(!user) {
        throw new Error ('User is not found');

        return { points: user.points }; //ako je korisnik pronadjen, vraca se njegov br poena u JSON obliku
    }  
}

//DOHVAT LISTE NAJNOVIJIH LOKACIJA
async getLocations(page?: number, limit?: number) { //opcioni paramteri, page->koja str lokacija, limit->koliko lokacija po str
  // Ako nema page/limit, vrati sve
   const take = limit ?? 10; // koliko lokacija uzimamo, default 10 po strani
  const skip = page && limit ? (page - 1) * limit : 0; //koliko lokacija preskociti

  const locations = await this.prisma.location.findMany({
    orderBy: { createdAt: 'desc' }, // sortiranje po datumu, najnovije lokacije prve
    skip,
    take,
  });

  return locations; // vraća niz lokacija
}


  async remove(currentUser: User) {
    try {
  return this.prisma.user.delete({
    where: { id: currentUser.id },
  });
    }catch(e) {
         // Proveravamo da li je greška “record does not exist”
    if(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new BadRequestException('User is not found');
    }
    throw e; // sve ostale greske prosledjujemo dalje
}
}
}
