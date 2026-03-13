import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWordsStore } from '../store/words-store';
import { useToastStore } from '../store/toast-store';
import { useSpeech } from '../hooks/useSpeech';

export function LevelBrowsePage() {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const levelNum = parseInt(level ?? '1', 10);

  const { words, userWords, progress, loading, fetchWords, fetchUserWords, fetchProgress, markWord } =
    useWordsStore();
  const addToast = useToastStore((s) => s.addToast);
  const { speak, isSupported } = useSpeech();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    Promise.all([
      fetchWords(levelNum),
      fetchUserWords(levelNum),
      fetchProgress(),
    ]).catch((err) => addToast((err as Error).message, 'error'));
  }, [levelNum, fetchWords, fetchUserWords, fetchProgress, addToast]);

  const currentWord = words[currentIndex];
  const wordStatus = currentWord
    ? userWords.find((uw) => uw.word_id === currentWord.id)?.status
    : undefined;

  const levelProgress = progress.find((p) => p.level === levelNum);
  const known = levelProgress?.known ?? 0;
  const learn = levelProgress?.learn ?? 0;
  const total = levelProgress?.total ?? 0;

  const handleMark = async (status: 'learn' | 'known') => {
    if (!currentWord || marking) return;
    setMarking(true);
    try {
      await markWord(currentWord.id, status);
      await fetchProgress();
      if (currentIndex < words.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    } catch (err) {
      addToast((err as Error).message, 'error');
    } finally {
      setMarking(false);
    }
  };

  const isLast = currentIndex === words.length - 1;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ opacity: 0.6, fontFamily: 'var(--font-mono)' }}>Loading words…</p>
      </div>
    );
  }

  const borderColor =
    wordStatus === 'known' || wordStatus === 'mastered'
      ? '#2d6a4f'
      : wordStatus === 'learn'
        ? 'var(--color-vermillion)'
        : 'var(--color-gold)';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/browse')}
          style={{
            background: 'none',
            color: 'var(--color-ink-black)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            fontSize: '0.85rem',
            opacity: 0.65,
            padding: '4px 0',
          }}
        >
          <ArrowLeft size={16} />
          All levels
        </button>

        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--color-gold)',
          border: '1px solid var(--color-gold)',
          padding: '2px 10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          HSK {levelNum}
        </span>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.55 }}>
          {words.length > 0 ? `${currentIndex + 1} / ${words.length}` : '—'}
        </span>
      </div>

      {/* Progress stats */}
      {total > 0 && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-lg)',
          fontSize: '0.8rem',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ color: '#2d6a4f' }}>{known} known</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: 'var(--color-vermillion)' }}>{learn} learning</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ opacity: 0.6 }}>{total - known - learn} unsorted</span>
        </div>
      )}

      {/* Word card */}
      {currentWord ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2xl)' }}>
          <div style={{
            background: 'var(--color-paper-dark)',
            border: `2px solid ${borderColor}`,
            borderRadius: '4px',
            padding: 'var(--space-3xl) var(--space-2xl)',
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
            position: 'relative',
            transition: 'border-color 0.25s ease',
          }}>
            {wordStatus && (
              <span style={{
                position: 'absolute',
                top: 'var(--space-sm)',
                right: 'var(--space-md)',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                color: wordStatus === 'known' || wordStatus === 'mastered' ? '#2d6a4f' : 'var(--color-vermillion)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {wordStatus}
              </span>
            )}

            <div style={{
              fontFamily: 'var(--font-hanzi)',
              fontSize: 'clamp(4rem, 12vw, 7rem)',
              lineHeight: 1.1,
              color: 'var(--color-ink)',
              marginBottom: 'var(--space-lg)',
            }}>
              {currentWord.hanzi}
            </div>

            {isSupported && (
              <button
                onClick={() => speak(currentWord.hanzi)}
                style={{
                  background: 'none',
                  color: 'var(--color-ink-black)',
                  opacity: 0.45,
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginBottom: 'var(--space-lg)',
                }}
                title="Pronounce"
              >
                <Volume2 size={18} />
              </button>
            )}

            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              color: 'var(--color-ink-black)',
              opacity: 0.6,
              marginBottom: 'var(--space-sm)',
            }}>
              {currentWord.pinyin}
            </div>

            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              color: 'var(--color-ink-black)',
              lineHeight: 1.5,
            }}>
              {currentWord.meaning}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            width: '100%',
            maxWidth: '500px',
          }}>
            <button
              onClick={() => handleMark('learn')}
              disabled={marking}
              style={{
                flex: 1,
                padding: 'var(--space-md) var(--space-lg)',
                background: wordStatus === 'learn' ? 'var(--color-vermillion)' : 'transparent',
                color: wordStatus === 'learn' ? 'var(--color-paper-light)' : 'var(--color-vermillion)',
                border: '2px solid var(--color-vermillion)',
                borderRadius: '4px',
                fontSize: '0.95rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
                opacity: marking ? 0.6 : 1,
              }}
            >
              <X size={18} />
              Still learning
            </button>
            <button
              onClick={() => handleMark('known')}
              disabled={marking}
              style={{
                flex: 1,
                padding: 'var(--space-md) var(--space-lg)',
                background: wordStatus === 'known' || wordStatus === 'mastered' ? '#2d6a4f' : 'transparent',
                color: wordStatus === 'known' || wordStatus === 'mastered' ? 'var(--color-paper-light)' : '#2d6a4f',
                border: '2px solid #2d6a4f',
                borderRadius: '4px',
                fontSize: '0.95rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
                opacity: marking ? 0.6 : 1,
              }}
            >
              <Check size={18} />
              I know this
            </button>
          </div>

          {/* Prev / Next navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
              style={{
                background: 'none',
                color: 'var(--color-ink-black)',
                opacity: currentIndex === 0 ? 0.2 : 0.55,
                padding: 'var(--space-sm)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.45 }}>
              {currentIndex + 1} of {words.length}
            </span>

            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={isLast}
              style={{
                background: 'none',
                color: 'var(--color-ink-black)',
                opacity: isLast ? 0.2 : 0.55,
                padding: 'var(--space-sm)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Completion banner */}
          {isLast && (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-lg) var(--space-xl)',
              background: 'var(--color-paper-dark)',
              border: '1px solid var(--color-gold)',
              borderRadius: '4px',
              maxWidth: '500px',
              width: '100%',
            }}>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-xs)',
              }}>
                All words reviewed
              </p>
              <p style={{ fontSize: '0.85rem', opacity: 0.65, fontFamily: 'var(--font-mono)' }}>
                {known} known · {learn} still learning
              </p>
            </div>
          )}
        </div>
      ) : (
        <p style={{ textAlign: 'center', opacity: 0.6 }}>No words found for HSK {levelNum}.</p>
      )}
    </div>
  );
}
