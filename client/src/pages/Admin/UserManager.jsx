import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import BadgeIcon from '../../components/BadgeIcon.jsx';
import { adminApi } from '../../api/endpoints.js';

export default function UserManager() {
  const [users, setUsers] = useState([]);

  async function load() {
    const { data } = await adminApi.users();
    setUsers(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (window.confirm('Delete this user and soft-delete all their papers?')) {
      await adminApi.deleteUser(id);
      load();
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <div className="admin-hero-panel">
          <div>
            <p className="eyebrow dark">Network Administration</p>
            <h1>User Manager</h1>
            <p className="muted">Monitor researcher activity, manage account access, and oversee the contributor community.</p>
          </div>
        </div>

        <div className="stack-list">
          {users.length ? users.map((user) => (
            <article className="user-admin-card premium" key={user.id}>
              <div className="user-card-header">
                <div className="user-identity">
                  <div className="user-avatar-circle">{user.name.charAt(0)}</div>
                  <div>
                    <strong>{user.name}</strong>
                    <p className="muted">{user.email}</p>
                  </div>
                </div>
                <div className="user-badge-cell">
                  <BadgeIcon level={user.badge_level} />
                </div>
              </div>

              <div className="user-metrics-grid">
                <div className="metric-item">
                  <span className="label">Papers</span>
                  <span className="value">{user.uploaded || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Approved</span>
                  <span className="value">{user.approved_count || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Rejected</span>
                  <span className="value">{user.rejected_count || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="label">Joined</span>
                  <span className="value">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="action-row full-width">
                <button className="danger-button" onClick={() => remove(user.id)}>Revoke Access</button>
              </div>
            </article>
          )) : (
            <div className="workspace-panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="muted">No registered users found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
