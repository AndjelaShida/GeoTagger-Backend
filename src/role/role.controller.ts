import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role-dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';
import { Roles } from 'src/decoration/role.decorator';
import { RoleEnum } from './role.enum';
import { RoleGuard } from './role.guard';
import { RoleService } from './role.service';
import { CurrentUser } from 'src/decoration/current-user.decoration';
import { use } from 'passport';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  async createRole(@Body() dto: CreateRoleDto, @CurrentUser() user) {
    return this.roleService.createRole(dto, user.sub);
  }

  @Get()
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roleService.removeRole(id);
  }
}
