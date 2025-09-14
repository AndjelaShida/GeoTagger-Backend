import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActionLogService {
  constructor(private prisma: PrismaService) {}

  //ADMIN MOZE DA VIDI POSLEDNJIH 100 LOGOVA-admin only
async getLast100Log()




  //LOGOVI PO KORINSIKU
  //FILTRIRANJE PO TIPU AKCIJE(click, scroll, input, change)
  //FILTRIRANJE PO TIPNU KOMPONENTE(button,link,input)
  //FILTRIRANJE PO NEW VALUE
  //FILTRIRANJE PO URL LOKACIJI
  //ADMIN MOZE BRISATI LOGOVE-admin only
  //STATISTIKE I AGREGATI(br akcija po korsiniku, po tipu itd..)-admin only
}
