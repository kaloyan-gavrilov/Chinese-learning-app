import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useToastStore } from '../store/toast-store';

export function LoginPage() {
  const { user, loading, signIn } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/browse" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      addToast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: 'var(--space-xl)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--color-paper)',
        border: '1px solid var(--color-gold)',
        borderRadius: '4px',
        padding: 'var(--space-2xl)',
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: 'var(--space-xs)',
          fontSize: '2rem',
        }}>
          汉字学习
        </h1>
        <p style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--color-ink-black)',
          opacity: 0.6,
          marginBottom: 'var(--space-xl)',
        }}>
          Sign in to continue studying
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: 'var(--space-xs)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: 'var(--space-xs)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'var(--color-crimson)',
              color: 'var(--color-paper-light)',
              padding: '0.7rem',
              borderRadius: '4px',
              fontWeight: 500,
              fontSize: '1rem',
              marginTop: 'var(--space-sm)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-lg)',
          fontSize: '0.85rem',
        }}>
          Don't have an account?{' '}
          <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
