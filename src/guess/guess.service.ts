import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GuessService {
  constructor(private prisma: PrismaService) {}

  //VRATI SVE POGODJENE LOKACIJE OD KORISNIKA
  async getAllGuessLocation(userId: string, page = 1) {
    const take = 10;
    const skip = (page - 1) * take;
    const [user, findAllGuesses] = await this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: userId },
      }),
      this.prisma.guess.findMany({
        where: { userId },
        include: { location: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!user) throw new NotFoundException('User is not found.');

    return findAllGuesses;
  }

  //VRATI SVE POGODJENE LOKACIJE OD KORISNIKA
}
