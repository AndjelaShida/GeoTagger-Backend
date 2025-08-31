import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role-dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async createRole(dto: CreateRoleDto) {
    //provera da li postoji uloga sa istim imenom
    const existingRole = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });
    if (existingRole) {
      throw new BadRequestException('Role already exist');
    }
    //kreiranje nove role
    const newRole = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
    return newRole;
  }

  async findAll() {
    return this.prisma.role.findMany();
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    return role;
  }

  async removeRole(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
