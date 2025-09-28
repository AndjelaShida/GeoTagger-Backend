import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/decoration/current-user.decoration';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/decoration/role.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ActionType, ComponentType } from 'generated/prisma';
import { FilterLogsDto } from './dto/filterLogs.dto';
import { ActionLogService } from './actionLog.service';

@ApiTags('actionlog')
@Controller('actionlog')
export class ActionLogController {
  actionLogService: any;
  constructor(
    private prisma: PrismaService,
    private actionLog: ActionLogService,
  ) {}

  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('last-100')
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

  @Get('filter')
  async getFilterLogs(@Query() dto: FilterLogsDto) {
    return this.actionLogService.getFilterLogs(dto);
  }

  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete(':logsId')
  async deleteLogs(@Param('logsId') logsId: string) {
    return this.actionLogService.deleteLog(logsId);
  }

  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('per-user')
  async getActionCountPerUser() {
    return this.actionLogService.getActionCountPerUser();
  }

  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('per-action')
  async getActionCountPerActionType() {
    return this.actionLogService.getActionCountPerActionType();
  }

  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('per-component')
  async getActionCountPerComponent() {
    return this.actionLogService.getActionCountPerComponent();
  }

  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('per-url')
  async getActionCountPerUrl() {
    return this.actionLogService.getActionCountPerUrl();
  }

  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('stats/all')
  async getAllStats() {
    return this.actionLogService.getAllStats();
  }
}
