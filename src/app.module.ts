import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import * as path from 'path';
import { UserModule } from './user/user.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(
        process.cwd(), //osigurava da trazi env fajl u root folderu
        process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
      ),
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    LocationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
