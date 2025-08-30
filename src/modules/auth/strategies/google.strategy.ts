//Google strategy obradjuje podatke koje dobija od Google OAuth.a
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:'http://localhost:3000/auth/google/callback',
            scope: ['email', 'profile'], //scope odredjuje koje podatke trazim od korisnika
        });
    }
    async validate(
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: VerifyCallback,
): Promise<any> {
  const { name, emails, photos } = profile;
  const user = {
    email: emails[0].value,
    firstName: name.givenName,
    lastName: name.familyName,
    picture: photos[0].value,
    accessToken,
    refreshToken,
  };
  done(null, user);
}
}