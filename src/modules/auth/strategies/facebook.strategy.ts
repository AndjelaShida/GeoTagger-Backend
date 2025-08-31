import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-facebook";

// Definisemo VerifyCallback tip lokalno
type VerifyCallback = (err: any, user?: any, info?: any) => void;

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor() {
        super({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/facebook/callback',
            scope: ['email', 'public_profile'], 
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
            email: emails?.[0]?.value || null,
            firstName: name?.givenName || '',
            lastName: name?.familyName || '',
            picture: photos?.[0]?.value || '',
            accessToken,
            refreshToken,
        };

        done(null, user);
    }
}
