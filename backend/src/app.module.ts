import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { WordsModule } from './words/words.module';
import { UserWordsModule } from './user-words/user-words.module';
import { ProgressModule } from './progress/progress.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    WordsModule,
    UserWordsModule,
    ProgressModule,
    SeedModule,
  ],
})
export class AppModule {}
