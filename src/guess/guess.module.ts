import { Global, Module } from "@nestjs/common";
import { GuessController } from "./guess.controller";
import { GuessService } from "./guess.service";

@Global()
@Module({
controllers:[GuessController],
providers:[GuessService]
})
export class GuessModule {};