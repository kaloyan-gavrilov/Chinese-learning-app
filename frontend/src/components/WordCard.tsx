import { Volume2, Check, X } from 'lucide-react';
import type { Word } from '../types/word';
import { useSpeech } from '../hooks/useSpeech';

interface WordCardProps {
  word: Word;
  status?: 'learn' | 'known' | 'mastered';
  onMark: (wordId: string, status: 'learn' | 'known') => void;
}

export function WordCard({ word, status, onMark }: WordCardProps) {
  const { speak, isSupported } = useSpeech();

  const isSorted = status === 'known' || status === 'mastered';

  return (
    <div style={{
      background: 'var(--color-paper-dark)',
      border: '1px solid var(--color-gold)',
      borderRadius: '4px',
      padding: 'var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)',
      animation: 'fadeIn 0.3s ease',
      opacity: isSorted ? 0.65 : 1,
      position: 'relative',
    }}>
      {status && (
        <span style={{
          position: 'absolute',
          top: 'var(--space-sm)',
          right: 'var(--space-sm)',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)',
          color: isSorted ? '#2d6a4f' : 'var(--color-vermillion)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {status === 'mastered' ? 'mastered' : status}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <span style={{
          fontFamily: 'var(--font-hanzi)',
          fontSize: '2rem',
          lineHeight: 1.2,
          color: 'var(--color-ink-black)',
        }}>
          {word.hanzi}
        </span>
        {isSupported && (
          <button
            onClick={() => speak(word.hanzi)}
            style={{
              background: 'none',
              color: 'var(--color-ink-black)',
              padding: '4px',
              display: 'flex',
              opacity: 0.6,
            }}
            title="Pronounce"
          >
            <Volume2 size={16} />
          </button>
        )}
      </div>

      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        color: 'var(--color-ink-black)',
        opacity: 0.7,
      }}>
        {word.pinyin}
      </span>

      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
        color: 'var(--color-ink-black)',
        lineHeight: 1.4,
      }}>
        {word.meaning}
      </span>

      <div style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        marginTop: 'var(--space-sm)',
        borderTop: '1px solid var(--color-gold)',
        paddingTop: 'var(--space-sm)',
        opacity: isSorted ? 0.5 : 1,
      }}>
        <button
          onClick={() => onMark(word.id, 'known')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            padding: '0.45rem',
            background: status === 'known' || status === 'mastered' ? '#2d6a4f' : 'transparent',
            color: status === 'known' || status === 'mastered' ? 'var(--color-paper-light)' : '#2d6a4f',
            border: '1px solid #2d6a4f',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          <Check size={14} />
          I know this
        </button>
        <button
          onClick={() => onMark(word.id, 'learn')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            padding: '0.45rem',
            background: status === 'learn' ? 'var(--color-vermillion)' : 'transparent',
            color: status === 'learn' ? 'var(--color-paper-light)' : 'var(--color-vermillion)',
            border: '1px solid var(--color-vermillion)',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          <X size={14} />
          Learn
        </button>
      </div>
    </div>
  );
}
