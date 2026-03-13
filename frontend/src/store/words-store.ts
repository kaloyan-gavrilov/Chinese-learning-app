import { create } from 'zustand';
import { api } from '../lib/api';
import type { Word } from '../types/word';
import type { UserWord } from '../types/user-word';
import type { LevelProgress } from '../types/progress';

interface WordsState {
  words: Word[];
  wordsTotal: number;
  userWords: UserWord[];
  progress: LevelProgress[];
  loading: boolean;
  fetchWords: (level: number, page?: number, limit?: number) => Promise<void>;
  fetchUserWords: (level: number) => Promise<void>;
  fetchProgress: () => Promise<void>;
  markWord: (wordId: string, status: 'learn' | 'known') => Promise<void>;
}

export const useWordsStore = create<WordsState>((set, get) => ({
  words: [],
  wordsTotal: 0,
  userWords: [],
  progress: [],
  loading: false,

  fetchWords: async (level: number, page = 1, limit = 200) => {
    set({ loading: true });
    const result = await api.get<{ data: Word[]; total: number }>(
      `/words?level=${level}&page=${page}&limit=${limit}`,
    );
    set({ words: result.data, wordsTotal: result.total, loading: false });
  },

  fetchUserWords: async (level: number) => {
    const result = await api.get<UserWord[]>(`/user-words?level=${level}`);
    set({ userWords: result });
  },

  fetchProgress: async () => {
    const result = await api.get<LevelProgress[]>('/progress');
    set({ progress: result });
  },

  markWord: async (wordId: string, status: 'learn' | 'known') => {
    const result = await api.post<UserWord>('/user-words', {
      word_id: wordId,
      status,
    });

    // Optimistic update
    const existing = get().userWords;
    const idx = existing.findIndex((uw) => uw.word_id === wordId);
    if (idx >= 0) {
      const updated = [...existing];
      updated[idx] = result;
      set({ userWords: updated });
    } else {
      set({ userWords: [...existing, result] });
    }
  },
}));
