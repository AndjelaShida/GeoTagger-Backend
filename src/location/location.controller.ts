import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { LocationQueryDto } from "./dto/locationQuery.dto";
import { LocationService } from "./location.service";
import { CreateLocationDto } from "./dto/create-location.dto";

@Controller()
export class LocationController {
    constructor(
        private locationService: LocationService,
    ) {}

    @Post('createLocation')
    async createNewLocation(@Body() dto: CreateLocationDto, userId: string) {
        return this.locationService.createNewLocation(dto,userId);
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
}