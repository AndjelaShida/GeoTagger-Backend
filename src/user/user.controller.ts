import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { CurrentUser } from 'src/decoration/current-user.decoration';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'generated/prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/role/role.guard';
import { RoleEnum } from 'src/role/role.enum';
import { Roles } from 'src/decoration/role.decorator';

@ApiTags('user')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('getProfile')
  async getProfile(
    @Query('username') username?: string,
    @Query('email') email?: string,
  ) {
    return this.userService.getProfile(username, email);
  }

  @Put('update')
  async update(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.update(user, dto);
  }

  @Get('user/points')
  async getPoints(@Req() req) {
    return this.userService.getPoints(req.user.id);
  }

  @Get('user/location')
  async getLocation(@Query('page') page, @Query('limit') limit) {
    const pageNumber = page ? parseInt(page, 10) : undefined; //ako page postoji, raid ono pre : , ako ne postoji uzmi vrednost posle :
    const limitNumber = limit ? parseInt(limit, 10) : undefined;

    return this.userService.getLocations(pageNumber, limitNumber);
  }

  @UseGuards(RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.userService.removeUser(id, user);
  }
}
