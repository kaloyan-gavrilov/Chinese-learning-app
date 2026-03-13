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

    // 1. Words due for review (learn status, overdue)
    const { data: dueLearn, error: dueError } = await this.supabase
      .getClient()
      .from('user_words')
      .select('*, words(*)')
      .eq('user_id', userId)
      .eq('status', 'learn')
      .lte('next_review_at', now)
      .order('next_review_at', { ascending: true })
      .limit(limit);

    if (dueError) throw dueError;

    let remaining = limit - (dueLearn?.length ?? 0);
    let knownDue: StudyCard[] = [];

    // 2. Known/mastered words due for review (periodic reinforcement)
    if (remaining > 0) {
      const knownLimit = Math.max(3, Math.ceil(limit * 0.2)); // ~20% of session, min 3
      const { data, error } = await this.supabase
        .getClient()
        .from('user_words')
        .select('*, words(*)')
        .eq('user_id', userId)
        .in('status', ['known', 'mastered'])
        .lte('next_review_at', now)
        .order('next_review_at', { ascending: true })
        .limit(Math.min(knownLimit, remaining));

      if (error) throw error;
      knownDue = (data ?? []) as unknown as StudyCard[];
      remaining -= knownDue.length;
    }

    // 3. Learn words not yet due (fill remaining slots)
    let newWords: StudyCard[] = [];
    if (remaining > 0) {
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

    const allCards = [
      ...(dueLearn ?? []),
      ...knownDue,
      ...newWords,
    ] as unknown as StudyCard[];

    return this.shuffle(allCards);
  }

  /**
   * Get distractor words for exercises (matching, multiple choice).
   * Returns random words from the same HSK level that are NOT in the target set.
   */
  async getDistractors(
    userId: string,
    wordIds: string[],
    count: number,
  ): Promise<StudyCard['words'][]> {
    if (wordIds.length === 0) return [];

    // Get the HSK levels of the target words
    const { data: targetWords, error: twError } = await this.supabase
      .getClient()
      .from('words')
      .select('hsk_level')
      .in('id', wordIds);

    if (twError) throw twError;

    const levels = [...new Set((targetWords ?? []).map((w: { hsk_level: number }) => w.hsk_level))];

    // Get random words from the same levels, excluding target words
    const { data, error } = await this.supabase
      .getClient()
      .from('words')
      .select('id, hsk_level, hanzi, pinyin, meaning')
      .in('hsk_level', levels)
      .not('id', 'in', `(${wordIds.join(',')})`)
      .limit(count * 3); // fetch extra to allow shuffling

    if (error) throw error;

    return this.shuffle(data ?? []).slice(0, count) as StudyCard['words'][];
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
