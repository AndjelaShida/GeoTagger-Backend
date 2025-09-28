import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Guess, Location } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { TopUserDto } from './dto/topUsers.dto';

@Injectable()
export class GuessService {
  private readonly logger = new Logger(GuessService.name);
  constructor(private prisma: PrismaService) {}

  //VRATI SVE POGODJENE LOKACIJE OD KORISNIKA
  async getAllGuessLocation(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: (Guess & { location: Location })[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`User ${userId} not found.`);
      throw new NotFoundException('User not found.');
    }

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

  //TOP 10 KORISNIKA
  async getTopUserByPoints(limit = 10): Promise<TopUserDto[]> {
    return this.prisma.user.findMany({
      orderBy: { points: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        points: true,
      },
    });
  }
}
