import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

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
    it('should throw error if username is extremely long', async () => {
      const longUsername = 'a'.repeat(300); //300 karaktera
      const dto = {
        username: longUsername,
        email: 'test@test.com',
        password: 'pass123',
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('should allow or reject special unicode characters in username/emai', async () => {
      const dto = {
        username: '用户😊',
        email: '特殊@test.com',
        password: 'pass123',
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue({
        id: '123',
        username: dto.username,
        email: dto.email,
        password: 'hashed',
        points: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register(dto);

      expect(result.username).toBe(dto.username);
      expect(result.email).toBe(dto.email);
    });

    //describe-grupa testova, ovaj blok okuplja sve testove koji se ticu register metode
    it('should register the user when the data is valid', async () => {
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

      expect(result).toHaveProperty('id', '123'); //proveravam jel rezultat kreiran
      expect(result).toHaveProperty('username', 'newuser');
      expect(result).toHaveProperty('points', 10);
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
