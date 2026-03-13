import { useCallback, useEffect, useState } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import type { StudyCard } from '../types/user-word';
import { useToastStore } from '../store/toast-store';
import { Flashcard } from '../components/Flashcard';
import { SwipeContainer } from '../components/SwipeContainer';

function assignModes(cards: StudyCard[]): StudyCard[] {
  return cards.map((c) => ({
    ...c,
    mode: Math.random() > 0.5 ? 'hanzi-to-meaning' : 'meaning-to-hanzi',
  }));
}

interface SessionStats {
  correct: number;
  incorrect: number;
  mastered: number;
}

export function LearnPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ correct: 0, incorrect: 0, mastered: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<StudyCard[]>('/user-words/session?limit=20');
      const withModes = assignModes(data);
      setCards(withModes);
      setCurrentIndex(0);
      setRevealed(false);
      setStats({ correct: 0, incorrect: 0, mastered: 0 });
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

  const handleAnswer = async (correct: boolean) => {
    if (reviewing || !revealed) return;
    setReviewing(true);

    const card = cards[currentIndex];
    try {
      const updated = await api.patch<StudyCard>(`/user-words/${card.id}/review`, { correct });

      setStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
        mastered: prev.mastered + (updated.status === 'mastered' ? 1 : 0),
      }));

      if (!correct) {
        // Re-insert incorrect card 3-5 positions later
        const reinsertPos = Math.min(
          currentIndex + 3 + Math.floor(Math.random() * 3),
          cards.length,
        );
        const newCards = [...cards];
        const reinserted: StudyCard = {
          ...card,
          mode: Math.random() > 0.5 ? 'hanzi-to-meaning' : 'meaning-to-hanzi',
        };
        newCards.splice(reinsertPos, 0, reinserted);
        setCards(newCards);
      }

      const nextIdx = currentIndex + 1;
      if (nextIdx >= cards.length + (correct ? 0 : 1)) {
        setSessionDone(true);
      } else {
        setCurrentIndex(nextIdx);
        setRevealed(false);
      }
    } catch (err) {
      addToast((err as Error).message, 'error');
    } finally {
      setReviewing(false);
    }
  };

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

  if (cards.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-lg)',
      }}>
        <h2 style={{ fontSize: '1.5rem' }}>No cards to study</h2>
        <p style={{ opacity: 0.6, textAlign: 'center', maxWidth: '400px' }}>
          Mark some words as "Learn" in the Browse page to start studying.
        </p>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-xl)',
      }}>
        <h2 style={{ fontSize: '1.75rem' }}>Session Complete</h2>
        <div style={{
          background: 'var(--color-paper)',
          border: '1px solid var(--color-gold)',
          borderRadius: '4px',
          padding: 'var(--space-2xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          minWidth: '280px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Correct</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#2d6a4f', fontWeight: 500 }}>
              {stats.correct}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Incorrect</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-vermillion)', fontWeight: 500 }}>
              {stats.incorrect}
            </span>
          </div>
          {stats.mastered > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Newly mastered</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)', fontWeight: 500 }}>
                {stats.mastered}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={fetchSession}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--color-crimson)',
            color: 'var(--color-paper-light)',
            padding: '0.7rem 1.5rem',
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

  const currentCard = cards[currentIndex];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-lg)',
      minHeight: '70vh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '480px',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', opacity: 0.6 }}>
          {currentIndex + 1} / {cards.length}
        </span>
        <button
          onClick={() => setShowPinyin(!showPinyin)}
          style={{
            background: showPinyin ? 'var(--color-crimson)' : 'var(--color-paper-dark)',
            color: showPinyin ? 'var(--color-paper-light)' : 'var(--color-ink-black)',
            border: '1px solid',
            borderColor: showPinyin ? 'var(--color-crimson)' : 'var(--color-gold)',
            borderRadius: '12px',
            padding: '0.3rem 0.8rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Pinyin {showPinyin ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Card */}
      <SwipeContainer
        onSwipeRight={() => handleAnswer(true)}
        onSwipeLeft={() => handleAnswer(false)}
        enabled={revealed}
      >
        <Flashcard
          key={`${currentCard.id}-${currentIndex}`}
          card={currentCard}
          showPinyin={showPinyin}
          onRevealed={() => setRevealed(true)}
        />
      </SwipeContainer>

      {/* Buttons */}
      {revealed && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-lg)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <button
            onClick={() => handleAnswer(false)}
            disabled={reviewing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'transparent',
              color: 'var(--color-vermillion)',
              border: '1px solid var(--color-vermillion)',
              borderRadius: '4px',
              padding: '0.6rem 1.5rem',
              fontWeight: 500,
              fontSize: '0.95rem',
              opacity: reviewing ? 0.5 : 1,
            }}
          >
            <X size={18} />
            Incorrect
          </button>
          <button
            onClick={() => handleAnswer(true)}
            disabled={reviewing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#2d6a4f',
              color: 'var(--color-paper-light)',
              border: '1px solid #2d6a4f',
              borderRadius: '4px',
              padding: '0.6rem 1.5rem',
              fontWeight: 500,
              fontSize: '0.95rem',
              opacity: reviewing ? 0.5 : 1,
            }}
          >
            <Check size={18} />
            Correct
          </button>
        </div>
      )}
    </div>
  );
}
