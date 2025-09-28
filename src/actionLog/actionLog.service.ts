import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActionLog, ActionType, ComponentType } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterLogsDto } from './dto/filterLogs.dto';

@Injectable()
export class ActionLogService {
  constructor(private prisma: PrismaService) {}

  //ADMIN MOZE DA VIDI POSLEDNJIH 100 LOGOVA
  async getLast100Log(currentUserId: string): Promise<ActionLog[]> {
    //pronadji korisnika sa njegovim ulogama
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      include: { roles: true },
    });

    if (!user) throw new ForbiddenException('User not found.');

    //proveri da li korisnik ima admin ulogu
    const isAdmin = user.roles.some((role) => role.name === 'ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('You are not allowed to do this action.');
    }
    //vrati poslednjih 100 logova
    return await this.prisma.actionLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
  }

  //LOGOVI PO KORISNIKU
  async getLogsPerUser(
    userId: string,
    action?: ActionType,
    component?: ComponentType,
  ): Promise<ActionLog[]> {
    //proveri da li korisnik postoji u bazu
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException('User not found.');
    //napravi query za actionlog model
    const where: any = { userId };
    if (action) where.action = action;
    if (component) where.component = component;

    const actionlog = await this.prisma.actionLog.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
    return actionlog;
  }

  //FILTRIRANJE PO actiontype, componenttype, newvalue, url, userid
  async getFilterLogs(dto: FilterLogsDto, limit = 100): Promise<ActionLog[]> {
    const { action, component, newValue, url, userId } = dto;
    return this.prisma.actionLog.findMany({
      where: {
        ...(action ? { action } : {}),
        ...(component ? { component } : {}),
        ...(newValue ? { newValue: { contains: newValue } } : {}),
        ...(url ? { url: { contains: url } } : {}),
        ...(userId ? { userId } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  //BRISANJE LOGOVA-SAMO ADMIN
  async deleteLogs(logsId: string): Promise<{ id: string; message: string }> {
    //trazenje logova, greska ako je nema, provera vlasnistva
    const findLogsId = await this.prisma.actionLog.findUnique({
      where: { id: logsId },
    });
    if (!findLogsId) throw new NotFoundException('Log is not found.');

    await this.prisma.actionLog.delete({ where: { id: logsId } });

    return { id: logsId, message: 'Logs are deleted.' };
  }

  //STATISTIKE I AGREGATI()-admin only
  //agregati = matematičke funkcije koje daju sumu/prosek/broj/grupu → statistika je praktična primena agregata da sumiraš podatke.
  //agregati se pisu sa crticom _count, _sum ...itd

  //STATISTIKA BROJ AKCIJA PO KORISNIKU
  async getActionCountPerUser(
    limit = 10,
  ): Promise<{ userId: string; count: number }[]> {
    const stats = await this.prisma.actionLog.groupBy({
      by: ['userId'], //grupise sve logove po userId
      _count: { _all: true }, //prebrojava sve logove u svakoj grupi
    });

    return stats
      .map((s) => ({ userId: s.userId, count: s._count._all }))
      .sort((a, b) => b.count - a.count) //sortira rezultate silazno po broju logova
      .slice(0, limit);
  }

  //STATISTIKA BROJ AKCIJA PO TIPU AKCIJE
  async getActionCountPerActionType(
    limit = 10,
  ): Promise<{ action: string; count: number }[]> {
    const stats = await this.prisma.actionLog.groupBy({
      by: ['action'],
      _count: { _all: true },
    });

    return stats
      .map((s) => ({ action: s.action, count: s._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  //STATISTIKA BROJ AKCIJA PO TIPU KOMPONENTNE
  async getActionCountPerComponent(limit = 10): Promise<
    {
      component: string;
      count: number;
    }[]
  > {
    const stats = await this.prisma.actionLog.groupBy({
      by: ['component'],
      _count: { _all: true },
    });

    return stats
      .map((s) => ({ component: s.component, count: s._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  //STATISTIKA BROJ AKCIJA PO URL-U
  async getActionCountPerUrl(
    limit = 10,
  ): Promise<{ url: string; count: number }[]> {
    const stats = await this.prisma.actionLog.groupBy({
      by: ['url'],
      _count: { _all: true },
    });

    return stats
      .map((s) => ({ url: s.url, count: s._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  //STATISTIKA ZA SVE
  async getAllStats(limit = 10): Promise<{
    perUser: { userId: string; count: number }[];
    perAction: { action: string; count: number }[];
    perComponent: { component: string; count: number }[];
    perUrl: { url: string; count: number }[];
  }> {
    const perUser = await this.getActionCountPerUser(limit);
    const perAction = await this.getActionCountPerActionType(limit);
    const perComponent = await this.getActionCountPerComponent(limit);
    const perUrl = await this.getActionCountPerUrl(limit);
    return {
      perUser,
      perAction,
      perComponent,
      perUrl,
    };
  }
}
