import { Global, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Global()
@Module({
  controllers: [UserController], //API endpointi za User
  providers: [UserService], //logika modula
})
export class UserModule {}
