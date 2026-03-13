import { Controller, Get, Param, Query } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
  constructor(private wordsService: WordsService) {}

  @Get()
  findAll(
    @Query('level') level = '1',
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.wordsService.findAll(
      parseInt(level, 10),
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wordsService.findOne(id);
  }
}
