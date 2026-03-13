import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useToastStore } from '../store/toast-store';

export function RegisterPage() {
  const { user, loading, signUp } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/browse" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email, password);
      addToast('Check your email to confirm your account', 'success');
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
          Create your account
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
              autoComplete="new-password"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: 'var(--space-xs)' }}>Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
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
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-lg)',
          fontSize: '0.85rem',
        }}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
