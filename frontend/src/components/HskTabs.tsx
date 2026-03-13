interface HskTabsProps {
  activeLevel: number;
  onLevelChange: (level: number) => void;
}

const levels = [1, 2, 3, 4];

export function HskTabs({ activeLevel, onLevelChange }: HskTabsProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    }}>
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onLevelChange(level)}
          style={{
            padding: '0.5rem 1.25rem',
            background: activeLevel === level ? 'var(--color-crimson)' : 'var(--color-paper-dark)',
            color: activeLevel === level ? 'var(--color-paper-light)' : 'var(--color-ink-black)',
            border: '1px solid',
            borderColor: activeLevel === level ? 'var(--color-crimson)' : 'var(--color-gold)',
            borderRadius: '4px',
            fontWeight: 500,
            fontSize: '0.9rem',
            fontFamily: 'var(--font-body)',
          }}
        >
          HSK {level}
        </button>
      ))}
    </div>
  );
}
