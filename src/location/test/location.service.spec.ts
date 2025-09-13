import { PrismaService } from 'src/prisma/prisma.service';
import { LocationService } from '../location.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LocationService', () => {
  let service: LocationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationService, PrismaService],
    }).compile();

    service = module.get<LocationService>(LocationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createNewLocation', () => {
    it('should throw error if userId does not exist', async () => {
      const dto = { latitude: 40, longitude: 50, imageUrl: 'test.jpg' } as any;
      const userId = 'nonexistent';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.createNewLocation(dto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error when latitude is out of range', async () => {
      const dto = { latitude: 200, longitude: 50, imageUrl: 'test.jpg' } as any;
      const userId = '1';

      await expect(service.createNewLocation(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getOneLocation', () => {
    it('should throw error if location does not exist', async () => {
      const locationId = 'notexistent';
      const currentUserId = '1';

      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getOneLocation(locationId, currentUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return location with guesses if location exists', async () => {
      const locationId = '1';
      const currentUserId = '1';
      const mockLocation = {
        id: locationId,
        latitude: 45,
        longitude: 50,
        userId: '2',
        guesses: [
          {
            id: 'g1',
            latitude: 45.1,
            longitude: 50.1,
            userId: '3',
            distance: 0.2,
          },
        ],
      } as any;

      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(mockLocation);

      const result = await service.getOneLocation(locationId, currentUserId);
      expect(result).toEqual(mockLocation);
    });
  });

  describe('getLatestLocation', () => {
    it('should return empty array if offset is greater than total locations', async () => {
      const locationQueryDto = { limit: 10, offset: 100 } as any;

      jest.spyOn(prisma, '$transaction').mockResolvedValue([[], 5]);

      const result = await service.getLatestLocation(locationQueryDto);

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(5);
    });
  });

  describe('getOneRandomLocation', () => {
    it('should return null if table is empty', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);
      const result = await service.getOneRandomLocation();
      expect(result).toBeNull();
    });

    it('should return a location if table has at least one', async () => {
      const mockLocation = {
        id: '1',
        latitude: 45,
        longitude: 50,
        imageUrl: 'image.jpg',
        userId: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([mockLocation]);
      const result = await service.getOneRandomLocation();

      expect(result).toEqual(mockLocation);
    });
  });

  describe('GuessLocation', () => {
    it('should throw error if location does not exist', async () => {
      const locationId = 'notexist';
      const currentUserId = '1';
      const dto = { latitude: 40, longitude: 130 } as any;

      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(null);

      await expect(
        service.guessLocation(locationId, dto, currentUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if user guess own location', async () => {
      const locationId = '2';
      const currentUserId = '1';
      const dto = { latitude: 40, longitude: 130 } as any;

      const mockLocation = {
        id: locationId,
        userId: currentUserId,
        latitude: 40,
        longitude: 130,
      } as any;
      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(mockLocation);

      await expect(
        service.guessLocation(locationId, dto, currentUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('shoud throw error if user does not have enought points', async () => {
      const locationId = '1';
      const currentUserId = '2';
      const dto = { latitude: 40, longitude: 130 } as any;

      const mockLocation = {
        id: locationId,
        userId: 'someOtherUserId',
        latitude: 40,
        longitude: 130,
      };

      jest
        .spyOn(prisma.location, 'findUnique')
        .mockResolvedValue(mockLocation as any);

      jest.spyOn(prisma.guess, 'count').mockResolvedValue(0);
      const mockUser = { points: 2 };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      await expect(
        service.guessLocation(locationId, dto, currentUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('guessLocation -first try', async () => {
      const locationId = '1';
      const currentUserId = '3';
      const dto = { latitude: 40, longitude: 130 } as any;

      //mock lokacije u bazi
      const mockLocation = {
        id: locationId,
        userId: '2',
        latitude: 40,
        longitude: 130,
      } as any;
      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(mockLocation);

      //mock predhodnik pokusaja
      jest.spyOn(prisma.guess, 'count').mockResolvedValue(0); //prvi pokusaj

      //mock korisnika sa poenima
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue({ points: 10 } as any);

      //mock sa $transcation da vrati kreirani guess i azurirane poene
      const mockCreatedGuess = { id: 'g1' };
      const mockUpdatedUser = { points: 9 };

      jest
        .spyOn(prisma, '$transaction')
        .mockResolvedValue([mockCreatedGuess, mockUpdatedUser]);

      //poziv metode
      const result = await service.guessLocation(
        locationId,
        dto,
        currentUserId,
      );

      expect(result.pointsDeduct).toBe(1);
      expect(result.userPointsAfter).toBe(9);
      expect(result.guessId).toBe('g1');
      expect(result.locationId).toBe(locationId);
    });

    it('guessLocation -second try', async () => {
      const locationId = '2';
      const currentUserId = '4';
      const dto = { latitude: 40, longitude: 130 } as any;

      //mock lokacije u bazi
      const mockLocation = {
        id: locationId,
        userId: '8',
        latitude: 40,
        longitude: 130,
      } as any;
      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(mockLocation);

      //mock predhodnik pokusaja
      jest.spyOn(prisma.guess, 'count').mockResolvedValue(1); //prvi pokusaj

      //mock korisnika sa poenima
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue({ points: 10 } as any);

      //mock sa $transcation da vrati kreirani guess i azurirane poene
      const mockCreatedGuess = { id: 'b6' };
      const mockUpdatedUser = { points: 8 };

      jest
        .spyOn(prisma, '$transaction')
        .mockResolvedValue([mockCreatedGuess, mockUpdatedUser]);

      //poziv metode
      const result = await service.guessLocation(
        locationId,
        dto,
        currentUserId,
      );

      expect(result.pointsDeduct).toBe(2);
      expect(result.userPointsAfter).toBe(8);
      expect(result.guessId).toBe('b6');
      expect(result.locationId).toBe(locationId);
    });

    it('guessLocation - third try', async () => {
      const locationId = '4';
      const currentUserId = '9';
      const dto = { latitude: 40, longitude: 130 } as any;

      const mockLocation = {
        id: locationId,
        userId: '10',
        latitude: 40,
        longitude: 130,
      } as any;

      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(mockLocation);

      jest.spyOn(prisma.guess, 'count').mockResolvedValue(2);

      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue({ points: 10 } as any);

      const mockCreatedGuess = { id: 'p6' };
      const mockUpdatedUser = { points: 7 };

      jest
        .spyOn(prisma, '$transaction')
        .mockResolvedValue([mockCreatedGuess, mockUpdatedUser]);

      const result = await service.guessLocation(
        locationId,
        dto,
        currentUserId,
      );

      expect(result.pointsDeduct).toBe(3);
      expect(result.userPointsAfter).toBe(7);
      expect(result.guessId).toBe('p6');
      expect(result.locationId).toBe(locationId);
    });
  });

  describe('deleteLocation', () => {
    it('should throw error if location does not exist', async () => {
      const locationId = '1';
      const currentUserId = '2';

      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(null);

      await expect(
        service.deleteLocation(locationId, currentUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if user is not current user', async () => {
      const locationId = '1';
      const currentUserId = '2';

      const mockLocation = {
        id: locationId,
        userId: currentUserId,
      } as any;

      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(mockLocation);

      await expect(
        service.deleteLocation(locationId, currentUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
