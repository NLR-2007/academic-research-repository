import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { adminApi, userApi } from '../api/endpoints.js';

const Divider = () => (
  <span
    className="nav-divider"
    aria-hidden="true"
    style={{
      width: '1px',
      height: '1.1rem',
      background: 'var(--border-strong)',
      alignSelf: 'center',
      margin: '0 0.15rem',
      flexShrink: 0,
    }}
  />
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState(0);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (user?.role !== 'admin') return undefined;
    const load = async () => {
      try {
        const { data } = await adminApi.pendingCount();
        setPending(data.count || 0);
      } catch { /* silent */ }
    };
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'user') return;
    userApi.profile()
      .then(({ data }) => {
        const count = (data.notifications || []).filter((n) => !n.is_read).length;
        setUnread(count);
      })
      .catch(() => {});
  }, [user]);

  return (
    <header className="nav">
      <Link className="brand" to="/">
        <span className="brand-mark" aria-hidden="true">
          <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
            <path d="M6.5 0 L6.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <ellipse cx="6.5" cy="8" rx="3.5" ry="4.5" fill="currentColor" opacity="0.9"/>
            <rect x="5" y="12.5" width="3" height="2" rx="1" fill="currentColor" opacity="0.7"/>
          </svg>
        </span>
        <span className="brand-name">Lumina</span>
      </Link>

      <button
        className="nav-hamburger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`hamburger-icon ${open ? 'open' : ''}`} />
      </button>

      <nav className={open ? 'open' : ''}>

        {/* ── Section 1: Public ── */}
        {!user && <NavLink to="/">Home</NavLink>}
        <NavLink to="/papers">Browse Papers</NavLink>
        <NavLink to="/about">About</NavLink>

        {/* ── Section 2: Role-specific ── */}
        {user?.role === 'user' && (
          <>
            <Divider />
            <NavLink to="/upload">Submit Paper</NavLink>
            <NavLink to="/profile" style={{ position: 'relative' }}>
              My Profile
              {unread > 0 && (
                <span className="mini-badge animate-pulse-soft" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                  {unread}
                </span>
              )}
            </NavLink>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <Divider />
            <NavLink to="/admin" end>Dashboard</NavLink>
            <NavLink to="/admin/papers" style={{ position: 'relative' }}>
              Papers
              {pending > 0 && (
                <span className="mini-badge animate-pulse-soft">{pending}</span>
              )}
            </NavLink>
            <NavLink to="/admin/users">Users</NavLink>
          </>
        )}

        {/* ── Section 3: Auth ── */}
        <Divider />
        {user ? (
          <button className="link-button logout-button" onClick={logout}>
            Sign out
          </button>
        ) : (
          <>
            <NavLink to="/login">Sign in</NavLink>
            <NavLink className="nav-cta" to="/register">Register</NavLink>
          </>
        )}

      </nav>
    </header>
  );
}
