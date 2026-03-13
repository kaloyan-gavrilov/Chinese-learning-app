import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface StoryWord {
  hanzi: string;
  pinyin: string;
  meaning: string;
  isPunctuation?: boolean;
}

export interface StorySentence {
  words: StoryWord[];
  translation: string;
}

export interface StoryChapter {
  id: string;
  title: string;
  titlePinyin: string;
  sentences: StorySentence[];
}

export interface StorySummary {
  id: string;
  slug: string;
  title: string;
  title_pinyin: string;
  description: string;
  hsk_level: number;
  tags: string[];
  chapter_count: number;
}

export interface Story extends StorySummary {
  chapters: StoryChapter[];
}

@Injectable()
export class StoriesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(level?: number): Promise<StorySummary[]> {
    let query = this.supabase
      .getClient()
      .from('stories')
      .select('id, slug, title, title_pinyin, description, hsk_level, tags, chapters')
      .order('hsk_level', { ascending: true })
      .order('created_at', { ascending: true });

    if (level) {
      query = query.eq('hsk_level', level);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row['id'] as string,
      slug: row['slug'] as string,
      title: row['title'] as string,
      title_pinyin: row['title_pinyin'] as string,
      description: row['description'] as string,
      hsk_level: row['hsk_level'] as number,
      tags: (row['tags'] as string[]) ?? [],
      chapter_count: ((row['chapters'] as StoryChapter[]) ?? []).length,
    }));
  }

  async findOne(slug: string): Promise<Story> {
    const { data, error } = await this.supabase
      .getClient()
      .from('stories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) throw new NotFoundException(`Story "${slug}" not found`);

    const row = data as Record<string, unknown>;
    return {
      id: row['id'] as string,
      slug: row['slug'] as string,
      title: row['title'] as string,
      title_pinyin: row['title_pinyin'] as string,
      description: row['description'] as string,
      hsk_level: row['hsk_level'] as number,
      tags: (row['tags'] as string[]) ?? [],
      chapter_count: ((row['chapters'] as StoryChapter[]) ?? []).length,
      chapters: (row['chapters'] as StoryChapter[]) ?? [],
    };
  }
}
