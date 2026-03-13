# 汉字学习 - Chinese Learning App

## Project Overview

A web application for studying Mandarin Chinese, structured around the HSK (Hanyu Shuiping Kaoshi) standardized vocabulary levels. Users browse HSK word lists, sort words into personal "known" and "unknown" buckets, then test themselves via a spaced-repetition flashcard system.

---

## Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | Vite + React + TypeScript                         |
| Backend    | NestJS (REST API)                                 |
| Database   | Supabase (PostgreSQL + Auth + Storage)            |
| Audio      | Browser Web Speech API (`SpeechSynthesis`)        |
| HSK Data   | Open-source HSK 1–6 word lists (CC-CEDICT based) |

---

## Repository Structure

```
chinese-learning-app/
├── frontend/          # Vite React TypeScript app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── types/
├── backend/           # NestJS application
│   ├── src/
│   │   ├── auth/
│   │   ├── words/
│   │   ├── user-words/
│   │   └── progress/
├── data/              # HSK seed data (JSON)
└── CLAUDE.md
```

---

## Features

### 1. HSK Word Browser (Word Bucket)
- Tabs or navigation for HSK levels 1–6
- Each word displayed as a card showing:
  - Chinese character (汉字)
  - Pinyin romanization
  - English meaning
  - Audio pronunciation button (Web Speech API, `lang: zh-CN`)
- Each card has two actions:
  - ✓ **"I know this"** — moves to Known bucket
  - ✗ **"I don't know this"** — moves to Learn bucket
- Words already sorted are visually marked but still browsable
- Progress bar per HSK level (X known / total)

### 2. Learn Bucket (Flashcard Study Mode)
- Dedicated page showing all words the user has marked as "don't know"
- Cards appear one at a time, full-screen flashcard style
- Randomized presentation mode:
  - Sometimes: Chinese character → reveal meaning
  - Sometimes: English meaning → reveal Chinese character
- Pinyin toggle: show/hide pinyin independently of the reveal
- Audio button always available
- Swipe right (or button) = **Correct** — I got it
- Swipe left (or button) = **Incorrect** — show me again
- Spaced repetition algorithm (see below)

### 3. Auth & Persistence
- Supabase Auth (email/password + optionally Google OAuth)
- All bucket assignments and study progress synced to Supabase
- Unauthenticated users get a prompt to sign up; no local-only mode

---

## Spaced Repetition Algorithm

Use a simplified SM-2-inspired algorithm stored per word per user:

```
Fields per word (user_words table):
  - ease_factor     FLOAT DEFAULT 2.5
  - interval        INT DEFAULT 1        -- days until next review
  - repetitions     INT DEFAULT 0        -- consecutive correct answers
  - next_review_at  TIMESTAMP
  - status          ENUM('learn', 'known', 'mastered')
```

**On correct answer:**
- `repetitions += 1`
- If `repetitions === 1`: interval = 1
- If `repetitions === 2`: interval = 6
- Else: `interval = round(interval * ease_factor)`
- `ease_factor = max(1.3, ease_factor + 0.1)`
- `next_review_at = now + interval days`
- If `repetitions >= 5`: status → `mastered`

**On incorrect answer:**
- `repetitions = 0`
- `interval = 1`
- `ease_factor = max(1.3, ease_factor - 0.2)`
- `next_review_at = now` (immediately re-queue)

**Study session word order:**
1. First show words where `next_review_at <= now`
2. Then show new `learn` bucket words not yet reviewed
3. Within each group, randomize

---

## HSK Data

Source: Open-source HSK 1–6 vocabulary lists derived from CC-CEDICT and official HSK 2012 standard.

Suggested GitHub sources:
- `github.com/ivankra/hsk` — clean JSON/CSV per level
- `github.com/gigachadteam/hsk-flashcards` — structured with pinyin + definitions

Each word entry shape:
```typescript
interface Word {
  id: string;
  hsk_level: 1 | 2 | 3 | 4 | 5 | 6;
  hanzi: string;          // e.g. "你好"
  pinyin: string;         // e.g. "nǐ hǎo"  (with tone marks, not numbers)
  meaning: string;        // e.g. "hello; hi"
  example_sentence?: string;
  audio_url?: string;     // optional stored audio; fallback to Web Speech API
}
```

Seed data lives in `data/hsk{1-6}.json` and is loaded via a NestJS seed script into Supabase on first deploy.

---

## Audio Pronunciation

Use the browser `SpeechSynthesis` API with `lang: 'zh-CN'`:

```typescript
function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}
```

- Always speak the hanzi character, not pinyin
- Trigger on card reveal and via a speaker icon button
- Graceful fallback: hide the button if `speechSynthesis` is unavailable

