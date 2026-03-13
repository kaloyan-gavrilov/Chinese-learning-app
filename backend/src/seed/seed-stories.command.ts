/**
 * Seed script — upserts all stories from data/stories.json into Supabase.
 *
 * Run with:
 *   npm run seed:stories
 *
 * Prerequisites:
 *   1. Run the SQL migration first: data/migrations/001_stories.sql
 *   2. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { SupabaseService } from '../supabase/supabase.service';
import * as fs from 'fs';
import * as path from 'path';

interface StoryRecord {
  id: string;
  title: string;
  titlePinyin: string;
  description: string;
  hsk_level: number;
  tags: string[];
  chapters: unknown[];
}

async function bootstrap() {
  const logger = new Logger('SeedStories');
  const app = await NestFactory.createApplicationContext(AppModule);
  const supabase = app.get(SupabaseService);

  try {
    const dataPath = path.resolve(__dirname, '..', '..', '..', 'data', 'stories.json');

    if (!fs.existsSync(dataPath)) {
      logger.error(`stories.json not found at ${dataPath}`);
      logger.error('Generate it by running: node scripts/export-stories.mjs');
      process.exit(1);
    }

    const raw = fs.readFileSync(dataPath, 'utf-8');
    const stories: StoryRecord[] = JSON.parse(raw);

    logger.log(`Upserting ${stories.length} stories…`);

    for (const story of stories) {
      const record = {
        slug:        story.id,          // "id" in the TS data becomes the slug
        title:       story.title,
        title_pinyin: story.titlePinyin,
        description: story.description,
        hsk_level:   story.hsk_level,
        tags:        story.tags,
        chapters:    story.chapters,    // JSONB — stored as-is
      };

      const { error } = await supabase
        .getClient()
        .from('stories')
        .upsert(record, { onConflict: 'slug' });

      if (error) {
        logger.error(`Failed to upsert "${story.id}": ${error.message}`);
        throw error;
      }

      logger.log(`  ✓ ${story.id} (HSK ${story.hsk_level})`);
    }

    logger.log('All stories seeded successfully.');
  } catch (err) {
    logger.error('Seed failed', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
