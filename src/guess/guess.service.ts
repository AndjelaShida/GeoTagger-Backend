import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GuessService {
  constructor(private prisma: PrismaService) {}

  //VRATI SVE POGODJENE LOKACIJE OD KORISNIKA
  async getAllGuessLocation(userId: string, page = 1, limit = 10) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User is not found.');

    const guesses = await this.prisma.guess.findMany({
      where: { userId },
      include: { location: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.guess.count({
      where: { userId },
    });
    return {
      data: guesses,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  //VRATI SVE POGODJENE LOKACIJE OD KORISNIKA
}
