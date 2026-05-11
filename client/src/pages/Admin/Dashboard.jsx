import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { adminApi } from '../../api/endpoints.js';
import { uploadsBase } from '../../api/client';
import { useAdminActions } from '../../hooks/useAdminActions';

/* ── Custom Recharts tooltip matching the academic theme ── */
function AcademicTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.18)',
      borderLeft: '3px solid #1a3a5c',
      borderRadius: '3px',
      padding: '0.6rem 0.9rem',
      fontSize: '0.8rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 700, color: '#1a3a5c', fontFamily: "'Merriweather', serif" }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ margin: 0, color: '#6b6557' }}>
          {entry.value} {entry.name === 'count' ? 'papers' : ''}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ q: '', category: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { approve, reject, isProcessing } = useAdminActions(load);

  async function load(nextFilters = filters) {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.dashboard(nextFilters);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(filters), 280);
    return () => clearTimeout(timer);
  }, [filters.q, filters.category, filters.status]);

  /* ── Error state ── */
  if (error) {
    return (
      <div className="workspace-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</p>
        <h2 style={{ color: 'var(--danger)', fontFamily: "'Merriweather', serif", marginBottom: '0.5rem' }}>Dashboard Error</h2>
        <p className="muted" style={{ marginBottom: '1.25rem' }}>{error}</p>
        <button onClick={() => load()}>Retry</button>
      </div>
    );
  }

  /* ── Initial loading skeleton ── */
  if (!data && loading) {
    return (
      <section className="admin-dashboard">
        <div className="skeleton-card" style={{ minHeight: '8rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1rem' }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton-card" style={{ minHeight: '6rem' }} />)}
        </div>
        <div className="skeleton-card" style={{ minHeight: '20rem' }} />
      </section>
    );
  }

  return (
    <section className="admin-dashboard">

        {/* ── Hero ── */}
        <div className="admin-hero-panel">
          <div>
            <p className="eyebrow dark">Control Panel</p>
            <h1 style={{ margin: '0.2rem 0 0.4rem', fontFamily: "'Merriweather', serif", fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: 'var(--primary)' }}>
              Repository Dashboard
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: '0.875rem' }}>
              Review pending submissions, monitor activity, and manage the Lumina repository.
            </p>
          </div>
          <div className="admin-quick-actions">
            <Link className="button" to="/upload">Add paper</Link>
            <Link className="ghost-button" to="/admin/papers">Manage papers</Link>
            <Link className="ghost-button" to="/admin/users">Manage users</Link>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="admin-stats-grid">
          {[
            { label: 'Total Papers',          value: data.total_papers || 0,          cls: 'accent-forest' },
            { label: 'Total Users',           value: data.total_users || 0,           cls: 'accent-gold'   },
            { label: 'Pending Review',        value: data.pending_review || 0,        cls: 'accent-clay'   },
            { label: 'Approved This Month',   value: data.approved_this_month || 0,   cls: 'accent-forest' },
            { label: 'Rejected This Month',   value: data.rejected_this_month || 0,   cls: 'accent-clay'   },
          ].map(({ label, value, cls }) => (
            <article key={label} className={`admin-stat-card ${cls}`}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="admin-chart-grid">
          <div className="workspace-panel">
            <div className="section-heading tight">
              <div>
                <p className="eyebrow dark">Category breakdown</p>
                <h2>Papers per category</h2>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.categoryCounts} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b6557' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b6557' }} />
                <Tooltip content={<AcademicTooltip />} />
                <Bar dataKey="count" fill="#1a3a5c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="workspace-panel">
            <div className="section-heading tight">
              <div>
                <p className="eyebrow dark">Submission trend</p>
                <h2>Monthly submissions</h2>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.monthlyTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b6557' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b6557' }} />
                <Tooltip content={<AcademicTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#b8860b" strokeWidth={2.5} dot={{ r: 4, fill: '#b8860b', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Main + side ── */}
        <div className="admin-main-grid">

          <div className="admin-main-column">

            {/* Recent activity */}
            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Live feed</p>
                  <h2>Recent activity</h2>
                </div>
              </div>
              <div className="stack-list compact">
                {data.recentActivity.length ? data.recentActivity.map((item, i) => (
                  <article
                    className="activity-card"
                    key={`${item.type}-${item.paper_id || i}-${item.created_at}`}
                  >
                    <div className={`activity-dot ${item.type}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block' }}>{item.message}</strong>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted-2)' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </article>
                )) : (
                  <p className="muted" style={{ fontStyle: 'italic', padding: '0.5rem 0' }}>
                    Activity appears here as papers are uploaded or reviewed.
                  </p>
                )}
              </div>
            </div>

            {/* Pending papers */}
            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Awaiting decision</p>
                  <h2>Pending submissions</h2>
                </div>
                <span className="result-pill">{data.pendingPapers.length} pending</span>
              </div>

              <div className="stack-list" style={{ position: 'relative' }}>
                {isProcessing && (
                  <div className="loading-overlay">Processing…</div>
                )}

                {data.pendingPapers.length ? data.pendingPapers.map((paper) => (
                  <article className="admin-paper-card premium fade-in" key={paper.id}>
                    <div className="admin-card-header">
                      <strong style={{ fontSize: '0.95rem', color: 'var(--primary-dark)', fontFamily: "'Merriweather', serif" }}>
                        {paper.title}
                      </strong>
                      <span className="chip pending">pending</span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0.6rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {paper.uploader_name} · {paper.category_name} · {new Date(paper.uploaded_at).toLocaleDateString()}
                    </p>
                    <div className="action-row">
                      <a
                        href={`${uploadsBase}/uploads/${paper.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ghost-button"
                        style={{ fontSize: '0.82rem' }}
                      >
                        Read Paper
                      </a>
                      <button
                        className="approve-button"
                        onClick={() => approve(paper.id)}
                        disabled={isProcessing}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => reject(paper.id)}
                        disabled={isProcessing}
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                )) : (
                  <div className="empty-state compact">
                    <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--muted)' }}>
                      No pending submissions at this time.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Paper monitor / search */}
            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Search &amp; filter</p>
                  <h2>Paper monitor</h2>
                </div>
              </div>
              <div className="table-filters" style={{ marginBottom: '1rem' }}>
                <input
                  placeholder="Search title or author…"
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                />
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">All categories</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="stack-list compact">
                {data.filteredPapers.length ? data.filteredPapers.map((paper) => (
                  <div className="workspace-mini-card" key={paper.id}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--primary-dark)' }}>
                        {paper.title}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {paper.uploader_name} · {paper.category_name}
                      </span>
                    </div>
                    <span className={`chip ${paper.status}`}>{paper.status}</span>
                  </div>
                )) : (
                  <p className="muted" style={{ fontStyle: 'italic' }}>No papers match the current filters.</p>
                )}
              </div>
            </div>

          </div>

          {/* ── Sidebar column ── */}
          <aside className="admin-side-column">

            {/* Latest papers */}
            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">New uploads</p>
                  <h2>Latest papers</h2>
                </div>
              </div>
              <div className="stack-list compact">
                {data.latestPapers.length ? data.latestPapers.map((paper) => (
                  <div className="workspace-mini-card vertical" key={paper.id}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--primary-dark)' }}>{paper.title}</strong>
                    <span style={{ fontSize: '0.78rem' }}>{paper.uploader_name} · {paper.category_name}</span>
                  </div>
                )) : (
                  <p className="muted" style={{ fontStyle: 'italic' }}>No uploads yet.</p>
                )}
              </div>
            </div>

            {/* Top contributors */}
            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Leaderboard</p>
                  <h2>Top contributors</h2>
                </div>
              </div>
              <div className="stack-list compact">
                {data.topContributors.length ? data.topContributors.map((u, i) => (
                  <div className="contributor-card" key={u.id}>
                    <b>{i + 1}</b>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '0.875rem' }}>{u.name}</strong>
                      <span style={{ fontSize: '0.78rem' }}>{u.email}</span>
                    </div>
                    <span className="chip approved">{u.approved_papers} approved</span>
                  </div>
                )) : (
                  <p className="muted" style={{ fontStyle: 'italic' }}>Rankings appear after papers are approved.</p>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">System</p>
                  <h2>Notifications</h2>
                </div>
              </div>
              <div className="stack-list compact">
                {data.notifications.length ? data.notifications.map((note) => (
                  <article className="notification-card" key={note.id}>
                    <div className="notification-dot" />
                    <div>
                      <strong style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                        {note.type.replace(/_/g, ' ')}
                      </strong>
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem' }}>{note.message}</p>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--muted-2)' }}>
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                  </article>
                )) : (
                  <p className="muted" style={{ fontStyle: 'italic' }}>No system notifications.</p>
                )}
              </div>
            </div>

          </aside>
        </div>

      </section>
  );
}
