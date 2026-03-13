import { useState, useEffect, useCallback } from 'react';
import { Volume2, Check, X } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import type { Word } from '../types/word';

interface ListeningQuizProps {
  /** The correct word to listen for */
  targetWord: Word;
  /** 3 wrong options */
  options: Word[];
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

export function ListeningQuiz({ targetWord, options, onAnswer }: ListeningQuizProps) {
  const { speak, isSupported } = useSpeech();
  const [allOptions] = useState(() => shuffleArray([targetWord, ...options.slice(0, 3)]));
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  // Auto-speak when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(targetWord.hanzi);
    }, 300);
    return () => clearTimeout(timer);
  }, [targetWord.hanzi, speak]);

  const handleSelect = useCallback((wordId: string) => {
    if (answered) return;
    setSelected(wordId);
    setAnswered(true);
    const correct = wordId === targetWord.id;

    // Speak the correct answer
    if (!correct) {
      setTimeout(() => speak(targetWord.hanzi), 300);
    }

    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  }, [answered, targetWord.id, targetWord.hanzi, onAnswer, speak]);

  const getOptionStyle = (word: Word): React.CSSProperties => {
    const isSelected = selected === word.id;
    const isCorrect = word.id === targetWord.id;

    let bg = 'var(--color-paper-light)';
    let borderColor = 'var(--color-gold)';
    let color = 'var(--color-ink-black)';

    if (answered) {
      if (isCorrect) {
        bg = 'rgba(45, 106, 79, 0.12)';
        borderColor = '#2d6a4f';
        color = '#2d6a4f';
      } else if (isSelected && !isCorrect) {
        bg = 'rgba(215, 60, 55, 0.1)';
        borderColor = 'var(--color-vermillion)';
        color = 'var(--color-vermillion)';
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
      color,
      transition: 'all 0.2s',
      width: '100%',
      textAlign: 'left',
      minHeight: '60px',
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
        Listen and choose the correct word
      </h3>

      {/* Speaker button */}
      <button
        onClick={() => speak(targetWord.hanzi)}
        disabled={!isSupported}
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'var(--color-paper)',
          border: '2px solid var(--color-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-crimson)',
          transition: 'all 0.2s',
        }}
      >
        <Volume2 size={40} />
      </button>

      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        opacity: 0.5,
      }}>
        Tap to replay
      </span>

      {/* Options */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
        width: '100%',
      }}>
        {allOptions.map((word) => (
          <button
            key={word.id}
            onClick={() => handleSelect(word.id)}
            style={getOptionStyle(word)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <span style={{
                fontFamily: 'var(--font-hanzi)',
                fontSize: '1.6rem',
              }}>
                {word.hanzi}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                opacity: 0.5,
              }}>
                {word.pinyin}
              </span>
            </div>
            {answered && word.id === targetWord.id && <Check size={20} />}
            {answered && selected === word.id && word.id !== targetWord.id && <X size={20} />}
          </button>
        ))}
      </div>

      {/* Reveal meaning after answering */}
      {answered && (
        <div style={{
          padding: 'var(--space-md) var(--space-lg)',
          background: 'var(--color-paper)',
          border: '1px solid var(--color-gold)',
          borderRadius: '4px',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease',
          width: '100%',
        }}>
          <span style={{ fontFamily: 'var(--font-hanzi)', fontSize: '1.4rem' }}>
            {targetWord.hanzi}
          </span>
          <span style={{ margin: '0 var(--space-sm)', opacity: 0.3 }}>&mdash;</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', opacity: 0.6 }}>
            {targetWord.pinyin}
          </span>
          <span style={{ margin: '0 var(--space-sm)', opacity: 0.3 }}>&mdash;</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
            {targetWord.meaning}
          </span>
        </div>
      )}
    </div>
  );
}
