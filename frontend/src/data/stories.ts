import type { Story } from '../types/reading';

export const stories: Story[] = [
  {
    id: 'my-home',
    title: '我的家',
    titlePinyin: 'Wǒ de Jiā',
    description: 'A young student named Xiao Ming introduces his family and their daily life at home.',
    hsk_level: 1,
    tags: ['short', 'family', 'daily-life'],
    chapters: [
      {
        id: 'family-members',
        title: '家人',
        titlePinyin: 'Jiārén — Family Members',
        sentences: [
          {
            words: [
              { hanzi: '我', pinyin: 'wǒ', meaning: 'I / me' },
              { hanzi: '叫', pinyin: 'jiào', meaning: 'am called' },
              { hanzi: '小明', pinyin: 'Xiǎo Míng', meaning: 'Xiao Ming (a name)' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'My name is Xiao Ming.',
          },
          {
            words: [
              { hanzi: '我', pinyin: 'wǒ', meaning: 'my' },
              { hanzi: '家', pinyin: 'jiā', meaning: 'family / home' },
              { hanzi: '有', pinyin: 'yǒu', meaning: 'have' },
              { hanzi: '四', pinyin: 'sì', meaning: 'four' },
              { hanzi: '个', pinyin: 'gè', meaning: '(measure word for people)' },
              { hanzi: '人', pinyin: 'rén', meaning: 'person / people' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'My family has four people.',
          },
          {
            words: [
              { hanzi: '爸爸', pinyin: 'bàba', meaning: 'dad / father' },
              { hanzi: '是', pinyin: 'shì', meaning: 'is / am / are' },
              { hanzi: '医生', pinyin: 'yīshēng', meaning: 'doctor' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'Dad is a doctor.',
          },
          {
            words: [
              { hanzi: '妈妈', pinyin: 'māma', meaning: 'mom / mother' },
              { hanzi: '很', pinyin: 'hěn', meaning: 'very' },
              { hanzi: '漂亮', pinyin: 'piàoliang', meaning: 'beautiful' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'Mom is very beautiful.',
          },
          {
            words: [
              { hanzi: '我', pinyin: 'wǒ', meaning: 'I / me' },
              { hanzi: '有', pinyin: 'yǒu', meaning: 'have' },
              { hanzi: '一', pinyin: 'yī', meaning: 'one' },
              { hanzi: '只', pinyin: 'zhī', meaning: '(measure word for animals)' },
              { hanzi: '猫', pinyin: 'māo', meaning: 'cat' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'I have a cat.',
          },
          {
            words: [
              { hanzi: '我', pinyin: 'wǒ', meaning: 'my' },
              { hanzi: '的', pinyin: 'de', meaning: "'s (possessive particle)" },
              { hanzi: '猫', pinyin: 'māo', meaning: 'cat' },
              { hanzi: '很', pinyin: 'hěn', meaning: 'very' },
              { hanzi: '小', pinyin: 'xiǎo', meaning: 'small / little' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'My cat is very small.',
          },
        ],
      },
      {
        id: 'at-home',
        title: '在家',
        titlePinyin: 'Zài Jiā — At Home',
        sentences: [
          {
            words: [
              { hanzi: '我们', pinyin: 'wǒmen', meaning: 'we / us' },
              { hanzi: '在', pinyin: 'zài', meaning: 'at / in' },
              { hanzi: '家', pinyin: 'jiā', meaning: 'home' },
              { hanzi: '吃', pinyin: 'chī', meaning: 'eat' },
              { hanzi: '饭', pinyin: 'fàn', meaning: 'meal / food' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'We eat at home.',
          },
          {
            words: [
              { hanzi: '妈妈', pinyin: 'māma', meaning: 'mom' },
              { hanzi: '做', pinyin: 'zuò', meaning: 'make / cook' },
              { hanzi: '的', pinyin: 'de', meaning: "'s (possessive particle)" },
              { hanzi: '饭', pinyin: 'fàn', meaning: 'food / meal' },
              { hanzi: '很', pinyin: 'hěn', meaning: 'very' },
              { hanzi: '好吃', pinyin: 'hǎochī', meaning: 'delicious' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'The food mom cooks is very delicious.',
          },
          {
            words: [
              { hanzi: '爸爸', pinyin: 'bàba', meaning: 'dad' },
              { hanzi: '看', pinyin: 'kàn', meaning: 'watch / look' },
              { hanzi: '电视', pinyin: 'diànshì', meaning: 'television / TV' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'Dad watches TV.',
          },
          {
            words: [
              { hanzi: '我', pinyin: 'wǒ', meaning: 'I' },
              { hanzi: '看', pinyin: 'kàn', meaning: 'read / look at' },
              { hanzi: '书', pinyin: 'shū', meaning: 'book' },
              { hanzi: '，', pinyin: '', meaning: '', isPunctuation: true },
              { hanzi: '学习', pinyin: 'xuéxí', meaning: 'study / learn' },
              { hanzi: '汉语', pinyin: 'Hànyǔ', meaning: 'Chinese language' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'I read books and study Chinese.',
          },
          {
            words: [
              { hanzi: '我们', pinyin: 'wǒmen', meaning: 'we / us' },
              { hanzi: '都', pinyin: 'dōu', meaning: 'all / both' },
              { hanzi: '很', pinyin: 'hěn', meaning: 'very' },
              { hanzi: '高兴', pinyin: 'gāoxìng', meaning: 'happy / pleased' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'We are all very happy.',
          },
        ],
      },
    ],
  },

  {
    id: 'at-school',
    title: '在学校',
    titlePinyin: 'Zài Xuéxiào',
    description: 'A student shares what it is like to study Chinese at school and introduces a new friend.',
    hsk_level: 1,
    tags: ['short', 'school', 'daily-life'],
    chapters: [
      {
        id: 'in-class',
        title: '上课',
        titlePinyin: 'Shàng Kè — In Class',
        sentences: [
          {
            words: [
              { hanzi: '我', pinyin: 'wǒ', meaning: 'I / me' },
              { hanzi: '是', pinyin: 'shì', meaning: 'am / is / are' },
              { hanzi: '学生', pinyin: 'xuésheng', meaning: 'student' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'I am a student.',
          },
          {
            words: [
              { hanzi: '我', pinyin: 'wǒ', meaning: 'I' },
              { hanzi: '在', pinyin: 'zài', meaning: 'at / in' },
              { hanzi: '学校', pinyin: 'xuéxiào', meaning: 'school' },
              { hanzi: '学习', pinyin: 'xuéxí', meaning: 'study / learn' },
              { hanzi: '汉语', pinyin: 'Hànyǔ', meaning: 'Chinese language' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'I study Chinese at school.',
          },
          {
            words: [
              { hanzi: '老师', pinyin: 'lǎoshī', meaning: 'teacher' },
              { hanzi: '很', pinyin: 'hěn', meaning: 'very' },
              { hanzi: '好', pinyin: 'hǎo', meaning: 'good / kind' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'The teacher is very good.',
          },
          {
            words: [
              { hanzi: '我', pinyin: 'wǒ', meaning: 'I' },
              { hanzi: '有', pinyin: 'yǒu', meaning: 'have' },
              { hanzi: '书', pinyin: 'shū', meaning: 'book' },
              { hanzi: '和', pinyin: 'hé', meaning: 'and' },
              { hanzi: '电脑', pinyin: 'diànnǎo', meaning: 'computer' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'I have books and a computer.',
          },
          {
            words: [
              { hanzi: '汉语', pinyin: 'Hànyǔ', meaning: 'Chinese language' },
              { hanzi: '很', pinyin: 'hěn', meaning: 'very' },
              { hanzi: '好', pinyin: 'hǎo', meaning: 'good' },
              { hanzi: '，', pinyin: '', meaning: '', isPunctuation: true },
              { hanzi: '我', pinyin: 'wǒ', meaning: 'I' },
              { hanzi: '很', pinyin: 'hěn', meaning: 'very' },
              { hanzi: '喜欢', pinyin: 'xǐhuan', meaning: 'like / enjoy' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'Chinese is great — I really like it.',
          },
        ],
      },
      {
        id: 'friends',
        title: '朋友',
        titlePinyin: 'Péngyou — Friends',
        sentences: [
          {
            words: [
              { hanzi: '我', pinyin: 'wǒ', meaning: 'I' },
              { hanzi: '有', pinyin: 'yǒu', meaning: 'have' },
              { hanzi: '一', pinyin: 'yī', meaning: 'one' },
              { hanzi: '个', pinyin: 'gè', meaning: '(measure word for people)' },
              { hanzi: '好', pinyin: 'hǎo', meaning: 'good' },
              { hanzi: '朋友', pinyin: 'péngyou', meaning: 'friend' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'I have a good friend.',
          },
          {
            words: [
              { hanzi: '他', pinyin: 'tā', meaning: 'he / him' },
              { hanzi: '叫', pinyin: 'jiào', meaning: 'is called' },
              { hanzi: '大卫', pinyin: 'Dàwèi', meaning: 'David (a name)' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'His name is David.',
          },
          {
            words: [
              { hanzi: '他', pinyin: 'tā', meaning: 'he' },
              { hanzi: '也', pinyin: 'yě', meaning: 'also / too' },
              { hanzi: '是', pinyin: 'shì', meaning: 'is' },
              { hanzi: '学生', pinyin: 'xuésheng', meaning: 'student' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'He is also a student.',
          },
          {
            words: [
              { hanzi: '我们', pinyin: 'wǒmen', meaning: 'we / us' },
              { hanzi: '都', pinyin: 'dōu', meaning: 'both / all' },
              { hanzi: '学习', pinyin: 'xuéxí', meaning: 'study' },
              { hanzi: '汉语', pinyin: 'Hànyǔ', meaning: 'Chinese language' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'We both study Chinese.',
          },
          {
            words: [
              { hanzi: '大卫', pinyin: 'Dàwèi', meaning: 'David' },
              { hanzi: '说', pinyin: 'shuō', meaning: 'speak / say' },
              { hanzi: '汉语', pinyin: 'Hànyǔ', meaning: 'Chinese' },
              { hanzi: '很', pinyin: 'hěn', meaning: 'very' },
              { hanzi: '好', pinyin: 'hǎo', meaning: 'well / good' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'David speaks Chinese very well.',
          },
          {
            words: [
              { hanzi: '我们', pinyin: 'wǒmen', meaning: 'we / us' },
              { hanzi: '是', pinyin: 'shì', meaning: 'are' },
              { hanzi: '好', pinyin: 'hǎo', meaning: 'good' },
              { hanzi: '朋友', pinyin: 'péngyou', meaning: 'friends' },
              { hanzi: '。', pinyin: '', meaning: '', isPunctuation: true },
            ],
            translation: 'We are good friends.',
          },
        ],
      },
    ],
  },
];
