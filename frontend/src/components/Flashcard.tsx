import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import type { StudyCard } from '../types/user-word';
import { useSpeech } from '../hooks/useSpeech';

interface FlashcardProps {
  card: StudyCard;
  showPinyin: boolean;
  onRevealed?: () => void;
}

export function Flashcard({ card, showPinyin, onRevealed }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const { speak, isSupported } = useSpeech();

  const mode = card.mode ?? 'hanzi-to-meaning';
  const isHanziFirst = mode === 'hanzi-to-meaning';

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true);
      speak(card.words.hanzi);
      onRevealed?.();
    }
  };

  // Status badge for known/mastered words appearing in review
  const isReview = card.status === 'known' || card.status === 'mastered';

  return (
    <div
      onClick={handleFlip}
      style={{
        width: '100%',
        maxWidth: '420px',
        aspectRatio: '3 / 4',
        maxHeight: '65vh',
        perspective: '1000px',
        cursor: flipped ? 'default' : 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.45s ease-in-out',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          background: 'var(--color-paper)',
          border: '1px solid var(--color-gold)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-2xl)',
          gap: 'var(--space-md)',
          boxShadow: '0 1px 3px rgba(26, 16, 8, 0.08)',
        }}>
          {/* Review badge */}
          {isReview && (
            <span style={{
              position: 'absolute',
              top: 'var(--space-md)',
              left: 'var(--space-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#2d6a4f',
              background: 'rgba(45, 106, 79, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Review
            </span>
          )}

          {/* HSK level indicator */}
          <span style={{
            position: 'absolute',
            top: 'var(--space-md)',
            right: 'var(--space-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--color-ink-black)',
            opacity: 0.3,
          }}>
            HSK {card.words.hsk_level}
          </span>

          {isHanziFirst ? (
            <>
              <span style={{
                fontFamily: 'var(--font-hanzi)',
                fontSize: 'clamp(4.5rem, 14vw, 9rem)',
                lineHeight: 1,
                color: 'var(--color-ink-black)',
                letterSpacing: '0.02em',
              }}>
                {card.words.hanzi}
              </span>
              {showPinyin && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  color: 'var(--color-ink-black)',
                  opacity: 0.45,
                  marginTop: 'var(--space-xs)',
                }}>
                  {card.words.pinyin}
                </span>
              )}
            </>
          ) : (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1.4rem, 5vw, 2.2rem)',
              color: 'var(--color-ink-black)',
              textAlign: 'center',
              lineHeight: 1.4,
            }}>
              {card.words.meaning}
            </span>
          )}

          {/* Decorative seal mark */}
          <div style={{
            position: 'absolute',
            bottom: 'var(--space-xl)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-vermillion)',
            opacity: 0.15,
          }} />

          <span style={{
            position: 'absolute',
            bottom: 'var(--space-lg)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-ink-black)',
            opacity: 0.25,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Tap to reveal
          </span>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'var(--color-paper)',
          border: '1px solid var(--color-gold)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-2xl)',
          gap: 'var(--space-sm)',
          boxShadow: '0 1px 3px rgba(26, 16, 8, 0.08)',
        }}>
          <span style={{
            fontFamily: 'var(--font-hanzi)',
            fontSize: isHanziFirst ? 'clamp(2rem, 8vw, 3.5rem)' : 'clamp(4.5rem, 14vw, 9rem)',
            lineHeight: 1,
            color: 'var(--color-ink-black)',
          }}>
            {card.words.hanzi}
          </span>

          {/* Divider */}
          <div style={{
            width: '40px',
            height: '1px',
            background: 'var(--color-gold)',
            margin: 'var(--space-sm) 0',
            opacity: 0.6,
          }} />

          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            color: 'var(--color-ink-black)',
            opacity: 0.5,
          }}>
            {card.words.pinyin}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: isHanziFirst ? 'clamp(1.3rem, 4vw, 2rem)' : 'clamp(1.1rem, 3.5vw, 1.6rem)',
            color: 'var(--color-ink-black)',
            textAlign: 'center',
            marginTop: 'var(--space-xs)',
            lineHeight: 1.4,
          }}>
            {card.words.meaning}
          </span>

          {isSupported && (
            <button
              onClick={(e) => { e.stopPropagation(); speak(card.words.hanzi); }}
              style={{
                background: 'none',
                color: 'var(--color-crimson)',
                padding: '8px',
                display: 'flex',
                opacity: 0.7,
                marginTop: 'var(--space-sm)',
                transition: 'opacity 0.2s',
              }}
              title="Pronounce"
            >
              <Volume2 size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
