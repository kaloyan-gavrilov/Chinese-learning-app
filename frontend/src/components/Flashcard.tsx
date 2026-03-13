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

  return (
    <div
      onClick={handleFlip}
      style={{
        width: '100%',
        maxWidth: '480px',
        aspectRatio: '3 / 4',
        maxHeight: '70vh',
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
        transition: 'transform 0.4s ease-in-out',
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
        }}>
          {isHanziFirst ? (
            <>
              <span style={{
                fontFamily: 'var(--font-hanzi)',
                fontSize: 'clamp(5rem, 15vw, 10rem)',
                lineHeight: 1,
                color: 'var(--color-ink-black)',
              }}>
                {card.words.hanzi}
              </span>
              {showPinyin && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.1rem',
                  color: 'var(--color-ink-black)',
                  opacity: 0.6,
                }}>
                  {card.words.pinyin}
                </span>
              )}
            </>
          ) : (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              color: 'var(--color-ink-black)',
              textAlign: 'center',
            }}>
              {card.words.meaning}
            </span>
          )}
          <span style={{
            position: 'absolute',
            bottom: 'var(--space-lg)',
            fontSize: '0.8rem',
            color: 'var(--color-ink-black)',
            opacity: 0.35,
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
          gap: 'var(--space-md)',
        }}>
          <span style={{
            fontFamily: 'var(--font-hanzi)',
            fontSize: isHanziFirst ? 'clamp(2rem, 8vw, 4rem)' : 'clamp(5rem, 15vw, 10rem)',
            lineHeight: 1,
            color: 'var(--color-ink-black)',
          }}>
            {card.words.hanzi}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            color: 'var(--color-ink-black)',
            opacity: 0.6,
          }}>
            {card.words.pinyin}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: isHanziFirst ? 'clamp(1.5rem, 5vw, 2.5rem)' : 'clamp(1.2rem, 4vw, 1.8rem)',
            color: 'var(--color-ink-black)',
            textAlign: 'center',
            marginTop: 'var(--space-sm)',
          }}>
            {card.words.meaning}
          </span>
          {isSupported && (
            <button
              onClick={(e) => { e.stopPropagation(); speak(card.words.hanzi); }}
              style={{
                background: 'none',
                color: 'var(--color-ink-black)',
                padding: '8px',
                display: 'flex',
                opacity: 0.6,
                marginTop: 'var(--space-sm)',
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
