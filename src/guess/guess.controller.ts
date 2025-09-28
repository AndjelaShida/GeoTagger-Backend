import { Controller, Get, Param, Query } from '@nestjs/common';
import { CurrentUser } from 'src/decoration/current-user.decoration';
import { PaginationDto } from 'src/modules/auth/dto/paginationDto.dto';
import { GuessService } from './guess.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('guess')
@Controller()
export class GuessController {
  constructor(private guessService: GuessService) {}

  @ApiOperation({
    summary: 'Get paginated guess history fot the current user.',
  })
  @ApiResponse({ status: 200, description: 'Returns paginated guess history.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get('guess-history')
  async getAllGuessLocation(@CurrentUser() user, @Query() dto: PaginationDto) {
    return this.guessService.getAllGuessLocation(user.sub, dto.page, dto.limit);
  }

  @ApiOperation({ summary: 'Get top 10 users by points.' })
  @ApiResponse({ status: 200, description: ' Returns top 10 users' })
  @Get('top-users')
  async GetTopUserByPoints() {
    return this.guessService.getTopUserByPoints();
  }
}
