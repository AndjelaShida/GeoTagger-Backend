//instagram is just demo!
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook'; // koristi isti kao Facebook demo

@Injectable()
export class InstagramStrategy extends PassportStrategy(Strategy, 'instagram') {
  constructor() {
    super({
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/instagram/callback',
      scope: ['email', 'public_profile'], // demo scope
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
