import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
    constructor(
        private configService: ConfigService
    ) {
        super({
            accessType: 'ofline',
        })
    }
}