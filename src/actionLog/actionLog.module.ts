import { Module } from '@nestjs/common';
import { ActionLogController } from './actionLog.controller';
import { ActionLogService } from './actionLog.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActionLogController],
  providers: [ActionLogService],
  exports: [ActionLogService],
})
export class ActionLogModule {}
