import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getProfile', () => {
    it('should throw error when username and email are not provided', async () => {
      await expect(service.getProfile('', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(service.getProfile('nonexistent', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return user when found by username', async () => {
      const mockUser = {
        id: '1',
        username: 'test',
        email: 'test@test.com',
      } as any;
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser);

      const result = await service.getProfile('test', '');
      expect(result).toEqual(mockUser);
    });

    it('should return user when found by email', async () => {
      const mockUser = {
        id: '2',
        username: 'other',
        email: 'mail@mail.com',
      } as any;
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser);

      const result = await service.getProfile('', 'mail@mail.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('resetPassword', () => {
    it('should throw error when token is not found', async () => {
      const dto = { token: 'abc', newPassword: 'newPass123' };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      await expect(service.resetPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if token is expired', async () => {
      const dto = { token: 'abc', newPassword: 'newPass123' };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({
        id: '1',
        username: 'test',
        email: 'test@test.com',
        password: 'oldHashedPass',
        points: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        resetToken: 'abc',
        resetTokenExpiry: new Date(Date.now() - 1000),
      });

      await expect(service.resetPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('successfully reset password', async () => {
      const dto = { token: 'validToken', newPassword: 'newPassword123' };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({
        id: '1',
        username: 'test',
        email: 'test@test.com',
        password: 'oldHashedPass',
        points: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        resetToken: 'validToken',
        resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 60),
      });
      jest.spyOn(bcrypt, 'hash' as any).mockResolvedValue('hashedPassword');

      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        id: '1',
        username: 'test',
        email: 'test@test.com',
        password: 'hashedPassword',
        points: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
      });

      const result = await service.resetPassword(dto);
      expect(result).toEqual({ message: 'Password successfully reset.' });
    });

    describe('update', () => {
      it('should throw error if user does not exist', async () => {
        const currentUser = { id: '1' } as any;
        const dto = { username: 'newUser', email: 'new@mail.com' } as any;

        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
        await expect(service.update(currentUser, dto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should successfully update user', async () => {
        const mockUser = {
          id: '1',
          username: 'old',
          email: 'old@mail.com',
        } as any;
        const updatedUser = {
          id: '1',
          username: 'new',
          email: 'newe@mail.com',
        } as any;

        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
        jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

        const result = await service.update(mockUser, {
          username: 'new',
          email: 'newe@mail.com',
        });
        expect(result).toEqual(updatedUser);
      });
    });

    describe('getPoints', () => {
      it('should throw error if user is not found', async () => {
        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
        await expect(service.getPoints('1')).rejects.toThrow(NotFoundException);
      });
    });

    it('should return points when user exists', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue({ points: 40 } as any);
      const result = await service.getPoints('1');
      expect(result).toEqual({ points: 40 });
    });

    it('should return location with default limit', async () => {
      const mockLocation = [{ id: '1' }, { id: '2' }] as any;
      jest.spyOn(prisma.location, 'findMany').mockResolvedValue(mockLocation);

      const result = await service.getLocations();
      expect(result).toEqual(mockLocation);
    });

    it('should aplly pagination correctly', async () => {
      const mockLocation = [{ id: '3' }, { id: '4' }] as any;
      jest.spyOn(prisma.location, 'findMany').mockResolvedValue(mockLocation);

      const result = await service.getLocations(2, 2);
      expect(prisma.location.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ skip: 2, take: 2 }),
      );
      expect(result).toEqual(mockLocation);
    });

    describe('removeUser', () => {
      it('should throw error if current user not found', async () => {
        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
        await expect(
          service.removeUser('2', { id: '1' } as any),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw error if non-admin tries to delete another user', async () => {
        jest
          .spyOn(prisma.user, 'findUnique')
          .mockResolvedValue({ id: '1', roles: [] } as any);
        await expect(
          service.removeUser('2', { id: '1' } as any),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('should delete user if admin', async () => {
        jest
          .spyOn(prisma.user, 'findUnique')
          .mockResolvedValue({ id: '1', roles: [{ name: 'admin' }] } as any);
        jest.spyOn(prisma.user, 'delete').mockResolvedValue({ id: '2' } as any);

        const result = await service.removeUser('2', { id: '1' } as any);
        expect(result).toEqual({ id: '2' });
      });
    });
  });
});
