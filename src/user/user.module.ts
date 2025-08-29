
import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module ({
    imports: [PrismaModule], //uvozimo PrismaModule da dobijemo PrismaService
    controllers: [UserController], //API endpointi za User
    providers: [UserService], //logika modula
  
})

export class UserModule {} ;