import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWordsStore } from '../store/words-store';
import { useToastStore } from '../store/toast-store';
import { ProgressBar } from '../components/ProgressBar';

const LEVEL_META: Record<number, { hanzi: string; label: string; description: string }> = {
  1: { hanzi: '一', label: 'HSK 1', description: 'Beginner · ~150 words' },
  2: { hanzi: '二', label: 'HSK 2', description: 'Elementary · ~300 words' },
  3: { hanzi: '三', label: 'HSK 3', description: 'Intermediate · ~600 words' },
  4: { hanzi: '四', label: 'HSK 4', description: 'Upper Intermediate · ~1,200 words' },
  5: { hanzi: '五', label: 'HSK 5', description: 'Advanced · ~2,500 words' },
  6: { hanzi: '六', label: 'HSK 6', description: 'Mastery · ~5,000 words' },
};

export function BrowsePage() {
  const navigate = useNavigate();
  const { progress, fetchProgress } = useWordsStore();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    fetchProgress().catch((err) => addToast((err as Error).message, 'error'));
  }, [fetchProgress, addToast]);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          color: 'var(--color-ink)',
          marginBottom: 'var(--space-xs)',
        }}>
          HSK Levels
        </h2>
        <p style={{ opacity: 0.6, fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>
          Select a level to sort words into known and learning buckets
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-lg)',
      }}>
        {[1, 2, 3, 4, 5, 6].map((level) => {
          const meta = LEVEL_META[level];
          const lvlProgress = progress.find((p) => p.level === level);
          const known = lvlProgress?.known ?? 0;
          const learn = lvlProgress?.learn ?? 0;
          const total = lvlProgress?.total ?? 0;
          const unsorted = total - known - learn;

          return (
            <button
              key={level}
              onClick={() => navigate(`/browse/${level}`)}
              style={{
                background: 'var(--color-paper-dark)',
                border: '1px solid var(--color-gold)',
                borderRadius: '4px',
                padding: 'var(--space-xl)',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)',
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-crimson)';
                e.currentTarget.style.background = 'var(--color-paper)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-gold)';
                e.currentTarget.style.background = 'var(--color-paper-dark)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: 'var(--font-hanzi)',
                  fontSize: '3.5rem',
                  lineHeight: 1,
                  color: 'var(--color-ink)',
                }}>
                  {meta.hanzi}
                </span>

                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--color-gold)',
                  border: '1px solid var(--color-gold)',
                  padding: '2px 8px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginTop: '4px',
                }}>
                  {meta.label}
                </span>
              </div>

              <div>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  opacity: 0.55,
                  marginBottom: 'var(--space-sm)',
                }}>
                  {meta.description}
                </p>

                {total > 0 ? (
                  <>
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-md)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: 'var(--space-sm)',
                    }}>
                      <span style={{ color: '#2d6a4f' }}>{known} known</span>
                      {learn > 0 && (
                        <span style={{ color: 'var(--color-vermillion)' }}>{learn} learning</span>
                      )}
                      {unsorted > 0 && (
                        <span style={{ opacity: 0.5 }}>{unsorted} unsorted</span>
                      )}
                    </div>
                    <ProgressBar known={known} total={total} />
                  </>
                ) : (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.4 }}>
                    Not started
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
