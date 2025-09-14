import { PrismaService } from 'src/prisma/prisma.service';
import { ActionLogService } from '../actionLog.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionType, ComponentType } from 'generated/prisma';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('ActionlogService', () => {
  let service: ActionLogService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionLogService, PrismaService],
    }).compile();

    service = module.get<ActionLogService>(ActionLogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getLast100Log', async () => {
    it('Admin successfully get last 100 logs', async () => {
      //mockuj korisnika sa admin ulogom
      const mockUser = {
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        roles: [{ name: 'ADMIN' }],
      } as any;

      //mockuj prisma.user.findUnique da vrati tog admin korisnika
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      //mockuj da vrati listu logova
      const mockLogArray = [
        {
          id: '1',
          userId: '1',
          action: ActionType.CLICK,
          component: ComponentType.BUTTON,
          newValue: 'some value',
          url: '/dashboard',
          createdAt: new Date('2025-09-10T12:00:00Z'),
        },
        {
          id: '2',
          userId: '2',
          action: ActionType.SCROLL,
          component: ComponentType.BUTTON,
          newValue: 'some value',
          url: '/setting',
          createdAt: new Date('2025-09-11T12:00:00Z'),
        },
        {
          id: '3',
          userId: '4',
          action: ActionType.CLICK,
          component: ComponentType.LINK,
          newValue: 'some value',
          url: '/home',
          createdAt: new Date('2025-09-12T12:00:00Z'),
        },
      ];

      jest.spyOn(prisma.actionLog, 'findMany').mockResolvedValue(mockLogArray);

      const result = await service.getLast100Log(mockUser.id);

      expect(result).toHaveLength(3); //provera da result niz ima tacno 3 elementa
      expect(result[0].createdAt.getTime()).toBeGreaterThan(
        result[1].createdAt.getTime(),
      ); //proverava da je createdAt vrednost prvog elementa veca tj novija od createdAt drugog
      expect(result[0].url).toBe('/home'); //proverava da prvi najnoviji log ima url vrednost home
    });

    it('should throw error if user is not admin', async () => {
      //mock user bez admin uloge
      const mockUser = {
        id: '1',
        username: 'ordinaryUser',
        email: 'user@gmail.com',
        roles: [{ name: 'USER' }],
      } as any;

      //mockuj prisma user uniq da vrati tog usera
      jest.spyOn(prisma.actionLog, 'findUnique').mockResolvedValue(mockUser);

      // 3. Pozovi servisnu metodu getLast100Log sa tim userId
      //  → Očekujemo da baci ForbiddenException
      await expect(service.getLast100Log(mockUser.id)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.actionLog.findMany).not.toHaveBeenCalled();
    });

    it('should throw error if user does not exist in db', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getLast100Log('non-exist-id')).rejects.toThrow(
        'User not found.',
      );
      expect(prisma.actionLog.findMany).not.toHaveBeenCalled();
    });

    it('should throw error if db is empty', async () => {
      const mockAdminUser = {
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        roles: [{ name: 'ADMIN' }],
      } as any;
      jest
        .spyOn(prisma.actionLog, 'findUnique')
        .mockResolvedValue(mockAdminUser);

      jest.spyOn(prisma.actionLog, 'findMany').mockResolvedValue([]);

      await expect(service.getLast100Log(mockAdminUser.id)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.actionLog.findMany).toHaveBeenCalled();
    });
  });

  describe('getLogsPerUser', () => {
    it('user successfully gets last 100logs per user', async () => {});

    it('should throw error if user does not exist');

    it('should throw error if there is no logs');

    it('should throw error if user does not exist in db');

    it('Filtriranje po action ili component');
  });
});
