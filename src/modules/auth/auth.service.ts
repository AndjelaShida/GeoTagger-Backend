import {
  BadRequestException,
  Injectable,
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


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: UserRegisterDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (user) {
      throw new BadRequestException(`${dto.username} is already taken`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        points: 10,
      },
    });

    //ne vracamo password
    const { password: _, ...safeUser } = createdUser; //-> property password, ali nazovi ga _(i ne koristi ga dalje)
    //safeUser-> uzmi sve ostale property-je osim password i stavi ih u objekat safeUser
    //rezultat-> safeUser je objekat bez passworda
    return safeUser;
  }

  async login( dto: UserLoginDto ) {
    const user = await this.validateUser(dto.username, dto.password);

    const payload: JwtPayloadDto = {
      username: user.username,
      sub: user.id,
    };
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    console.log('user from db:', user);

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Passwords does not match');
    }

    delete user.password;

    return user;
  }

  async forgotPassword(email: string) {
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

    await this.sendResetEmail(user.email, token);

    return { message: 'Reset email sent' };
  }

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

    console.log(`Reset email sent to ${email}`) ;
  }
}
