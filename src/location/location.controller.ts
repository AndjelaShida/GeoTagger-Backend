import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { LocationQueryDto } from './dto/locationQuery.dto';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { GuessLocationDto } from './dto/guessLocation.dto';
import { CurrentUser } from 'src/decoration/current-user.decoration';
import { Throttle } from '@nestjs/throttler';

@Controller()
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Post('createLocation')
  async createNewLocation(@Body() dto: CreateLocationDto, @CurrentUser() user) {
    const userId = user.sub; // user.sub uzima ID korisnika iz tokena
    return this.locationService.createNewLocation(dto, userId);
  }

  @Get('/location')
  async getLatestLocation(@Query() queryDto: LocationQueryDto) {
    return this.locationService.getLatestLocation(queryDto);
  }

  @Get('randomLocation/one')
  async getOneRandomLocation() {
    return this.locationService.getOneRandomLocation();
  }

  @Get('randomLocation/multiple')
  async getMultipleRandomLocation() {
    return this.locationService.getMultipleRandomLocation();
  }

  @Get('/location/:id')
  async getOneLocation(@CurrentUser() user, @Param('id') locationId: string) {
    return this.locationService.getOneLocation(user, locationId);
  }

  @Post('location/guess/:id')
  async guessLocation(
    @Param('id') locationId: string,
    @Body() dto: GuessLocationDto,
    @CurrentUser() user,
  ) {
    const currentUserId = user.sub;
    return this.locationService.guessLocation(locationId, dto, currentUserId);
  }

  @Delete('/location/:id')
  async deleteLocation(@Param('id') id: string, @CurrentUser() user) {
    const currentUserId = user.sub;
    return this.locationService.deleteLocation(id, user);
  }
}
