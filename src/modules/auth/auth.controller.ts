import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from './strategies/guardStrategies/google-oauth.guard';
import { FacebookAuthGuard } from './strategies/guardStrategies/facebook-oauth.guard';
import { InstagramAuthGuard } from './strategies/guardStrategies/instagram-oauth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: UserRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('auth/forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('validateUser')
  async validateUser(@Body() dto: UserLoginDto) {
    return this.authService.validateUser(dto);
  }

  @Get('google') //ovaj endpoint vodi korisnika na google oauth stranu
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  // ---------- GOOGLE ----------//
  @Get('google/callback') //calback endpoint koji dobija podatke i vraca JWT
  @UseGuards(GoogleAuthGuard)
  googleLoginCallback(@Req() req) {
    return this.authService.loginWithOAuth({
      provider: 'google',
      providerId: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
    });
  }

  // ---------- FACEBOOK ----------//
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  facebookLoginCallback(@Req() req) {
    const oauthData = {
      provider: 'facebook',
      providerId: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
    };
    return this.authService.loginWithOAuth(oauthData);
  }

  // ---------- INSTAGRAM ----------//
  @Get('instagram')
  @UseGuards(InstagramAuthGuard)
  instagramLogin() {}

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  instagramLoginCallback(@Req() req) {
    const oauthData = {
      provider: 'facebook',
      providerId: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
    };
    return this.authService.loginWithOAuth(oauthData);
  }
}
