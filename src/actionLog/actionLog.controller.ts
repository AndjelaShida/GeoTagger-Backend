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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/decoration/role.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ActionType, ComponentType } from 'generated/prisma';
import { FilterLogsDto } from './dto/filterLogs.dto';
import { ActionLogService } from './actionLog.service';

@ApiTags('actionlog')
@Controller('actionlog')
export class ActionLogController {
  constructor(
    private prisma: PrismaService,
    private actionLogService: ActionLogService,
  ) {}

  @ApiOperation({ summary: 'Get last 100 logs' })
  @ApiResponse({ status: 200, description: 'Returns last 100 logs' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admin can see logs.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('last-100')
  async getLast100Log(@CurrentUser() user) {
    return this.actionLogService.getLast100Log(user.id);
  }

  @ApiOperation({ summary: 'Get logs per user' })
  @ApiResponse({ status: 200, description: 'Returns logs per user' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get('user')
  async getLogsPerUser(
    @CurrentUser() user,
    @Query('action') action?: ActionType,
    @Query('component') component?: ComponentType,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.actionLogService.getLogsPerUser(
      user.id,
      action,
      component,
      Number(page),
      Number(pageSize),
    );
  }

  @ApiOperation({ summary: 'Get filter logs' })
  @ApiResponse({ status: 200, description: 'Returns filter logs' })
  @Get('filter')
  async getFilterLogs(
    @Query() dto: FilterLogsDto,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.actionLogService.getFilterLogs(
      dto,
      Number(page),
      Number(pageSize),
    );
  }

  @ApiOperation({ summary: 'Delete logs by id' })
  @ApiResponse({ status: 200, description: 'Log deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Logs not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admin can delete logs.',
  })
  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete(':logsId')
  async deleteLogs(@Param('logsId') logsId: string) {
    return this.actionLogService.deleteLogs(logsId);
  }

  @ApiOperation({ summary: 'Get statistic logs per user' })
  @ApiResponse({ status: 200, description: 'Returns actions count per user' })
  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('per-user')
  async getActionCountPerUser(@Query('limit') limit = 10) {
    return this.actionLogService.getActionCountPerUser(Number(limit));
  }

  @ApiOperation({ summary: 'Get statistic logs per action' })
  @ApiResponse({ status: 200, description: 'Returns logs per action ' })
  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('per-action')
  async getActionCountPerActionType(@Query('limit') limit = 10) {
    return this.actionLogService.getActionCountPerActionType(Number(limit));
  }

  @ApiOperation({ summary: 'Get statistic logs per component' })
  @ApiResponse({ status: 200, description: 'Returns logs per component' })
  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('per-component')
  async getActionCountPerComponent(@Query('limit') limit = 10) {
    return this.actionLogService.getActionCountPerComponent(Number(limit));
  }

  @ApiOperation({ summary: 'Get statistic logs per url' })
  @ApiResponse({ status: 200, description: 'Returns logs per url' })
  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('per-url')
  async getActionCountPerUrl(@Query('limit') limit = 10) {
    return this.actionLogService.getActionCountPerUrl(Number(limit));
  }

  @ApiOperation({ summary: 'Get statistic per all' })
  @ApiResponse({ status: 200, description: 'Returns all statistic' })
  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('stats/all')
  async getAllStats() {
    return this.actionLogService.getAllStats();
  }
}
