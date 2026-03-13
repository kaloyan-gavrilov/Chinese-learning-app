import { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { StudyCard } from '../types/user-word';
import type { Word } from '../types/word';

interface MultipleChoiceExerciseProps {
  card: StudyCard;
  distractors: Word[];
  onAnswer: (correct: boolean) => void;
  showPinyin: boolean;
}

interface Choice {
  meaning: string;
  isCorrect: boolean;
}

export function MultipleChoiceExercise({
  card,
  distractors,
  onAnswer,
  showPinyin,
}: MultipleChoiceExerciseProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const choices: Choice[] = useMemo(() => {
    const correctMeaning = card.words.meaning;
    const distractorMeanings = distractors
      .filter((w) => w.meaning !== correctMeaning)
      .slice(0, 3)
      .map((w) => ({ meaning: w.meaning, isCorrect: false }));

    const all: Choice[] = [
      { meaning: correctMeaning, isCorrect: true },
      ...distractorMeanings,
    ];

    // Shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when card changes
  useEffect(() => {
    setSelectedIdx(null);
    setAnswered(false);
  }, [card.id, card.sessionKey]);

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
    const isCorrect = choices[idx].isCorrect;
    setTimeout(() => onAnswer(isCorrect), 900);
  };

  const getButtonStyle = (idx: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: '100%',
      padding: '0.85rem 1.25rem',
      border: '1px solid var(--color-gold)',
      borderRadius: '4px',
      background: 'var(--color-paper-light)',
      color: 'var(--color-ink-black)',
      fontFamily: 'var(--font-body)',
      fontSize: '0.95rem',
      textAlign: 'left',
      cursor: answered ? 'default' : 'pointer',
      transition: 'all 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    };

    if (!answered) return base;

    if (choices[idx].isCorrect) {
      return {
        ...base,
        borderColor: '#2d6a4f',
        background: 'rgba(45, 106, 79, 0.1)',
        color: '#2d6a4f',
        fontWeight: 500,
      };
    }

    if (idx === selectedIdx) {
      return {
        ...base,
        borderColor: 'var(--color-crimson)',
        background: 'rgba(215, 60, 55, 0.08)',
        color: 'var(--color-crimson)',
      };
    }

    return { ...base, opacity: 0.45 };
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xl)',
      }}
    >
      {/* Word display */}
      <div
        style={{
          background: 'var(--color-paper)',
          border: '1px solid var(--color-gold)',
          borderRadius: '4px',
          boxShadow: '2px 2px 0 var(--color-gold)',
          padding: 'var(--space-2xl) var(--space-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-md)',
          position: 'relative',
        }}
      >
        {/* HSK badge */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-md)',
            right: 'var(--space-md)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--color-gold)',
            opacity: 0.8,
          }}
        >
          {card.words.hsk_level}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-hanzi)',
            fontSize: 'clamp(4rem, 12vw, 8rem)',
            lineHeight: 1.1,
            color: 'var(--color-ink-black)',
          }}
        >
          {card.words.hanzi}
        </div>

        {showPinyin && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.1rem',
              color: 'var(--color-ink)',
              letterSpacing: '0.05em',
              opacity: 0.8,
            }}
          >
            {card.words.pinyin}
          </div>
        )}

        <div
          style={{
            width: '40px',
            height: '1px',
            background: 'var(--color-gold)',
            opacity: 0.5,
            marginTop: 'var(--space-xs)',
          }}
        />

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-ink-black)',
            opacity: 0.5,
            margin: 0,
          }}
        >
          Choose the correct meaning
        </p>
      </div>

      {/* Choices grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-sm)',
        }}
      >
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            style={getButtonStyle(idx)}
            disabled={answered}
          >
            {answered && choices[idx].isCorrect && (
              <Check size={14} style={{ flexShrink: 0 }} />
            )}
            {answered && idx === selectedIdx && !choices[idx].isCorrect && (
              <X size={14} style={{ flexShrink: 0 }} />
            )}
            <span>{choice.meaning}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
