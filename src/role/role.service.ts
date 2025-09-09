import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role-dto';
import { Role } from 'generated/prisma';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async createRole(dto: CreateRoleDto, currentUserId: string): Promise<Role> {
    // dohvat trenutnog user-a sa rolama
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: currentUserId }, //dohvatamo iz baze usera
      include: { roles: true },
    });

    if (!userWithRole) throw new UnauthorizedException('User not found'); //ako za dati currentUserId nema usera->baca gresku

    //provera admin prava
    const isAdmin = userWithRole.roles.some((r) => r.name === 'admin');
    if (!isAdmin)
      throw new UnauthorizedException('Only admins can create roles');

    // kreiranje nove role
    const newRole = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    return newRole;
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    return role;
  }

  async removeRole(id: string): Promise<{ id: string; message: string }> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    await this.prisma.role.delete({
      where: { id },
    });
    return { id, message: 'Role delete successfully.' };
  }
}
