import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Location, Prisma, User } from 'generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private prisma: PrismaService, //prismaService dolazi iz PrismaModule
  ) {}

  //GET PROFILE
  async getProfile(username: string, email: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (!username && !email)
      throw new BadRequestException('Username or email must bre provided');

    if (!user) throw new BadRequestException('User is not found');

    return user;
  }

  //RESSET PASSWORD
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = dto; //izlvacimo polja iz DTO-a

    const user = await this.prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user) {
      this.logger.warn(`Token ${token} is invalid o non-existing`);
      throw new BadRequestException('Invalid or non-existing reset token.');
    }

    // Provera isteka tokena
    if (
      !user.resetTokenExpiry ||
      user.resetTokenExpiry.getTime() < Date.now()
    ) {
      this.logger.warn(`Token ${token} is expired`);
      // || -ili-dovoljno je da jedan uslov bude istinit da bi if bio istinit)
      throw new BadRequestException('Reset token has expired.');
    }

    // Hešuj novu lozinku
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Ažuriraj lozinku i očisti token i expiry
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    this.logger.log(`User ${user.id} successfully reset their password`);
    return { message: 'Password successfully reset.' };
  }

  //UPDATE
  async update(currentUser: User, dto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) throw new BadRequestException('User not found.');

    const updateData: Prisma.UserUpdateInput = {
      ...(dto.username && { username: dto.username }),
      ...(dto.email && { email: dto.email }),
      ...(dto.password && { password: dto.password }),
      ...(dto.points && { points: dto.points }),
      ...(dto.resetToken && { resetToken: dto.resetToken }),
      ...(dto.resetTokenExpiry && { resetTokenExpiry: dto.resetTokenExpiry }),
    };

    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });
    this.logger.log(`User ${user.id} successfully update their data`);

    return updatedUser;
  }

  //DOHVAT TRENUTNIH POENTA KORISNIKA
  async getPoints(userId: string): Promise<{ points: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true }, //-vrati mi samo polje points a ne celu user tabelu
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { points: user.points }; //ako je korisnik pronadjen, vraca se njegov br poena u JSON obliku
  }

  //DOHVAT LISTE NAJNOVIJIH LOKACIJA
  async getLocations(page?: number, limit?: number): Promise<Location[]> {
    //opcioni paramteri, page->koja str lokacija, limit->koliko lokacija po str
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
  //DELETE
  async removeUser(id: string, currentUser: User): Promise<User> {
    const userWhitRoles = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { roles: true }, //kad god treba da proverim uloge koristim include. Zato sto prisma ne vraca relacije
    });
    if (!userWhitRoles) throw new NotFoundException('User not found.');

    const isAdmin = userWhitRoles.roles?.some((r) => r.name === 'admin');
    //ako nije admin i pokusava da obrise drugog korisnika
    if (!isAdmin && currentUser.id !== id) {
      this.logger.warn(
        `User  ${currentUser.id} attempted to delete user ${id} but is not authotized.`,
      );
      throw new UnauthorizedException(
        'You are not authorized to delete this user',
      );
    }

    try {
      const deletedUser = await this.prisma.user.delete({ where: { id } });
      this.logger.log(`User ${currentUser.id} successfully deleted user ${id}`);

      return deletedUser;
    } catch (e: any) {
      if (e?.code === 'P2025') {
        this.logger.warn(
          `User ${currentUser.id} tried to delete non-existing user ${id}`,
        );
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }
}
