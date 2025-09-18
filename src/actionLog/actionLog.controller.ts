import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/decoration/current-user.decoration';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActionLogModule } from './actionLog.module';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/decoration/role.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ActionType, ComponentType } from 'generated/prisma';
import { ActionTypeDto } from './dto/actionTypeDto.dto';
import { ComponentTypeDto } from './dto/componentTypeDto.dto';

@ApiTags('actionlog')
@Controller('actionlog')
export class ActionLogController {
  actionLogService: any;
  constructor(
    private prisma: PrismaService,
    private actionLog: ActionLogModule,
  ) {}

  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('actionLog/last-100')
  async getLast100Log(@CurrentUser() user) {
    return this.actionLogService.getLast100Log(user.id);
  }

  @Get('actionlog')
  async getLogsPerUser(
    @CurrentUser() user,
    @Query('action') action?: ActionType,
    @Query('component') component?: ComponentType,
  ) {
    return this.actionLogService.getLogsPerUser(user.id, action, component);
  }

  @Get('actionlog/action')
  async getActionType(dto: ActionTypeDto) {
    return this.actionLogService.getActionType(dto);
  }

  @Get('actionlog/component')
  async getComponentType(dto: ComponentTypeDto) {
    return this.actionLogService.getComponentType(dto);
  }
}
