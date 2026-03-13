import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { UserWordsService } from './user-words.service';

@Controller('user-words')
@UseGuards(SupabaseAuthGuard)
export class UserWordsController {
  constructor(private userWordsService: UserWordsService) {}

  @Get()
  findByLevel(@CurrentUser() user: AuthUser, @Query('level') level = '1') {
    return this.userWordsService.findByLevel(user.id, parseInt(level, 10));
  }

  @Post()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body() body: { word_id: string; status: 'learn' | 'known' },
  ) {
    return this.userWordsService.upsert(user.id, body.word_id, body.status);
  }

  @Patch(':id/review')
  review(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { correct: boolean },
  ) {
    return this.userWordsService.review(id, user.id, body.correct);
  }

  @Get('session')
  getSession(
    @CurrentUser() user: AuthUser,
    @Query('limit') limit = '20',
  ) {
    return this.userWordsService.getSession(user.id, parseInt(limit, 10));
  }
}
