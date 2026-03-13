import { useEffect, useMemo, useState } from 'react';
import { Volume2, Check, X } from 'lucide-react';
import type { StudyCard } from '../types/user-word';
import type { Word } from '../types/word';
import { useSpeech } from '../hooks/useSpeech';

interface AudioMatchExerciseProps {
  card: StudyCard;
  distractors: Word[];
  onAnswer: (correct: boolean) => void;
}

interface HanziChoice {
  hanzi: string;
  pinyin: string;
  wordId: string;
  isCorrect: boolean;
}

export function AudioMatchExercise({ card, distractors, onAnswer }: AudioMatchExerciseProps) {
  const { speak, isSupported } = useSpeech();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [playing, setPlaying] = useState(false);

  const choices: HanziChoice[] = useMemo(() => {
    const correct: HanziChoice = {
      hanzi: card.words.hanzi,
      pinyin: card.words.pinyin,
      wordId: card.word_id,
      isCorrect: true,
    };

    const distractorChoices: HanziChoice[] = distractors
      .filter((w) => w.id !== card.word_id)
      .slice(0, 3)
      .map((w) => ({ hanzi: w.hanzi, pinyin: w.pinyin, wordId: w.id, isCorrect: false }));

    const all = [correct, ...distractorChoices];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play on mount
  useEffect(() => {
    setSelectedIdx(null);
    setAnswered(false);
    if (isSupported) {
      setPlaying(true);
      speak(card.words.hanzi);
      setTimeout(() => setPlaying(false), 1200);
    }
  }, [card.id, card.sessionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = () => {
    if (playing) return;
    setPlaying(true);
    speak(card.words.hanzi);
    setTimeout(() => setPlaying(false), 1200);
  };

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
    const isCorrect = choices[idx].isCorrect;
    setTimeout(() => onAnswer(isCorrect), 900);
  };

  const getButtonStyle = (idx: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-xs)',
      padding: 'var(--space-md)',
      border: '1px solid var(--color-gold)',
      borderRadius: '4px',
      background: 'var(--color-paper)',
      cursor: answered ? 'default' : 'pointer',
      transition: 'all 0.15s ease',
      aspectRatio: '1',
    };

    if (!answered) return base;

    if (choices[idx].isCorrect) {
      return {
        ...base,
        borderColor: '#2d6a4f',
        background: 'rgba(45, 106, 79, 0.1)',
      };
    }

    if (idx === selectedIdx) {
      return {
        ...base,
        borderColor: 'var(--color-crimson)',
        background: 'rgba(215, 60, 55, 0.08)',
      };
    }

    return { ...base, opacity: 0.4 };
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-xl)',
      }}
    >
      {/* Play button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button
          onClick={handlePlay}
          disabled={!isSupported}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: playing ? 'var(--color-vermillion)' : 'var(--color-crimson)',
            color: 'var(--color-paper-light)',
            border: 'none',
            cursor: isSupported ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease, transform 0.1s ease',
            transform: playing ? 'scale(0.95)' : 'scale(1)',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
          }}
        >
          <Volume2 size={48} />
        </button>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            color: 'var(--color-ink-black)',
            opacity: 0.6,
            margin: 0,
            textAlign: 'center',
          }}
        >
          Select the character you heard
        </p>
      </div>

      {/* Hanzi choices grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-sm)',
          width: '100%',
        }}
      >
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            style={getButtonStyle(idx)}
            disabled={answered}
          >
            <span
              style={{
                fontFamily: 'var(--font-hanzi)',
                fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                lineHeight: 1.1,
                color: answered && choices[idx].isCorrect
                  ? '#2d6a4f'
                  : answered && idx === selectedIdx
                  ? 'var(--color-crimson)'
                  : 'var(--color-ink-black)',
              }}
            >
              {choice.hanzi}
            </span>
            {answered && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-ink)',
                  opacity: 0.7,
                }}
              >
                {choice.pinyin}
              </span>
            )}
            {answered && choices[idx].isCorrect && (
              <Check size={14} color="#2d6a4f" />
            )}
            {answered && idx === selectedIdx && !choices[idx].isCorrect && (
              <X size={14} color="var(--color-crimson)" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
