import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ApiBadGatewayResponse } from '@nestjs/swagger';

describe('AuthService - register', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    //beforeEach-znaci da ce se ovaj blok koda izvrsiit pre svakog testa u fajlu.
    const module: TestingModule = await Test.createTestingModule({
      //pravi testni modu u kom definisem provajdere, controlore i module koje zelim da testiram
      providers: [AuthService, PrismaService],
    }).compile(); //compile.zavrsava kreiranje i vraca testingModule objekat

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    //describe-grupa testova, ovaj blok okuplja sve testove koji se ticu register metode
    it('treba da registruje korisnika kad su podaci validni', async () => {
      //sve it() funkcije unutar njega opisuju pojedinacne slucajeve testiranje
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue({
        id: '123',
        username: 'newuser',
        email: 'test@test.com',
        password: 'hashed',
        points: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const dto = {
        username: 'newuser',
        email: 'test@test.com',
        password: 'pass123',
      };

      const result = await service.register(dto);

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if the username already exists', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: '123',
        username: 'existing',
        email: 'exist@test.com',
        password: 'hashed',
        points: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const dto = {
        username: 'existing',
        email: 'new@testcom',
        password: 'pass123',
      };

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });
    it('should throw an error if the password is empty', async () => {
      const dto = { username: 'newuser', email: 'test@test.com', password: '' };
      await expect(service.register(dto)).rejects.toThrow();
    });

    it('should throw an error that the email is not a valid format', async () => {
      const dto = {
        username: 'newuser',
        email: 'notanemail',
        password: 'pass123',
      };

      await expect(service.register(dto)).rejects.toThrow();
    });
  });
});
