interface ProgressBarProps {
  known: number;
  total: number;
}

export function ProgressBar({ known, total }: ProgressBarProps) {
  const percentage = total > 0 ? (known / total) * 100 : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
      <div style={{
        flex: 1,
        height: '8px',
        background: 'var(--color-paper-dark)',
        border: '1px solid var(--color-gold)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: 'var(--color-crimson)',
          borderRadius: '3px',
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{
        fontSize: '0.85rem',
        color: 'var(--color-ink-black)',
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap',
      }}>
        {known} / {total}
      </span>
    </div>
  );
}
