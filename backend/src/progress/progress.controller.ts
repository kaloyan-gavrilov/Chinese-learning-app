import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(SupabaseAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get()
  getProgress(@CurrentUser() user: AuthUser) {
    return this.progressService.getProgress(user.id);
  }
}
