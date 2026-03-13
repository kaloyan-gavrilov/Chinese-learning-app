import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as fs from 'fs';
import * as path from 'path';

interface SeedWord {
  hanzi: string;
  pinyin: string;
  meaning: string;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private supabase: SupabaseService) {}

  async seed(): Promise<void> {
    const dataDir = path.resolve(__dirname, '..', '..', '..', 'data');

    for (let level = 1; level <= 6; level++) {
      const filePath = path.join(dataDir, `hsk${level}.json`);

      if (!fs.existsSync(filePath)) {
        this.logger.warn(`File not found: ${filePath}, skipping HSK ${level}`);
        continue;
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const words: SeedWord[] = JSON.parse(raw);

      this.logger.log(`Seeding HSK ${level}: ${words.length} words`);

      // Batch upsert in chunks of 100
      const chunkSize = 100;
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).map((w) => ({
          hsk_level: level,
          hanzi: w.hanzi,
          pinyin: w.pinyin,
          meaning: w.meaning,
        }));

        const { error } = await this.supabase
          .getClient()
          .from('words')
          .upsert(chunk, { onConflict: 'hsk_level,hanzi' });

        if (error) {
          this.logger.error(`Error seeding HSK ${level} chunk ${i}: ${error.message}`);
          throw error;
        }
      }

      this.logger.log(`HSK ${level} seeded successfully`);
    }

    this.logger.log('All HSK levels seeded');
  }
}
