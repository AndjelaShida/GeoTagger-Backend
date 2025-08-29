import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { ValidateUserDto } from 'src/user/dto/validate-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
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
    return this.authService.register(dto);
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
