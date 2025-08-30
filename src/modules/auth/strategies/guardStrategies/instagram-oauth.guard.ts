import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class InstagramAuthGuard extends AuthGuard('instagram') {
    constructor(
        private configService: ConfigService
    ) {
        super({
            accessType: 'ofline',
        })
    }
}