import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LocationService{
    constructor(
        private prisma: PrismaService
    ) {}
}


// ///location

// Return list of latest locations (you can add pagination)

// /location/random

// Return random location

// /location

// Create location

// /location/guess/:id

// Guess the location lat/lon