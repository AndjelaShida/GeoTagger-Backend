import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { ValidateUserDto } from 'src/user/dto/dto-validateUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    const user = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() dto: UserRegisterDto) {
    return this.authService.register(dto.username, dto.password, dto.email);
  }

  @Post('auth/forgot-password')
  async forgotPassword(@Body('email') email:string) {
    return this.authService.forgotPassword(email);
}

@Post('validateUser')
async validateUser(@Body() dto: ValidateUserDto) {
return this.authService.validateUser(dto.email, dto.password);
}


}
