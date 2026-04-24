import { useEffect, useState } from 'react';
import BadgeIcon from '../components/BadgeIcon.jsx';
import { paperApi, userApi } from '../api/endpoints.js';

function scholarLinksToText(links) {
  return Array.isArray(links) ? links.join('\n') : '';
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [share, setShare] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    institution: '',
    role: '',
    bio: '',
    scholarLinks: '',
    profileImage: ''
  });

  async function load() {
    const { data } = await userApi.profile();
    setProfile(data);
    setForm({
      name: data.user.name || '',
      institution: data.user.institution || '',
      role: data.user.research_role || '',
      bio: data.user.bio || '',
      scholarLinks: scholarLinksToText(data.user.scholar_links),
      profileImage: data.user.profile_image || ''
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(requestId, status) {
    await paperApi.respondAccess(requestId, status);
    load();
  }

  async function createShare(paperId) {
    const { data } = await paperApi.shareLink(paperId);
    setShare(data.url);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await userApi.updateProfile({
        ...form,
        scholarLinks: form.scholarLinks
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
      });
      setEditing(false);
      setMessage('Profile updated successfully.');
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <section className="workspace-shell"><div className="workspace-panel workspace-loading">Loading profile...</div></section>;

  const unread = profile.notifications.filter((item) => !item.is_read).length;
  const initials = profile.user.name?.slice(0, 1) || 'R';

  return (
    <div className="profile-dashboard">
      <section className="profile-banner">
        <div className="profile-banner-main">
          {profile.user.profile_image ? (
            <img className="profile-photo" src={profile.user.profile_image} alt={profile.user.name} />
          ) : (
            <div className="workspace-avatar large">{initials}</div>
          )}
          <div>
            <p className="eyebrow">Researcher profile</p>
            <h1>{profile.user.name}</h1>
            <p>{profile.user.email}</p>
            <div className="profile-identity-row">
              {profile.user.institution ? <span className="chip">{profile.user.institution}</span> : null}
              {profile.user.research_role ? <span className="chip">{profile.user.research_role}</span> : null}
            </div>
          </div>
        </div>
        <div className="profile-banner-side">
          <BadgeIcon level={profile.user.badge_level} />
          <button className="ghost-button" onClick={() => setEditing((current) => !current)}>
            {editing ? 'Close editor' : 'Edit profile'}
          </button>
          <button onClick={() => userApi.markNotificationsRead().then(load)}>Mark notifications read</button>
        </div>
      </section>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="section-heading tight" style={{ marginBottom: '2rem' }}>
              <div>
                <p className="eyebrow dark">Profile editor</p>
                <h2>Update your academic identity</h2>
              </div>
              <button className="ghost-button" onClick={() => setEditing(false)}>Close</button>
            </div>
            <form className="form-grid auth-form-grid" onSubmit={saveProfile}>
              <div className="auth-two-column">
                <label>
                  Name
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label>
                  Institution
                  <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
                </label>
                <label className="auth-field-wide">
                  Role
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </label>
                <label className="auth-field-wide">
                  Bio
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </label>
                <label className="auth-field-wide">
                  Scholar links
                  <textarea value={form.scholarLinks} onChange={(e) => setForm({ ...form, scholarLinks: e.target.value })} placeholder="One link per line" />
                </label>
                <label className="auth-field-wide">
                  Profile image URL
                  <input value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} />
                </label>
              </div>
              <div className="action-row" style={{ marginTop: '2rem' }}>
                <button disabled={saving} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>{saving ? 'Saving...' : 'Save changes'}</button>
                <button type="button" className="ghost-button" onClick={() => setEditing(false)} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message ? <div className="workspace-panel"><p className="success">{message}</p></div> : null}

      <section className="workspace-metrics">
        <article className="workspace-metric-card accent-forest">
          <span>Total uploaded</span>
          <strong>{profile.stats.total_uploaded || 0}</strong>
        </article>
        <article className="workspace-metric-card accent-gold">
          <span>Approved</span>
          <strong>{profile.stats.approved || 0}</strong>
        </article>
        <article className="workspace-metric-card accent-clay">
          <span>Rejected</span>
          <strong>{profile.stats.rejected || 0}</strong>
        </article>
        <article className="workspace-metric-card accent-slate">
          <span>Unread notifications</span>
          <strong>{unread}</strong>
        </article>
      </section>

      <section className="profile-layout">
        <main className="profile-main-column">
          <div className="workspace-panel">
            <div className="section-heading tight">
              <div>
                <p className="eyebrow dark">About</p>
                <h2>Research identity</h2>
              </div>
            </div>
            <div className="profile-about-grid">
              <div className="profile-about-card">
                <span>Institution</span>
                <strong>{profile.user.institution || 'Not added yet'}</strong>
              </div>
              <div className="profile-about-card">
                <span>Role</span>
                <strong>{profile.user.research_role || 'Not added yet'}</strong>
              </div>
              <div className="profile-about-card profile-about-wide">
                <span>Bio</span>
                <p>{profile.user.bio || 'Add a short bio to make your profile stronger and more complete.'}</p>
              </div>
              <div className="profile-about-card profile-about-wide">
                <span>Scholar links</span>
                {profile.user.scholar_links?.length ? (
                  <div className="stack-list compact">
                    {profile.user.scholar_links.map((link) => (
                      <a key={link} href={link} target="_blank" rel="noreferrer">{link}</a>
                    ))}
                  </div>
                ) : (
                  <p>No scholar links added yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="workspace-panel">
            <div className="section-heading tight">
              <div>
                <p className="eyebrow dark">Submissions</p>
                <h2>My papers</h2>
              </div>
            </div>
            {share && <div className="share-banner"><strong>Private share link:</strong> <span>{share}</span></div>}
            <div className="profile-paper-stack">
              {profile.papers.length ? profile.papers.map((paper) => (
                <article className="profile-paper-card" key={paper.id}>
                  <div className="profile-paper-copy">
                    <strong>{paper.title}</strong>
                    <p>{paper.category_name} | {new Date(paper.uploaded_at).toLocaleString()}</p>
                  </div>
                  <div className="profile-paper-meta">
                    <span className={`chip ${paper.status}`}>{paper.status}</span>
                    <span className={`chip ${paper.visibility}`}>{paper.visibility}</span>
                    {paper.visibility === 'private' && <button onClick={() => createShare(paper.id)}>Create private link</button>}
                  </div>
                </article>
              )) : <div className="empty-state compact"><p>You have not uploaded any papers yet.</p></div>}
            </div>
          </div>

          <div className="workspace-panel">
            <div className="section-heading tight">
              <div>
                <p className="eyebrow dark">Activity</p>
                <h2>Notifications</h2>
              </div>
              <span className="result-pill">{unread} unread</span>
            </div>
            <div className="notification-stack">
              {profile.notifications.length ? profile.notifications.map((note) => (
                <article key={note.id} className={`notification-card ${note.is_read ? 'read' : 'unread'}`}>
                  <div className="notification-dot" />
                  <div>
                    <strong>{note.type.replace('_', ' ')}</strong>
                    <p>{note.message}</p>
                    <small>{new Date(note.created_at).toLocaleString()}</small>
                  </div>
                </article>
              )) : <p className="muted">No notifications yet.</p>}
            </div>
          </div>
        </main>

        <aside className="profile-side-column">
          <div className="workspace-panel">
            <h3>Pending access requests</h3>
            <div className="stack-list compact">
              {profile.accessRequests.length ? profile.accessRequests.map((request) => (
                <div className="request-card" key={request.id}>
                  <strong>{request.requester_name}</strong>
                  <span>{request.title}</span>
                  <div className="request-actions">
                    <button onClick={() => respond(request.id, 'granted')}>Accept</button>
                    <button className="danger" onClick={() => respond(request.id, 'denied')}>Deny</button>
                  </div>
                </div>
              )) : <p className="muted">No one is waiting for access right now.</p>}
            </div>
          </div>

          <div className="workspace-panel">
            <h3>Recently viewed</h3>
            <div className="stack-list compact">
              {profile.recentlyViewed.length ? profile.recentlyViewed.map((paper) => (
                <div className="workspace-mini-card vertical" key={`${paper.id}-${paper.viewed_at}`}>
                  <strong>{paper.title}</strong>
                  <span>{new Date(paper.viewed_at).toLocaleString()}</span>
                </div>
              )) : <p className="muted">Your reading history will appear here.</p>}
            </div>
          </div>

          <div className="workspace-panel">
            <h3>Badge progress</h3>
            <div className="badge-progress-card">
              <BadgeIcon level={profile.user.badge_level} />
              <p>Your badge updates automatically as more papers get approved.</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
