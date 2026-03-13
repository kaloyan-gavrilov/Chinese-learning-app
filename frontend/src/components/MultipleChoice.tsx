import { useState, useCallback } from 'react';
import { Volume2, Check, X } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import type { Word } from '../types/word';

type QuizDirection = 'hanzi-to-meaning' | 'meaning-to-hanzi';

interface MultipleChoiceProps {
  targetWord: Word;
  options: Word[];
  direction: QuizDirection;
  onAnswer: (correct: boolean) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

export function MultipleChoice({ targetWord, options, direction, onAnswer }: MultipleChoiceProps) {
  const { speak, isSupported } = useSpeech();
  const [allOptions] = useState(() => shuffleArray([targetWord, ...options.slice(0, 3)]));
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = useCallback((wordId: string) => {
    if (answered) return;
    setSelected(wordId);
    setAnswered(true);
    const correct = wordId === targetWord.id;

    if (correct) {
      speak(targetWord.hanzi);
    }

    setTimeout(() => {
      onAnswer(correct);
    }, 1200);
  }, [answered, targetWord, onAnswer, speak]);

  const isHanziPrompt = direction === 'hanzi-to-meaning';

  const getOptionStyle = (word: Word): React.CSSProperties => {
    const isSelected = selected === word.id;
    const isCorrect = word.id === targetWord.id;

    let bg = 'var(--color-paper-light)';
    let borderColor = 'var(--color-gold)';
    let textColor = 'var(--color-ink-black)';

    if (answered) {
      if (isCorrect) {
        bg = 'rgba(45, 106, 79, 0.12)';
        borderColor = '#2d6a4f';
        textColor = '#2d6a4f';
      } else if (isSelected) {
        bg = 'rgba(215, 60, 55, 0.1)';
        borderColor = 'var(--color-vermillion)';
        textColor = 'var(--color-vermillion)';
      }
    }

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-md) var(--space-lg)',
      background: bg,
      border: `2px solid ${borderColor}`,
      borderRadius: '4px',
      color: textColor,
      transition: 'all 0.2s',
      width: '100%',
      textAlign: 'left',
      minHeight: '56px',
    };
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-xl)',
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.2rem',
        color: 'var(--color-ink)',
        textAlign: 'center',
      }}>
        {isHanziPrompt ? 'What does this character mean?' : 'Which character matches this meaning?'}
      </h3>

      {/* Prompt */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-xl)',
        background: 'var(--color-paper)',
        border: '1px solid var(--color-gold)',
        borderRadius: '4px',
        width: '100%',
      }}>
        {isHanziPrompt ? (
          <>
            <span style={{
              fontFamily: 'var(--font-hanzi)',
              fontSize: 'clamp(3rem, 10vw, 6rem)',
              lineHeight: 1,
              color: 'var(--color-ink-black)',
            }}>
              {targetWord.hanzi}
            </span>
            {isSupported && (
              <button
                onClick={() => speak(targetWord.hanzi)}
                style={{
                  background: 'none',
                  color: 'var(--color-ink-black)',
                  padding: '4px',
                  opacity: 0.5,
                  display: 'flex',
                }}
              >
                <Volume2 size={20} />
              </button>
            )}
          </>
        ) : (
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1.3rem, 4vw, 2rem)',
            color: 'var(--color-ink-black)',
            textAlign: 'center',
          }}>
            {targetWord.meaning}
          </span>
        )}
      </div>

      {/* Options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-sm)',
        width: '100%',
      }}>
        {allOptions.map((word) => (
          <button
            key={word.id}
            onClick={() => handleSelect(word.id)}
            style={getOptionStyle(word)}
          >
            <span style={{
              fontFamily: isHanziPrompt ? 'var(--font-body)' : 'var(--font-hanzi)',
              fontSize: isHanziPrompt ? '0.9rem' : '1.5rem',
              lineHeight: 1.3,
            }}>
              {isHanziPrompt ? word.meaning : word.hanzi}
            </span>
            {answered && word.id === targetWord.id && <Check size={18} />}
            {answered && selected === word.id && word.id !== targetWord.id && <X size={18} />}
          </button>
        ))}
      </div>

      {/* Reveal pinyin after answering */}
      {answered && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem',
          opacity: 0.6,
          animation: 'fadeIn 0.3s ease',
        }}>
          {targetWord.pinyin}
        </div>
      )}
    </div>
  );
}
