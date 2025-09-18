import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActionLog, ActionType, ComponentType } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActionTypeDto } from './dto/actionTypeDto.dto';
import { ComponentTypeDto } from './dto/componentTypeDto.dto';
import { FilterLogsDto } from './dto/filterLogs.dto';
import { Action } from 'generated/prisma/runtime/library';
import { ApiBadGatewayResponse } from '@nestjs/swagger';

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
    //trazenje lokacija, greska ako je nema, provera vlasnistva
    const findLogsId = await this.prisma.actionLog.findUnique({
      where: { id: logsId },
    });
    if (!findLogsId) throw new NotFoundException('Log is not found.');

    await this.prisma.actionLog.delete({ where: { id: logsId } });

    return { id: logsId, message: 'Logs are deleted.' };
  }

  //STATISTIKE I AGREGATI(br akcija po korsiniku, po tipu itd..)-admin only
}
