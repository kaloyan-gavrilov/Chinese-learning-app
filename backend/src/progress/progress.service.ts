import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface LevelProgress {
  level: number;
  total: number;
  known: number;
  learn: number;
  mastered: number;
}

@Injectable()
export class ProgressService {
  constructor(private supabase: SupabaseService) {}

  async getProgress(userId: string): Promise<LevelProgress[]> {
    const client = this.supabase.getClient();
    const levels = [1, 2, 3, 4];
    const progress: LevelProgress[] = [];

    for (const level of levels) {
      const { count: total } = await client
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('hsk_level', level);

      const { data: userWords } = await client
        .from('user_words')
        .select('status, words!inner(hsk_level)')
        .eq('user_id', userId)
        .eq('words.hsk_level', level);

      const items = userWords ?? [];
      const known = items.filter(
        (w: Record<string, unknown>) => w.status === 'known',
      ).length;
      const learn = items.filter(
        (w: Record<string, unknown>) => w.status === 'learn',
      ).length;
      const mastered = items.filter(
        (w: Record<string, unknown>) => w.status === 'mastered',
      ).length;

      progress.push({
        level,
        total: total ?? 0,
        known: known + mastered,
        learn,
        mastered,
      });
    }

    return progress;
  }
}
