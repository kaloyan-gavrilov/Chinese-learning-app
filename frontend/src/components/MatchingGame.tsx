import { useState, useCallback } from 'react';
import { Volume2, Check, X } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import type { Word } from '../types/word';

interface MatchPair {
  word: Word;
  isDistractor?: boolean;
}

interface MatchingGameProps {
  /** The words the user is studying (4-5) */
  studyWords: Word[];
  /** Extra distractor meanings (not used for hanzi side) */
  distractors: Word[];
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
}

interface MatchState {
  selectedLeft: number | null;
  selectedRight: number | null;
  matchedPairs: Set<string>; // word IDs that have been matched
  incorrectFlash: { left: number; right: number } | null;
  results: { wordId: string; correct: boolean }[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

export function MatchingGame({ studyWords, distractors, onComplete }: MatchingGameProps) {
  const { speak, isSupported } = useSpeech();
  const count = studyWords.length;

  // Left side: hanzi from study words (shuffled)
  const [leftItems] = useState(() => shuffleArray(studyWords));

  // Right side: meanings from study words + some distractors, shuffled
  const [rightItems] = useState<MatchPair[]>(() => {
    const rights: MatchPair[] = studyWords.map((w) => ({ word: w }));
    // Add 1-2 distractors if available
    const extraCount = Math.min(2, distractors.length);
    for (let i = 0; i < extraCount; i++) {
      rights.push({ word: distractors[i], isDistractor: true });
    }
    return shuffleArray(rights);
  });

  const [state, setState] = useState<MatchState>({
    selectedLeft: null,
    selectedRight: null,
    matchedPairs: new Set(),
    incorrectFlash: null,
    results: [],
  });

  const [completed, setCompleted] = useState(false);

  const handleLeftClick = useCallback((idx: number) => {
    if (completed) return;
    const word = leftItems[idx];
    if (state.matchedPairs.has(word.id)) return;

    speak(word.hanzi);

    setState((prev) => {
      if (prev.selectedRight !== null) {
        // Try to match
        const rightWord = rightItems[prev.selectedRight].word;
        const correct = rightWord.id === word.id;

        if (correct) {
          const newMatched = new Set(prev.matchedPairs);
          newMatched.add(word.id);
          const newResults = [...prev.results, { wordId: word.id, correct: true }];

          if (newMatched.size === count) {
            setTimeout(() => {
              setCompleted(true);
              onComplete(newResults);
            }, 600);
          }

          return {
            ...prev,
            selectedLeft: null,
            selectedRight: null,
            matchedPairs: newMatched,
            incorrectFlash: null,
            results: newResults,
          };
        } else {
          const flash = { left: idx, right: prev.selectedRight };
          setTimeout(() => {
            setState((p) => ({ ...p, incorrectFlash: null }));
          }, 500);

          return {
            ...prev,
            selectedLeft: null,
            selectedRight: null,
            incorrectFlash: flash,
            results: [...prev.results, { wordId: word.id, correct: false }],
          };
        }
      }

      return { ...prev, selectedLeft: idx, selectedRight: null };
    });
  }, [leftItems, rightItems, state.matchedPairs, count, completed, speak, onComplete]);

  const handleRightClick = useCallback((idx: number) => {
    if (completed) return;
    const rightPair = rightItems[idx];
    if (!rightPair.isDistractor && state.matchedPairs.has(rightPair.word.id)) return;

    setState((prev) => {
      if (prev.selectedLeft !== null) {
        const leftWord = leftItems[prev.selectedLeft];
        const correct = rightPair.word.id === leftWord.id;

        if (correct) {
          const newMatched = new Set(prev.matchedPairs);
          newMatched.add(leftWord.id);
          const newResults = [...prev.results, { wordId: leftWord.id, correct: true }];

          if (newMatched.size === count) {
            setTimeout(() => {
              setCompleted(true);
              onComplete(newResults);
            }, 600);
          }

          return {
            ...prev,
            selectedLeft: null,
            selectedRight: null,
            matchedPairs: newMatched,
            incorrectFlash: null,
            results: newResults,
          };
        } else {
          const flash = { left: prev.selectedLeft, right: idx };
          setTimeout(() => {
            setState((p) => ({ ...p, incorrectFlash: null }));
          }, 500);

          return {
            ...prev,
            selectedLeft: null,
            selectedRight: null,
            incorrectFlash: flash,
            results: [...prev.results, { wordId: leftWord.id, correct: false }],
          };
        }
      }

      return { ...prev, selectedRight: idx, selectedLeft: null };
    });
  }, [leftItems, rightItems, state.matchedPairs, count, completed, onComplete]);

  const isLeftMatched = (idx: number) => state.matchedPairs.has(leftItems[idx].id);
  const isRightMatched = (idx: number) => {
    const r = rightItems[idx];
    return !r.isDistractor && state.matchedPairs.has(r.word.id);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-xl)',
      width: '100%',
      maxWidth: '640px',
      margin: '0 auto',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.2rem',
        color: 'var(--color-ink)',
        textAlign: 'center',
      }}>
        Match the characters with their meanings
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-lg)',
        width: '100%',
      }}>
        {/* Left column - Hanzi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {leftItems.map((word, idx) => {
            const matched = isLeftMatched(idx);
            const selected = state.selectedLeft === idx;
            const flashing = state.incorrectFlash?.left === idx;

            return (
              <button
                key={word.id}
                onClick={() => handleLeftClick(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md) var(--space-lg)',
                  background: matched
                    ? 'rgba(45, 106, 79, 0.12)'
                    : flashing
                      ? 'rgba(215, 60, 55, 0.15)'
                      : selected
                        ? 'var(--color-paper)'
                        : 'var(--color-paper-light)',
                  border: `2px solid ${
                    matched ? '#2d6a4f'
                      : flashing ? 'var(--color-vermillion)'
                        : selected ? 'var(--color-crimson)'
                          : 'var(--color-gold)'
                  }`,
                  borderRadius: '4px',
                  fontFamily: 'var(--font-hanzi)',
                  fontSize: '1.8rem',
                  color: matched ? '#2d6a4f' : 'var(--color-ink-black)',
                  opacity: matched ? 0.6 : 1,
                  transition: 'all 0.2s',
                  minHeight: '56px',
                }}
              >
                {word.hanzi}
                {matched && <Check size={18} style={{ color: '#2d6a4f' }} />}
                {isSupported && !matched && (
                  <Volume2 size={14} style={{ opacity: 0.4 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Right column - Meanings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {rightItems.map((pair, idx) => {
            const matched = isRightMatched(idx);
            const selected = state.selectedRight === idx;
            const flashing = state.incorrectFlash?.right === idx;

            return (
              <button
                key={`${pair.word.id}-${idx}`}
                onClick={() => handleRightClick(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md) var(--space-lg)',
                  background: matched
                    ? 'rgba(45, 106, 79, 0.12)'
                    : flashing
                      ? 'rgba(215, 60, 55, 0.15)'
                      : selected
                        ? 'var(--color-paper)'
                        : 'var(--color-paper-light)',
                  border: `2px solid ${
                    matched ? '#2d6a4f'
                      : flashing ? 'var(--color-vermillion)'
                        : selected ? 'var(--color-crimson)'
                          : 'var(--color-gold)'
                  }`,
                  borderRadius: '4px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  color: matched ? '#2d6a4f' : 'var(--color-ink-black)',
                  opacity: matched ? 0.6 : 1,
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  minHeight: '56px',
                  lineHeight: 1.3,
                }}
              >
                {pair.word.meaning}
                {matched && <Check size={18} style={{ color: '#2d6a4f' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {completed && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          color: '#2d6a4f',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          <Check size={20} />
          All matched!
        </div>
      )}
    </div>
  );
}
