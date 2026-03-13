import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  /** GET /stories?level=1  — list stories (no chapters content, lightweight) */
  @Get()
  findAll(@Query('level') level?: string) {
    return this.storiesService.findAll(level ? parseInt(level, 10) : undefined);
  }

  /** GET /stories/:slug  — full story including all chapters & sentences */
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.storiesService.findOne(slug);
  }
}
