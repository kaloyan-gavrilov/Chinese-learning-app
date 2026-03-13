import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { stories } from '../data/stories';
import type { Story, StoryWord } from '../types/reading';

// ─── Word Token ────────────────────────────────────────────────────────────────

interface WordTokenProps {
  word: StoryWord;
  showPinyin: boolean;
}

function WordToken({ word, showPinyin }: WordTokenProps) {
  const [hovered, setHovered] = useState(false);

  if (word.isPunctuation) {
    return (
      <span style={{
        fontFamily: 'var(--font-hanzi)',
        fontSize: '1.35rem',
        color: 'var(--color-ink-black)',
        opacity: 0.5,
        marginRight: word.hanzi === '，' ? '0.5rem' : '0',
        alignSelf: 'flex-end',
        paddingBottom: showPinyin ? '0' : '0',
      }}>
        {word.hanzi}
      </span>
    );
  }

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'default',
        padding: '0.15rem 0.3rem',
        borderRadius: '2px',
        background: hovered ? 'var(--color-paper-dark)' : 'transparent',
        transition: 'background 0.15s',
        userSelect: 'none',
      }}
    >
      {/* Pinyin row — always takes space when shown so layout doesn't shift */}
      {showPinyin && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--color-gold)',
          letterSpacing: '0.02em',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}>
          {word.pinyin}
        </span>
      )}

      {/* Hanzi */}
      <span style={{
        fontFamily: 'var(--font-hanzi)',
        fontSize: '1.35rem',
        color: hovered ? 'var(--color-crimson)' : 'var(--color-ink-black)',
        lineHeight: 1.4,
        transition: 'color 0.15s',
      }}>
        {word.hanzi}
      </span>

      {/* Hover Tooltip */}
      {hovered && (
        <span style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          background: 'var(--color-paper)',
          border: '1px solid var(--color-gold)',
          borderRadius: '3px',
          padding: '0.6rem 0.9rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          minWidth: '100px',
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(26,16,8,0.12)',
          whiteSpace: 'nowrap',
        }}>
          {/* Arrow */}
          <span style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid var(--color-gold)',
          }} />
          <span style={{
            fontFamily: 'var(--font-hanzi)',
            fontSize: '1.6rem',
            color: 'var(--color-ink)',
            lineHeight: 1,
          }}>
            {word.hanzi}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--color-gold)',
            letterSpacing: '0.03em',
          }}>
            {word.pinyin}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--color-ink-black)',
            opacity: 0.8,
            textAlign: 'center',
            maxWidth: '160px',
            whiteSpace: 'normal',
          }}>
            {word.meaning}
          </span>
        </span>
      )}
    </span>
  );
}

// ─── Story Reader ──────────────────────────────────────────────────────────────

interface StoryReaderProps {
  story: Story;
  onBack: () => void;
}

