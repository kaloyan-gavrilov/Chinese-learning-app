import { useCallback, useEffect, useState } from 'react';
import { Check, X, RotateCcw, Zap, BookOpen, Headphones, Grid3X3, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import type { StudyCard } from '../types/user-word';
import type { Word } from '../types/word';
import { useToastStore } from '../store/toast-store';
import { Flashcard } from '../components/Flashcard';
import { SwipeContainer } from '../components/SwipeContainer';
import { MatchingGame } from '../components/MatchingGame';
import { ListeningQuiz } from '../components/ListeningQuiz';
import { MultipleChoice } from '../components/MultipleChoice';

type ExerciseType = 'flashcard' | 'matching' | 'listening' | 'multiple-choice';

interface Exercise {
  type: ExerciseType;
  cards: StudyCard[];
  distractors?: Word[];
  direction?: 'hanzi-to-meaning' | 'meaning-to-hanzi';
}

interface SessionStats {
  correct: number;
  incorrect: number;
  total: number;
}

function assignModes(cards: StudyCard[]): StudyCard[] {
  return cards.map((c) => ({
    ...c,
    mode: Math.random() > 0.5 ? 'hanzi-to-meaning' : 'meaning-to-hanzi',
  }));
}

/**
 * Build a mixed exercise plan from session cards + distractors.
 * Distributes cards across exercise types for variety.
 */
function buildExercisePlan(cards: StudyCard[], distractors: Word[]): Exercise[] {
  if (cards.length === 0) return [];

  const exercises: Exercise[] = [];
  const shuffled = [...cards];
  let idx = 0;

  while (idx < shuffled.length) {
    const remaining = shuffled.length - idx;

    // Matching game needs 4-5 cards
    if (remaining >= 4 && exercises.length % 4 === 0) {
      const matchCount = Math.min(5, remaining);
      const matchCards = shuffled.slice(idx, idx + matchCount);
      exercises.push({
        type: 'matching',
        cards: matchCards,
        distractors: distractors.slice(0, 2),
      });
      idx += matchCount;
      continue;
    }

    // Alternate between flashcard, listening, and multiple choice
    const exerciseOptions: ExerciseType[] = ['flashcard', 'listening', 'multiple-choice'];
    const pick = exerciseOptions[exercises.length % exerciseOptions.length];

    const card = shuffled[idx];
    const direction: 'hanzi-to-meaning' | 'meaning-to-hanzi' =
      Math.random() > 0.5 ? 'hanzi-to-meaning' : 'meaning-to-hanzi';

    if (pick === 'listening' && distractors.length >= 3) {
      exercises.push({
        type: 'listening',
        cards: [card],
        distractors: distractors.slice(0, 3),
      });
    } else if (pick === 'multiple-choice' && distractors.length >= 3) {
      exercises.push({
        type: 'multiple-choice',
        cards: [card],
        distractors: distractors.slice(0, 3),
        direction,
      });
    } else {
      exercises.push({
        type: 'flashcard',
        cards: [{ ...card, mode: direction }],
      });
    }
    idx += 1;
  }

  return exercises;
}

export function LearnPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [allCards, setAllCards] = useState<StudyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SessionStats>({ correct: 0, incorrect: 0, total: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  // Flashcard-specific state
  const [revealed, setRevealed] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    try {
      const cards = await api.get<StudyCard[]>('/user-words/session?limit=20');
      if (cards.length === 0) {
        setAllCards([]);
        setExercises([]);
        setLoading(false);
        return;
      }

      const withModes = assignModes(cards);
      setAllCards(withModes);

      // Fetch distractors for exercises
      const wordIds = cards.map((c) => c.word_id);
      let distractors: Word[] = [];
      try {
        distractors = await api.post<Word[]>('/user-words/distractors', {
          word_ids: wordIds,
          count: 12,
        });
      } catch {
        // Fallback: no distractors, will use flashcard-only mode
      }

      const plan = buildExercisePlan(withModes, distractors);
      setExercises(plan);
      setCurrentIdx(0);
      setRevealed(false);
      setStats({ correct: 0, incorrect: 0, total: 0 });
      setSessionDone(false);
    } catch (err) {
      addToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const advanceExercise = useCallback(() => {
    const next = currentIdx + 1;
    if (next >= exercises.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx(next);
      setRevealed(false);
    }
  }, [currentIdx, exercises.length]);

  // Record review on backend
  const recordReview = useCallback(async (cardId: string, correct: boolean) => {
    try {
      await api.patch(`/user-words/${cardId}/review`, { correct });
    } catch {
      // Silent fail for review recording — don't break UX
    }
  }, []);

  // Flashcard answer handler
  const handleFlashcardAnswer = useCallback(async (correct: boolean) => {
    if (reviewing || !revealed) return;
    setReviewing(true);

    const exercise = exercises[currentIdx];
    const card = exercise.cards[0];

    await recordReview(card.id, correct);

    setStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1,
    }));

    // If incorrect, re-insert as a flashcard later in the session
    if (!correct) {
      const reinsertPos = Math.min(
        currentIdx + 3 + Math.floor(Math.random() * 3),
        exercises.length,
      );
      const newExercises = [...exercises];
      newExercises.splice(reinsertPos, 0, {
        type: 'flashcard',
        cards: [{ ...card, mode: Math.random() > 0.5 ? 'hanzi-to-meaning' : 'meaning-to-hanzi' }],
      });
      setExercises(newExercises);
    }

    setTimeout(() => {
      setReviewing(false);
      advanceExercise();
    }, 250);
  }, [reviewing, revealed, exercises, currentIdx, recordReview, advanceExercise]);

  // Matching game complete handler
  const handleMatchingComplete = useCallback(async (results: { wordId: string; correct: boolean }[]) => {
    // Find corresponding cards for review recording
    const exercise = exercises[currentIdx];
    for (const result of results) {
      const card = exercise.cards.find((c) => c.word_id === result.wordId);
      if (card) {
        await recordReview(card.id, result.correct);
      }
    }

    const correctCount = results.filter((r) => r.correct).length;
    const incorrectCount = results.length - correctCount;

    setStats((prev) => ({
      correct: prev.correct + correctCount,
      incorrect: prev.incorrect + incorrectCount,
      total: prev.total + results.length,
    }));

    // Re-insert incorrect words as flashcards
    const incorrectCards = results
      .filter((r) => !r.correct)
      .map((r) => exercise.cards.find((c) => c.word_id === r.wordId))
      .filter(Boolean) as StudyCard[];

    if (incorrectCards.length > 0) {
      const newExercises = [...exercises];
      for (const card of incorrectCards) {
        const pos = Math.min(currentIdx + 2 + Math.floor(Math.random() * 3), newExercises.length);
        newExercises.splice(pos, 0, {
          type: 'flashcard',
          cards: [{ ...card, mode: Math.random() > 0.5 ? 'hanzi-to-meaning' : 'meaning-to-hanzi' }],
        });
      }
      setExercises(newExercises);
    }

    setTimeout(advanceExercise, 800);
  }, [exercises, currentIdx, recordReview, advanceExercise]);

  // Listening / Multiple choice answer handler
  const handleQuizAnswer = useCallback(async (correct: boolean) => {
    const exercise = exercises[currentIdx];
    const card = exercise.cards[0];

    await recordReview(card.id, correct);

    setStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1,
    }));

    if (!correct) {
      const newExercises = [...exercises];
      const pos = Math.min(currentIdx + 3 + Math.floor(Math.random() * 3), newExercises.length);
      newExercises.splice(pos, 0, {
        type: 'flashcard',
        cards: [{ ...card, mode: Math.random() > 0.5 ? 'hanzi-to-meaning' : 'meaning-to-hanzi' }],
      });
      setExercises(newExercises);
    }

    // The quiz components have their own delay, then we advance
    setTimeout(advanceExercise, 200);
  }, [exercises, currentIdx, recordReview, advanceExercise]);

  // --- Render ---

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        fontFamily: 'var(--font-heading)',
        color: 'var(--color-ink)',
        fontSize: '1.25rem',
      }}>
        Loading session...
      </div>
    );
  }

  if (allCards.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-lg)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '2px solid var(--color-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.5,
        }}>
          <BookOpen size={28} style={{ color: 'var(--color-ink)' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem' }}>No cards to study</h2>
        <p style={{ opacity: 0.5, textAlign: 'center', maxWidth: '360px', fontSize: '0.95rem' }}>
          Mark some words as "Still learning" in the Browse page to start studying.
        </p>
      </div>
    );
  }

  if (sessionDone) {
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-xl)',
        animation: 'fadeIn 0.4s ease',
      }}>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)' }}>
          Session Complete
        </h2>

        {/* Accuracy ring */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
        }}>
          <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-paper-dark)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={accuracy >= 70 ? '#2d6a4f' : 'var(--color-vermillion)'}
              strokeWidth="8"
              strokeDasharray={`${(accuracy / 100) * 327} 327`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <span style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.5rem',
            fontWeight: 500,
            color: accuracy >= 70 ? '#2d6a4f' : 'var(--color-vermillion)',
          }}>
            {accuracy}%
          </span>
        </div>

        <div style={{
          background: 'var(--color-paper)',
          border: '1px solid var(--color-gold)',
          borderRadius: '4px',
          padding: 'var(--space-xl) var(--space-2xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          minWidth: '260px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} style={{ color: '#2d6a4f' }} /> Correct
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#2d6a4f', fontWeight: 500 }}>
              {stats.correct}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <X size={16} style={{ color: 'var(--color-vermillion)' }} /> Incorrect
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-vermillion)', fontWeight: 500 }}>
              {stats.incorrect}
            </span>
          </div>
          <div style={{
            borderTop: '1px solid var(--color-gold)',
            paddingTop: 'var(--space-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            opacity: 0.6,
            fontSize: '0.9rem',
          }}>
            <span>Total</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{stats.total}</span>
          </div>
        </div>

        <button
          onClick={fetchSession}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--color-crimson)',
            color: 'var(--color-paper-light)',
            padding: '0.75rem 1.75rem',
            borderRadius: '4px',
            fontWeight: 500,
            fontSize: '1rem',
          }}
        >
          <RotateCcw size={18} />
          Study Again
        </button>
      </div>
    );
  }

  const exercise = exercises[currentIdx];
  const progressPercent = ((currentIdx) / exercises.length) * 100;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-lg)',
      minHeight: '70vh',
    }}>
      {/* Progress bar + controls */}
      <div style={{
        width: '100%',
        maxWidth: '640px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
      }}>
        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'var(--color-paper-dark)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'var(--color-crimson)',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.5 }}>
              {currentIdx + 1} / {exercises.length}
            </span>

            {/* Exercise type indicator */}
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--color-ink)',
              background: 'rgba(181, 31, 9, 0.08)',
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {exercise.type === 'flashcard' && <><Zap size={12} /> Flashcard</>}
              {exercise.type === 'matching' && <><Grid3X3 size={12} /> Match</>}
              {exercise.type === 'listening' && <><Headphones size={12} /> Listen</>}
              {exercise.type === 'multiple-choice' && <><BookOpen size={12} /> Quiz</>}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            {/* Stats mini display */}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#2d6a4f' }}>
              {stats.correct}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.3 }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-vermillion)' }}>
              {stats.incorrect}
            </span>

            {exercise.type === 'flashcard' && (
              <button
                onClick={() => setShowPinyin(!showPinyin)}
                style={{
                  background: showPinyin ? 'var(--color-crimson)' : 'var(--color-paper-dark)',
                  color: showPinyin ? 'var(--color-paper-light)' : 'var(--color-ink-black)',
                  border: '1px solid',
                  borderColor: showPinyin ? 'var(--color-crimson)' : 'var(--color-gold)',
                  borderRadius: '12px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  marginLeft: 'var(--space-sm)',
                }}
              >
                拼音 {showPinyin ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exercise content */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease',
      }}
        key={`exercise-${currentIdx}`}
      >
        {exercise.type === 'flashcard' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-lg)',
          }}>
            <SwipeContainer
              onSwipeRight={() => handleFlashcardAnswer(true)}
              onSwipeLeft={() => handleFlashcardAnswer(false)}
              enabled={revealed}
            >
              <Flashcard
                key={`${exercise.cards[0].id}-${currentIdx}`}
                card={exercise.cards[0]}
                showPinyin={showPinyin}
                onRevealed={() => setRevealed(true)}
              />
            </SwipeContainer>

            {revealed && (
              <div style={{
                display: 'flex',
                gap: 'var(--space-lg)',
                animation: 'fadeIn 0.2s ease',
              }}>
                <button
                  onClick={() => handleFlashcardAnswer(false)}
                  disabled={reviewing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'transparent',
                    color: 'var(--color-vermillion)',
                    border: '1.5px solid var(--color-vermillion)',
                    borderRadius: '4px',
                    padding: '0.6rem 1.3rem',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    opacity: reviewing ? 0.5 : 1,
                  }}
                >
                  <X size={16} />
                  Again
                </button>
                <button
                  onClick={() => handleFlashcardAnswer(true)}
                  disabled={reviewing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#2d6a4f',
                    color: 'var(--color-paper-light)',
                    border: '1.5px solid #2d6a4f',
                    borderRadius: '4px',
                    padding: '0.6rem 1.3rem',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    opacity: reviewing ? 0.5 : 1,
                  }}
                >
                  <Check size={16} />
                  Got it
                </button>
              </div>
            )}
          </div>
        )}

        {exercise.type === 'matching' && (
          <MatchingGame
            key={`matching-${currentIdx}`}
            studyWords={exercise.cards.map((c) => c.words)}
            distractors={exercise.distractors ?? []}
            onComplete={handleMatchingComplete}
          />
        )}

        {exercise.type === 'listening' && (
          <ListeningQuiz
            key={`listening-${currentIdx}`}
            targetWord={exercise.cards[0].words}
            options={exercise.distractors ?? []}
            onAnswer={handleQuizAnswer}
          />
        )}

        {exercise.type === 'multiple-choice' && (
          <MultipleChoice
            key={`mc-${currentIdx}`}
            targetWord={exercise.cards[0].words}
            options={exercise.distractors ?? []}
            direction={exercise.direction ?? 'hanzi-to-meaning'}
            onAnswer={handleQuizAnswer}
          />
        )}
      </div>
    </div>
  );
}
