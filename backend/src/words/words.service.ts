import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Word {
  id: string;
  hsk_level: number;
  hanzi: string;
  pinyin: string;
  meaning: string;
  created_at: string;
}

@Injectable()
export class WordsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(level: number, page: number, limit: number): Promise<{ data: Word[]; total: number }> {
    const offset = (page - 1) * limit;
    const client = this.supabase.getClient();

    const { count } = await client
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('hsk_level', level);

    const { data, error } = await client
      .from('words')
      .select('*')
      .eq('hsk_level', level)
      .order('hanzi', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data: data as Word[], total: count ?? 0 };
  }

  async findOne(id: string): Promise<Word> {
    const { data, error } = await this.supabase
      .getClient()
      .from('words')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Word not found');

    return data as Word;
  }
}
