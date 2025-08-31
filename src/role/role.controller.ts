import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role-dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';
import { Roles } from 'src/decoration/role.decorator';
import { RoleEnum } from './role.enum';

@UseGuards(JwtAuthGuard)
@Roles(RoleEnum.ADMIN)
@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createRole(@Body() dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: dto,
    });
  }

  @Get()
  async findAll() {
    return this.prisma.role.findMany({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string ) {
    return this.prisma.role.findUnique({
        where: { id: parseInt(id, 10) },
    })
  }

  @Delete(':id')
  async remove(
   @Param('id') id: string
  ) {
    return this.prisma.role.delete({
        where: { id: parseInt(id, 10) }
    })
  }
}
