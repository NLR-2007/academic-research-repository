import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import { adminApi } from '../../api/endpoints.js';
import { uploadsBase } from '../../api/client';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ q: '', category: '', status: '' });
  const [loading, setLoading] = useState(true);

  async function load(nextFilters = filters) {
    setLoading(true);
    const response = await adminApi.dashboard(nextFilters);
    setData(response.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load(filters);
    }, 250);
    return () => clearTimeout(timer);
  }, [filters.q, filters.category, filters.status]);

  async function approve(id) {
    await adminApi.approve(id);
    load();
  }

  async function reject(id) {
    const reason = window.prompt('Enter rejection reason');
    if (!reason) return;
    await adminApi.reject(id, reason);
    load();
  }

  if (!data && loading) {
    return <div className="admin-layout"><AdminSidebar /><section className="panel">Loading dashboard...</section></div>;
  }

  return (
    <div className="admin-layout admin-dashboard-layout">
      <AdminSidebar />
      <section className="admin-dashboard">
        <div className="admin-hero-panel">
          <div>
            <p className="eyebrow dark">Admin control panel</p>
            <h1>Academic Repository Dashboard</h1>
            <p className="muted">Track submissions, review pending work, watch activity, and manage the repository from one modern workspace.</p>
          </div>
          <div className="admin-quick-actions">
            <Link className="button" to="/upload">Add paper</Link>
            <Link className="ghost-button" to="/admin/papers">Manage papers</Link>
            <Link className="ghost-button" to="/admin/users">Manage users</Link>
          </div>
        </div>

        <div className="admin-stats-grid">
          <article className="admin-stat-card accent-forest">
            <span>Total Papers</span>
            <strong>{data.total_papers || 0}</strong>
          </article>
          <article className="admin-stat-card accent-gold">
            <span>Total Users</span>
            <strong>{data.total_users || 0}</strong>
          </article>
          <article className="admin-stat-card accent-clay">
            <span>Pending Papers</span>
            <strong>{data.pending_review || 0}</strong>
          </article>
          <article className="admin-stat-card accent-slate">
            <span>Approved This Month</span>
            <strong>{data.approved_this_month || 0}</strong>
          </article>
          <article className="admin-stat-card accent-forest">
            <span>Rejected This Month</span>
            <strong>{data.rejected_this_month || 0}</strong>
          </article>
        </div>

        <div className="admin-chart-grid">
          <div className="workspace-panel">
            <div className="section-heading tight">
              <div>
                <p className="eyebrow dark">Category view</p>
                <h2>Papers per category</h2>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.categoryCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ea580c" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-main-grid">
          <div className="admin-main-column">
            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Recent activity</p>
                  <h2>Repository feed</h2>
                </div>
              </div>
              <div className="stack-list">
                {data.recentActivity.length ? data.recentActivity.map((item, index) => (
                  <article className="activity-card" key={`${item.type}-${item.paper_id || index}-${item.created_at}`}>
                    <div className={`activity-dot ${item.type}`} />
                    <div>
                      <strong>{item.message}</strong>
                      <p>{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </article>
                )) : <p className="muted">Activity will appear as soon as papers are uploaded or reviewed.</p>}
              </div>
            </div>

            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Pending review</p>
                  <h2>Pending papers</h2>
                </div>
                <span className="result-pill">{data.pendingPapers.length} items</span>
              </div>
              <div className="stack-list">
                {data.pendingPapers.length ? data.pendingPapers.map((paper) => (
                  <article className="admin-paper-card" key={paper.id}>
                    <div>
                      <strong>{paper.title}</strong>
                      <p>{paper.uploader_name} | {paper.category_name}</p>
                      <small>{new Date(paper.uploaded_at).toLocaleString()}</small>
                    </div>
                    <div className="action-row">
                      <a 
                        href={`${uploadsBase}/uploads/${paper.file_path}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="button ghost-button"
                      >
                        Read Paper
                      </a>
                      <button onClick={() => approve(paper.id)}>Approve</button>
                      <button className="danger" onClick={() => reject(paper.id)}>Reject</button>
                    </div>
                  </article>
                )) : <p className="muted">No pending papers right now.</p>}
              </div>
            </div>

            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Search and filter</p>
                  <h2>Paper monitor</h2>
                </div>
              </div>
              <div className="table-filters">
                <input
                  placeholder="Search papers or authors"
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                />
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All categories</option>
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="stack-list compact">
                {data.filteredPapers.length ? data.filteredPapers.map((paper) => (
                  <div className="workspace-mini-card" key={paper.id}>
                    <div>
                      <strong>{paper.title}</strong>
                      <span>{paper.uploader_name} | {paper.category_name}</span>
                    </div>
                    <span className={`chip ${paper.status}`}>{paper.status}</span>
                  </div>
                )) : <p className="muted">No papers match the current filters.</p>}
              </div>
            </div>
          </div>

          <aside className="admin-side-column">
            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Latest uploads</p>
                  <h2>Latest papers</h2>
                </div>
              </div>
              <div className="stack-list compact">
                {data.latestPapers.length ? data.latestPapers.map((paper) => (
                  <div className="workspace-mini-card vertical" key={paper.id}>
                    <strong>{paper.title}</strong>
                    <span>{paper.uploader_name}</span>
                    <span>{paper.category_name}</span>
                  </div>
                )) : <p className="muted">Latest uploads will appear here.</p>}
              </div>
            </div>

            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Top contributors</p>
                  <h2>Most approved researchers</h2>
                </div>
              </div>
              <div className="stack-list compact">
                {data.topContributors.length ? data.topContributors.map((user, index) => (
                  <div className="contributor-card" key={user.id}>
                    <b>{index + 1}</b>
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <span className="chip approved">{user.approved_papers} approved</span>
                  </div>
                )) : <p className="muted">Contributor rankings will appear here.</p>}
              </div>
            </div>

            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Notifications</p>
                  <h2>System updates</h2>
                </div>
              </div>
              <div className="stack-list compact">
                {data.notifications.length ? data.notifications.map((note) => (
                  <article className="notification-card" key={note.id}>
                    <div className="notification-dot" />
                    <div>
                      <strong>{note.type.replace('_', ' ')}</strong>
                      <p>{note.message}</p>
                      <small>{new Date(note.created_at).toLocaleString()}</small>
                    </div>
                  </article>
                )) : <p className="muted">System notifications will appear here.</p>}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
