import type { Word } from './word';

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
  words: Word;
  mode: 'hanzi-to-meaning' | 'meaning-to-hanzi';
}
