import { Controller } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Controller()
export class LocationController {
    constructor(
        private prisma: PrismaService
    ) {}
}