import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; //nodejs ugradjeni model za generisanje bezbednih slucajnih brojeva/hashova/enkripciju i dekiprciju
import * as nodemailer from 'nodemailer';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { User } from 'generated/prisma';
import { UserResponseDto } from './dto/userResponseDto.dto';

interface oauthData {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  //REGISTER
  async register(dto: UserRegisterDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (user) {
      this.logger.warn(`User${user} with that username already exist`);
      throw new BadRequestException(`${dto.username} is already taken`);
    }

    //validacija passworda
    if (!dto.password || dto.password.trim().length === 0) {
      throw new BadRequestException('Password cannot be empty.');
    }

    //validacija username
    if (dto.username.length > 50) {
      throw new BadRequestException('Username is to long');
    }

    //validacija emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new BadRequestException('Email format is invalid.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10); //lozinku pretvaramo u neprepoznatljiv niz karaktera, pomoću matematičkog algoritma.

    //kreiramo novog korisnika u bazi
    const createdUser: User = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        points: 10,
      },
    });

    const safeUser: UserResponseDto = {
      id: createdUser.id,
      username: createdUser.username,
      email: createdUser.email,
      points: createdUser.points,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
      resetToken: createdUser.resetToken,
      resetTokenExpiry: createdUser.resetTokenExpiry,
    };
    this.logger.log(
      `User "${createdUser.username}" (ID: ${createdUser.id}) registered.`,
    );
    return safeUser;
  }

  //LOGIN
  async login(dto: UserLoginDto): Promise<{ access_token: string }> {
    //proveri da li korisnik postoji i da li je password tacan i ako je sve ok sacuvaj korisnika u promenljivoj user
    const user = await this.validateUser(dto);

    const payload: JwtPayloadDto = {
      username: user.username,
      sub: user.id,
    };
    const token = this.jwtService.sign(payload);
    this.logger.log(
      `User "${user.username}" (ID: ${user.id}) successfully logged in.`,
    );
    return {
      access_token: token,
    };
  }

  async validateUser(
    dto: UserLoginDto,
  ): Promise<{ id: string; username: string; email: string }> {
    const { username, password } = dto;
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!user) throw new NotFoundException(`User not found`);

    const isMatch = await bcrypt.compare(password, user.password); //proverava lozinku za tog korisnika
    if (!isMatch) throw new BadRequestException('Passwords does not match');

    delete user.password;
    this.logger.log(`User ${user.id} successfully validated`);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
  //FORGOT PASSWORD
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new BadRequestException('User not found');

    const token = this.generateResetToken();
    //cuvamo token i vreme isteka
    await this.prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), //1h od sad se cuva token
      },
    });
    this.logger.log(`Password reset token generated for user "${user.email}".`);

    await this.sendResetEmail(user.email, token);

    this.logger.log(`Password reset email sent to ${email}.`);

    return { message: 'Reset email sent.' };
  }

  async loginWithOAuth(
    oauthData: oauthData,
  ): Promise<{ access_token: string; user: User }> {
    const { provider, providerId, email, firstName, lastName, picture } =
      oauthData;

    // proveri da li već postoji UserOfAuth
    let userOfAuth = await this.prisma.userOfAuth.findFirst({
      where: { provider, providerId },
      include: { user: true },
    });

    const uniqueUsername = await this.generateUniqueUsername(
      firstName,
      lastName,
    );

    if (userOfAuth) {
      this.logger.log(
        `OAuth login successful via ${provider} for user "${userOfAuth.user.username}".`,
      );
    } else {
      const user = await this.prisma.user.create({
        //pravljenje pravog korisnickog naloga
        data: {
          username: uniqueUsername,
          email,
          password: null,
          points: 10, // početni poeni za registrovanog korisnika
        },
      });
      this.logger.log(`New OAuth user created via ${provider}: ${email}.`);

      userOfAuth = await this.prisma.userOfAuth.create({
        //veza izmedju korisnika i provajdera(da znamo da je taj korisnik logovan preko googla)
        data: { provider, providerId, userId: user.id },
        include: { user: true },
      });
    }

    //Ovaj deo povezuje OAuth korisnika sa internim korisničkim objektom i odmah mu generiše JWT token za dalju autentifikaciju.
    const payload = {
      sub: userOfAuth.user.id,
      username: userOfAuth.user.username,
    }; //payload je obj koji ce biti ugradjen u JWT token
    const token = this.jwtService.sign(payload); //jwtService.sign() uzima payload i generiše JWT token

    return { access_token: token, user: userOfAuth.user };
  }

  /////HELPER FUNCTION//////

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex'); // funkcija pravi token od 64 karaktera
  }

  private async sendResetEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await transporter.sendMail({
      from: '"GeoTagger" <no-reply@geotagger.com>',
      to: email,
      subject: 'Reset your password',
      text: `Click here to reset your password: ${resetLink}`,
      html: `<a href="${resetLink}">Reset Password</a>`,
    });

    console.log(`Reset email sent to ${email}`);
  }

  private async generateUniqueUsername(
    firstName: string,
    lastName: string,
  ): Promise<string> {
    //napravi osnovu username
    const base = `${firstName}${lastName}`.replace(/\s+/g, ''); //spaja ime i prezime a .replace(/\s+/g, '');-uklanja sve razmake

    //uzmi skraceni UUID
    let shortUuid = crypto.randomUUID().slice(0, 6); //.slice(0, 6);-uzima prvih 6 karaktera
    //sastavi kandidata za useranme
    let candidate = `${base}_${shortUuid}`; //osnova+skracenica

    //proveravaj u bazi dok ne nadjes slobodan suername
    while (
      await this.prisma.user.findUnique({
        where: { username: candidate },
      })
    ) {
      shortUuid = crypto.randomUUID().slice(0, 6);
      candidate = `${base}_${shortUuid}`;
    }
    return candidate;
  }
}
