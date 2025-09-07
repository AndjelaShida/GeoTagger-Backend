import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Global()
@Module({
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
