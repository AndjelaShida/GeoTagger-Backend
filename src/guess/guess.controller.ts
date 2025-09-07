import { Controller, Get, Param, Query } from '@nestjs/common';
import { CurrentUser } from 'src/decoration/current-user.decoration';
import { PaginationDto } from 'src/modules/auth/dto/paginationDto.dto';
import { GuessService } from './guess.service';

@Controller()
export class GuessController {
  constructor(private guessService: GuessService) {}

  @Get('guess-history')
  async getAllGuessLocation(@CurrentUser() user, @Query() dto: PaginationDto) {
    return this.guessService.getAllGuessLocation(user.sub, dto.page, dto.limit);
  }
}
