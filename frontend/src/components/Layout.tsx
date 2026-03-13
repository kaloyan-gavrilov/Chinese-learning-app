import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, GraduationCap, LogOut, ScrollText } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';

export function Layout() {
  const { user, signOut } = useAuthStore();

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1rem',
    color: isActive ? 'var(--color-crimson)' : 'var(--color-ink-black)',
    fontWeight: isActive ? 500 : 400,
    borderBottom: isActive ? '2px solid var(--color-crimson)' : '2px solid transparent',
    transition: 'all 0.2s',
    textDecoration: 'none',
    fontSize: '0.95rem',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-xl)',
        borderBottom: '1px solid var(--color-gold)',
        background: 'var(--color-paper)',
        height: '60px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.35rem',
            color: 'var(--color-ink)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}>
            汉字学习
          </span>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <NavLink to="/browse" style={({ isActive }) => navLinkStyle(isActive)}>
              <BookOpen size={18} />
              Browse
            </NavLink>
            <NavLink to="/learn" style={({ isActive }) => navLinkStyle(isActive)}>
              <GraduationCap size={18} />
              Learn
            </NavLink>
            <NavLink to="/reading" style={({ isActive }) => navLinkStyle(isActive)}>
              <ScrollText size={18} />
              Reading
            </NavLink>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-black)', opacity: 0.7 }}>
            {user?.email}
          </span>
          <button
            onClick={() => signOut()}
            style={{
              background: 'none',
              color: 'var(--color-ink-black)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.85rem',
              opacity: 0.7,
              padding: '0.4rem',
            }}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: 'var(--space-xl)' }}>
        <Outlet />
      </main>
    </div>
  );
}
