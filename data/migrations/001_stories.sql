-- ============================================================
-- Migration: 001_stories
-- Creates the stories table for the HSK reading feature.
-- Run this once in your Supabase SQL editor before seeding.
-- ============================================================

CREATE TABLE IF NOT EXISTS stories (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        NOT NULL UNIQUE,        -- matches the id field in stories.ts
  title        TEXT        NOT NULL,
  title_pinyin TEXT        NOT NULL,
  description  TEXT        NOT NULL,
  hsk_level    SMALLINT    NOT NULL CHECK (hsk_level BETWEEN 1 AND 6),
  tags         TEXT[]      NOT NULL DEFAULT '{}',
  -- Full story content stored as JSONB (array of StoryChapter objects).
  -- Schema: [{ id, title, titlePinyin, sentences: [{ words: [{ hanzi, pinyin, meaning, isPunctuation? }], translation }] }]
  chapters     JSONB       NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast filtering by HSK level on the list page
CREATE INDEX IF NOT EXISTS stories_hsk_level_idx ON stories (hsk_level);

-- Supabase RLS — stories are public (read-only for everyone, no auth required)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories are publicly readable"
  ON stories FOR SELECT
  USING (true);
