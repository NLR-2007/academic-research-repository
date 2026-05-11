import { NavLink } from 'react-router-dom';

const links = [
  {
    to: '/admin',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/admin/papers',
    label: 'Paper Manager',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'User Manager',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar" style={{ display: 'grid', gap: '0.2rem' }}>
      <p style={{
        margin: '0 0 0.75rem',
        fontSize: '0.68rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.10em',
        color: 'var(--muted)',
        paddingLeft: '0.7rem',
        fontFamily: "'Source Sans 3', sans-serif",
      }}>
        Administration
      </p>

      {links.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.5rem 0.7rem',
            borderRadius: '3px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: isActive ? 'var(--primary)' : 'var(--muted)',
            background: isActive ? 'var(--primary-light)' : 'transparent',
            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.12s',
          })}
        >
          {icon}
          {label}
        </NavLink>
      ))}

      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <p style={{
          margin: '0 0 0.5rem',
          fontSize: '0.68rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          color: 'var(--muted)',
          paddingLeft: '0.7rem',
          fontFamily: "'Source Sans 3', sans-serif",
        }}>
          Quick info
        </p>
        <div style={{ padding: '0.6rem 0.7rem', fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.55 }}>
          <p style={{ margin: '0 0 0.25rem' }}>Lumina Admin Panel</p>
          <p style={{ margin: 0, color: 'var(--muted-2)' }}>Academic Repository</p>
        </div>
      </div>
    </aside>
  );
}
