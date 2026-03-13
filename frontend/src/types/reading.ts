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

export interface Story {
  id: string;
  title: string;
  titlePinyin: string;
  description: string;
  hsk_level: 1 | 2 | 3 | 4 | 5 | 6;
  tags: ('short' | 'long' | 'family' | 'school' | 'daily-life' | 'travel' | 'work' | 'culture')[];
  chapters: StoryChapter[];
}
