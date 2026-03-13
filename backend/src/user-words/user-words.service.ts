import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { calculateNextReview } from './spaced-repetition';

export interface UserWord {
  id: string;
  user_id: string;
  word_id: string;
  status: 'learn' | 'known' | 'mastered';
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  updated_at: string;
}

export interface StudyCard {
  id: string;
  user_id: string;
  word_id: string;
  status: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  words: {
    id: string;
    hsk_level: number;
    hanzi: string;
    pinyin: string;
    meaning: string;
  };
}

@Injectable()
export class UserWordsService {
  constructor(private supabase: SupabaseService) {}

  async findByLevel(userId: string, level: number): Promise<UserWord[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('user_words')
      .select('*, words!inner(hsk_level)')
      .eq('user_id', userId)
      .eq('words.hsk_level', level);

    if (error) throw error;
    return data as unknown as UserWord[];
  }

  async upsert(
    userId: string,
    wordId: string,
    status: 'learn' | 'known',
  ): Promise<UserWord> {
    const { data, error } = await this.supabase
      .getClient()
      .from('user_words')
      .upsert(
        {
          user_id: userId,
          word_id: wordId,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,word_id' },
      )
      .select()
      .single();

    if (error) throw error;
    return data as UserWord;
  }

  async review(id: string, userId: string, correct: boolean): Promise<UserWord> {
    const { data: existing, error: fetchError } = await this.supabase
      .getClient()
      .from('user_words')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existing) throw new NotFoundException('User word not found');

    const current = existing as UserWord;
    const next = calculateNextReview(
      {
        easeFactor: current.ease_factor,
        intervalDays: current.interval_days,
        repetitions: current.repetitions,
        status: current.status,
        nextReviewAt: new Date(current.next_review_at),
      },
      correct,
    );

    const { data, error } = await this.supabase
      .getClient()
      .from('user_words')
      .update({
        ease_factor: next.easeFactor,
        interval_days: next.intervalDays,
        repetitions: next.repetitions,
        status: next.status,
        next_review_at: next.nextReviewAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as UserWord;
  }

  async getSession(userId: string, limit: number): Promise<StudyCard[]> {
    const now = new Date().toISOString();

    // First: words due for review
    const { data: dueWords, error: dueError } = await this.supabase
      .getClient()
      .from('user_words')
      .select('*, words(*)')
      .eq('user_id', userId)
      .eq('status', 'learn')
      .lte('next_review_at', now)
      .order('next_review_at', { ascending: true })
      .limit(limit);

    if (dueError) throw dueError;

    const remaining = limit - (dueWords?.length ?? 0);
    let newWords: StudyCard[] = [];

    if (remaining > 0) {
      // Then: learn words not yet reviewed (next_review_at in future or just added)
      const { data, error } = await this.supabase
        .getClient()
        .from('user_words')
        .select('*, words(*)')
        .eq('user_id', userId)
        .eq('status', 'learn')
        .gt('next_review_at', now)
        .order('updated_at', { ascending: true })
        .limit(remaining);

      if (error) throw error;
      newWords = (data ?? []) as unknown as StudyCard[];
    }

    const allCards = [...(dueWords ?? []), ...newWords] as unknown as StudyCard[];

    // Shuffle within groups
    return this.shuffle(allCards);
  }

  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
