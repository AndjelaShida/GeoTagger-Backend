import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ActionLog, ActionType, ComponentType } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

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

  //FILTRIRANJE PO TIPU AKCIJE(click, scroll, input, change)
  //FILTRIRANJE PO TIPNU KOMPONENTE(button,link,input)
  //FILTRIRANJE PO NEW VALUE
  //FILTRIRANJE PO URL LOKACIJI
  //ADMIN MOZE BRISATI LOGOVE-admin only
  //STATISTIKE I AGREGATI(br akcija po korsiniku, po tipu itd..)-admin only
}
