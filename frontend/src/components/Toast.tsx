import { X } from 'lucide-react';
import { useToastStore } from '../store/toast-store';

export function Toast() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: toast.type === 'error' ? 'var(--color-crimson)' :
                        toast.type === 'success' ? '#2d6a4f' : 'var(--color-ink-black)',
            color: 'var(--color-paper-light)',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeIn 0.2s ease',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            maxWidth: '360px',
          }}
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              color: 'inherit',
              padding: '2px',
              display: 'flex',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