function StoryReader({ story, onBack }: StoryReaderProps) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [showPinyin, setShowPinyin] = useState(false);
  const [activeSentence, setActiveSentence] = useState<number | null>(null);

  const chapter = story.chapters[chapterIndex];

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>

      {/* Reader Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-xl)',
        flexWrap: 'wrap',
        gap: 'var(--space-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'none',
              color: 'var(--color-ink-black)',
              fontSize: '0.85rem',
              opacity: 0.65,
              padding: '0.4rem 0',
            }}
          >
            <ArrowLeft size={16} />
            Stories
          </button>

          <span style={{ color: 'var(--color-gold)', opacity: 0.5 }}>／</span>

          <div>
            <span style={{
              fontFamily: 'var(--font-hanzi)',
              fontSize: '1.4rem',
              color: 'var(--color-ink)',
              marginRight: '0.5rem',
            }}>
              {story.title}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-gold)',
            }}>
              {story.titlePinyin}
            </span>
          </div>
        </div>

        {/* Pinyin Toggle */}
        <button
          onClick={() => setShowPinyin(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: showPinyin ? 'var(--color-crimson)' : 'var(--color-paper-dark)',
            color: showPinyin ? '#fff' : 'var(--color-ink-black)',
            border: '1px solid',
            borderColor: showPinyin ? 'var(--color-crimson)' : 'var(--color-gold)',
            borderRadius: '20px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.03em',
          }}
        >
          {showPinyin ? <Eye size={13} /> : <EyeOff size={13} />}
          Pīnyīn
        </button>
      </div>

      {/* Chapter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: 'var(--space-xl)',
        borderBottom: '1px solid var(--color-gold)',
        paddingBottom: '0',
      }}>
        {story.chapters.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => { setChapterIndex(idx); setActiveSentence(null); }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: idx === chapterIndex ? 'var(--color-crimson)' : 'var(--color-ink-black)',
              background: 'none',
              borderBottom: idx === chapterIndex ? '2px solid var(--color-crimson)' : '2px solid transparent',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-1px',
              fontWeight: idx === chapterIndex ? 500 : 400,
            }}
          >
            <span style={{ fontFamily: 'var(--font-hanzi)', marginRight: '0.4rem' }}>
              {ch.title}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--color-gold)',
              display: idx === chapterIndex ? 'inline' : 'none',
            }}>
              Ch. {idx + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Chapter subtitle */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--color-gold)',
        letterSpacing: '0.05em',
        marginBottom: 'var(--space-xl)',
        textTransform: 'uppercase',
      }}>
        {chapter.titlePinyin}
      </p>

      {/* Sentences */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {chapter.sentences.map((sentence, sIdx) => {
          const isActive = activeSentence === sIdx;
          return (
            <div
              key={sIdx}
              onClick={() => setActiveSentence(isActive ? null : sIdx)}
              style={{
                background: isActive ? 'var(--color-paper-dark)' : 'transparent',
                borderLeft: isActive
                  ? '3px solid var(--color-crimson)'
                  : '3px solid transparent',
                borderRadius: '0 3px 3px 0',
                padding: isActive ? '0.75rem 1rem' : '0.5rem 0',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {/* Word tokens row */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                gap: '0.1rem',
                lineHeight: 1,
              }}>
                {sentence.words.map((word, wIdx) => (
                  <WordToken key={wIdx} word={word} showPinyin={showPinyin} />
                ))}
              </div>

              {/* Translation — shown when sentence is active */}
              {isActive && (
                <div style={{
                  marginTop: 'var(--space-sm)',
                  paddingTop: 'var(--space-sm)',
                  borderTop: '1px solid var(--color-gold)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: 'var(--color-ink-black)',
                  opacity: 0.75,
                  fontStyle: 'italic',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  {sentence.translation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chapter navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 'var(--space-3xl)',
        paddingTop: 'var(--space-lg)',
        borderTop: '1px solid var(--color-gold)',
        opacity: 0.7,
      }}>
        <button
          onClick={() => { setChapterIndex(i => i - 1); setActiveSentence(null); }}
          disabled={chapterIndex === 0}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-ink-black)',
            background: 'none',
            opacity: chapterIndex === 0 ? 0.3 : 1,
            cursor: chapterIndex === 0 ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <ArrowLeft size={14} />
          Previous chapter
        </button>
        <button
          onClick={() => { setChapterIndex(i => i + 1); setActiveSentence(null); }}
          disabled={chapterIndex === story.chapters.length - 1}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: chapterIndex === story.chapters.length - 1 ? 'transparent' : 'var(--color-ink-black)',
            background: 'none',
            cursor: chapterIndex === story.chapters.length - 1 ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          Next chapter
          <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </div>
  );
}

// ─── Story List ────────────────────────────────────────────────────────────────

const TAG_LABELS: Record<string, string> = {
  short: 'Short',
  long: 'Long',
  family: 'Family',
  school: 'School',
  'daily-life': 'Daily Life',
  travel: 'Travel',
  work: 'Work',
  culture: 'Culture',
};

interface StoryCardProps {
  story: Story;
  onSelect: () => void;
}

function StoryCard({ story, onSelect }: StoryCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-paper-dark)',
        border: `1px solid ${hovered ? 'var(--color-crimson)' : 'var(--color-gold)'}`,
        borderRadius: '3px',
        padding: 'var(--space-xl)',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
      }}
    >
      {/* HSK Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: '#fff',
          background: 'var(--color-crimson)',
          padding: '0.15rem 0.5rem',
          borderRadius: '2px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          HSK {story.hsk_level}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--color-gold)',
          opacity: 0.7,
        }}>
          {story.chapters.length} chapter{story.chapters.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Title */}
      <div>
        <span style={{
          fontFamily: 'var(--font-hanzi)',
          fontSize: '2rem',
          color: 'var(--color-ink)',
          display: 'block',
          lineHeight: 1.2,
        }}>
          {story.title}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-gold)',
          letterSpacing: '0.03em',
        }}>
          {story.titlePinyin}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.85rem',
        color: 'var(--color-ink-black)',
        opacity: 0.75,
        lineHeight: 1.5,
        margin: 0,
      }}>
        {story.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'var(--space-xs)' }}>
        {story.tags.map(tag => (
          <span key={tag} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-ink-black)',
            opacity: 0.6,
            border: '1px solid var(--color-gold)',
            borderRadius: '2px',
            padding: '0.1rem 0.45rem',
            letterSpacing: '0.04em',
          }}>
            {TAG_LABELS[tag] ?? tag}
          </span>
        ))}
      </div>
    </button>
  );
}

// ─── Reading Page ──────────────────────────────────────────────────────────────

export function ReadingPage() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  if (selectedStory) {
    return (
      <div style={{ animation: 'fadeIn 0.25s ease' }}>
        <StoryReader story={selectedStory} onBack={() => setSelectedStory(null)} />
      </div>
    );
  }

  const filtered = levelFilter
    ? stories.filter(s => s.hsk_level === levelFilter)
    : stories;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.25s ease' }}>

      {/* Page header */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          color: 'var(--color-ink)',
          fontWeight: 700,
          marginBottom: '0.35rem',
        }}>
          Reading
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--color-ink-black)',
          opacity: 0.65,
        }}>
          Hover over any word to see its meaning. Click a sentence to reveal the translation.
        </p>
      </div>

      {/* Level filter pills */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: 'var(--space-xl)',
        flexWrap: 'wrap',
      }}>
        {[null, 1, 2, 3, 4, 5, 6].map(level => (
          <button
            key={level ?? 'all'}
            onClick={() => setLevelFilter(level)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              border: '1px solid',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: levelFilter === level ? 'var(--color-crimson)' : 'transparent',
              color: levelFilter === level ? '#fff' : 'var(--color-ink-black)',
              borderColor: levelFilter === level ? 'var(--color-crimson)' : 'var(--color-gold)',
              letterSpacing: '0.04em',
            }}
          >
            {level === null ? 'All' : `HSK ${level}`}
          </button>
        ))}
      </div>

      {/* Story grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-3xl)',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-ink-black)',
          opacity: 0.5,
        }}>
          No stories yet for this level. Check back soon.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-xl)',
        }}>
          {filtered.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              onSelect={() => setSelectedStory(story)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