---

## Database Schema (Supabase)

```sql
-- Seeded by backend, read-only for users
CREATE TABLE words (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hsk_level   SMALLINT NOT NULL CHECK (hsk_level BETWEEN 1 AND 6),
  hanzi       TEXT NOT NULL,
  pinyin      TEXT NOT NULL,
  meaning     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- One row per user per word
CREATE TABLE user_words (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id         UUID REFERENCES words(id) ON DELETE CASCADE,
  status          TEXT CHECK (status IN ('learn', 'known', 'mastered')) NOT NULL,
  ease_factor     FLOAT DEFAULT 2.5,
  interval_days   INT DEFAULT 1,
  repetitions     INT DEFAULT 0,
  next_review_at  TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, word_id)
);

-- RLS: users can only read/write their own rows
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;
```

---

## Design System

### Aesthetic Direction

**"Imperial Ink"** — the visual language of traditional Chinese woodblock printing meets contemporary editorial design. Think rice paper textures, vermillion seal stamps, and the precision of a calligrapher's brushstroke. Clean, intentional, and quietly dramatic. Not kitschy or touristy — refined and typographically strong.

### Color Palette

```css
:root {
  --color-paper:       #e6e0ae;  /* warm parchment — primary background */
  --color-gold:        #dfbc5e;  /* antique gold — accents, borders */
  --color-vermillion:  #ee6146;  /* vermillion — interactive / hover */
  --color-crimson:     #d73c37;  /* crimson — primary actions, CTAs */
  --color-ink:         #b51f09;  /* deep ink red — headings, emphasis */

  /* Derived */
  --color-ink-black:   #1a1008;  /* near-black with warm undertone — body text */
  --color-paper-dark:  #cfc9a0;  /* slightly deeper paper — cards, surfaces */
  --color-paper-light: #f0ead6;  /* lighter paper — page background */
}
```

### Typography

- **Display / Hanzi**: `Noto Serif SC` (Google Fonts) — for all Chinese characters; beautiful, historically grounded
- **Headings**: `Playfair Display` — high-contrast serif with editorial character
- **Body / UI**: `DM Sans` — clean, modern, complements the serif without competing
- **Pinyin**: `DM Mono` — monospaced, precise, clinical contrast against the decorative hanzi

```css
/* Font imports */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
```

### Visual Language

- **Backgrounds**: Paper texture via subtle CSS noise or a very light grain overlay. No solid white.
- **Cards**: Slightly deeper paper (`--color-paper-dark`), thin `1px` gold border, no drop shadow — use a subtle inset border or offset instead.
- **Buttons**: Flat, filled with `--color-crimson`. Hover transitions to `--color-vermillion`. No border-radius > 4px.
- **Icons**: Minimal line icons (Lucide). No filled icon sets.
- **Dividers**: Thin `1px` lines in `--color-gold` at low opacity.
- **Decorative**: Occasional use of a simplified seal/stamp motif (CSS-drawn circle with inner border) as a UI accent — not as imagery.
- **Spacing**: Generous. Let content breathe. Chinese characters need space to feel dignified.
- **Animations**: Subtle and purposeful — card flips use a smooth 3D CSS transform, swipe gestures have spring physics feel. No bouncy, playful animations.

### Flashcard UX Details

- Card is large, centered, vertically and horizontally
- Front face: single large hanzi character (`font-size: clamp(5rem, 15vw, 10rem)`)
- Flip animation: CSS `perspective` + `rotateY` transform, ~400ms ease-in-out
- Swipe feedback: card tilts slightly in the swipe direction before animating off-screen
- Correct/Incorrect overlay: brief green/red tint fades in and out on the card (not a full-screen flash)
- Pinyin toggle: small pill toggle in the top-right corner of the study view

---

## NestJS Backend Modules

```
src/
├── auth/           # Supabase JWT validation guard
├── words/          # GET /words?level=1 — paginated HSK word lists
├── user-words/     # GET/POST/PATCH /user-words — bucket management
├── progress/       # GET /progress — stats per level
└── seed/           # Script to load hsk*.json into Supabase
```

All endpoints are protected by a `SupabaseAuthGuard` that verifies the JWT from the Supabase client.

---

## Key Conventions

- All Chinese text rendered with `font-family: 'Noto Serif SC', serif`
- Pinyin always uses tone marks (ǐ ā ú), never tone numbers
- Words seeded from JSON — never hardcoded in components
- Supabase client initialized once in `frontend/src/lib/supabase.ts`
- NestJS uses `@supabase/supabase-js` (service role key) for DB access
- No `any` types in TypeScript — strict mode enabled
- Component files: PascalCase. Hooks: `use` prefix. Utils: camelCase.
