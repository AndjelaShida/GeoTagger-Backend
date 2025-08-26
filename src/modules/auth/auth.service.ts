import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { PrismaService } from '../../prisma/prisma.service';



@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { username },
    });

    if (user) {
      throw new BadRequestException(`${username} is already taken`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   const createdUser = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    //ne vracamo password
    const { password: _, ...safeUser } = createdUser; //-> property password, ali nazovi ga _(i ne koristi ga dalje)
    //safeUser-> uzmi sve ostale property-je osim password i stavi ih u objekat safeUser
    //rezultat-> safeUser je objekat bez passworda
    return safeUser;
  }


  async login(user: { id:number, username: string }) {
    const payload: JwtPayloadDto = { username: user.username, sub: user.id };
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

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
}
