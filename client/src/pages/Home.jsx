import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi, paperApi, userApi } from '../api/endpoints.js';
import SearchBar from '../components/SearchBar.jsx';
import CategoryZone from '../components/CategoryZone.jsx';
import PaperCard from '../components/PaperCard.jsx';
import BadgeIcon from '../components/BadgeIcon.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const proofCards = [
  { value: 'Guided', label: 'paper submission flow' },
  { value: 'Private', label: 'access request controls' },
  { value: 'Tracked', label: 'review and status updates' },
  { value: 'Shareable', label: 'time-limited private links' }
];

function UserDashboardHome() {
  const [profile, setProfile] = useState(null);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [papers, setPapers] = useState([]);
  const [filters, setFilters] = useState({ q: '', category: '', year: '', visibility: '' });
  const [loadingPapers, setLoadingPapers] = useState(true);

  useEffect(() => {
    userApi.profile().then(({ data }) => setProfile(data));
    paperApi.trending().then(({ data }) => setTrending(data));
    categoryApi.list().then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingPapers(true);
      paperApi.list(filters)
        .then(({ data }) => setPapers(data))
        .finally(() => setLoadingPapers(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  if (!profile) {
    return (
      <section className="workspace-shell">
        <div className="workspace-panel workspace-loading">Loading your workspace...</div>
      </section>
    );
  }

  const recentPapers = profile.papers.slice(0, 4);
  const unreadNotifications = profile.notifications.filter((item) => !item.is_read);

  return (
    <div className="workspace-shell">
      <section className="workspace-hero">
        <div>
          <p className="eyebrow">Research workspace</p>
          <h1>Welcome back, {profile.user.name.split(' ')[0]}.</h1>
          <p>Search the repository, manage uploads, review decisions, and handle access requests from one clean workspace.</p>
        </div>
        <div className="workspace-hero-actions">
          <Link className="button" to="/upload">Upload new paper</Link>
          <Link className="button hero-secondary" to="/profile">Open full profile</Link>
        </div>
      </section>

      <section className="workspace-command-bar">
        <div className="workspace-command-search">
          <SearchBar value={filters.q} onChange={(q) => setFilters({ ...filters, q })} />
        </div>
        <label className="compact-field">
          <span>Year</span>
          <input value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} placeholder="2026" />
        </label>
        <label className="compact-field">
          <span>Visibility</span>
          <select value={filters.visibility} onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}>
            <option value="">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="restricted">Restricted</option>
          </select>
        </label>
        <button className="ghost-button" onClick={() => setFilters({ q: '', category: '', year: '', visibility: '' })}>Reset</button>
      </section>

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
          <span>Pending review</span>
          <strong>{profile.stats.pending || 0}</strong>
        </article>
        <article className="workspace-metric-card accent-slate">
          <span>Unread updates</span>
          <strong>{unreadNotifications.length}</strong>
        </article>
      </section>

      <section className="workspace-grid">
        <aside className="workspace-sidebar">
          <div className="workspace-panel profile-summary-card">
            <div className="workspace-avatar">{profile.user.name.slice(0, 1)}</div>
            <div>
              <h2>{profile.user.name}</h2>
              <p className="muted">{profile.user.email}</p>
            </div>
            <BadgeIcon level={profile.user.badge_level} />
            <div className="profile-summary-meta">
              <span>Badge level</span>
              <strong>{profile.user.badge_level}</strong>
            </div>
          </div>

          <div className="workspace-panel">
            <h3>Quick actions</h3>
            <div className="stack-list">
              <Link className="workspace-link-card" to="/upload">
                <strong>Submit a new paper</strong>
                <span>Start the upload wizard with metadata extraction.</span>
              </Link>
              <Link className="workspace-link-card" to="/profile">
                <strong>Review notifications</strong>
                <span>See rejections, approvals, and access requests.</span>
              </Link>
            </div>
          </div>

          <div className="workspace-panel">
            <h3>Trending this week</h3>
            <div className="stack-list compact">
              {trending.length ? trending.slice(0, 3).map((paper, index) => (
                <div key={paper.id} className="workspace-mini-card">
                  <b>{index + 1}</b>
                  <div>
                    <strong>{paper.title}</strong>
                    <span>{paper.weekly_views} weekly views</span>
                  </div>
                </div>
              )) : <p className="muted">Trending papers appear once readers start viewing them.</p>}
            </div>
          </div>
        </aside>

        <main className="workspace-main">
          <div className="workspace-panel">
            <div className="section-heading tight">
              <div>
                <p className="eyebrow dark">Recent submissions</p>
                <h2>Your latest papers</h2>
              </div>
              <Link className="ghost-button" to="/profile">View all</Link>
            </div>
            <div className="workspace-table-list">
              {recentPapers.length ? recentPapers.map((paper) => (
                <article className="paper-row-card" key={paper.id}>
                  <div>
                    <strong>{paper.title}</strong>
                    <p>{paper.category_name} | {new Date(paper.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <div className="paper-row-actions">
                    <span className={`chip ${paper.status}`}>{paper.status}</span>
                    <span className={`chip ${paper.visibility}`}>{paper.visibility}</span>
                  </div>
                </article>
              )) : <div className="empty-state compact"><p>No submissions yet. Start with your first paper.</p></div>}
            </div>
          </div>

          <div className="workspace-panel repository-browser">
            <div className="section-heading tight">
              <div>
                <p className="eyebrow dark">Repository browser</p>
                <h2>All research papers</h2>
              </div>
              <span className="result-pill">{papers.length} papers</span>
            </div>

            <div className="workspace-category-pills">
              <button
                className={`category-pill ${!filters.category ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, category: '' })}
              >
                All categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-pill ${String(filters.category) === String(category.id) ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, category: category.id })}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="workspace-paper-grid">
              {loadingPapers && <div className="skeleton-card" />}
              {!loadingPapers && papers.map((paper) => <PaperCard key={paper.id} paper={paper} />)}
              {!loadingPapers && !papers.length && (
                <div className="empty-state compact">
                  <h3>No matching papers</h3>
                  <p>Try a different keyword, year, or category.</p>
                </div>
              )}
            </div>
          </div>

          <div className="workspace-two-column">
            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Incoming requests</p>
                  <h2>Access requests</h2>
                </div>
              </div>
              <div className="stack-list compact">
                {profile.accessRequests.length ? profile.accessRequests.slice(0, 4).map((request) => (
                  <div className="workspace-mini-card vertical" key={request.id}>
                    <strong>{request.requester_name}</strong>
                    <span>wants access to {request.title}</span>
                  </div>
                )) : <p className="muted">No pending access requests.</p>}
              </div>
            </div>

            <div className="workspace-panel">
              <div className="section-heading tight">
                <div>
                  <p className="eyebrow dark">Reading activity</p>
                  <h2>Recently viewed</h2>
                </div>
              </div>
              <div className="stack-list compact">
                {profile.recentlyViewed.length ? profile.recentlyViewed.slice(0, 4).map((paper) => (
                  <div className="workspace-mini-card vertical" key={`${paper.id}-${paper.viewed_at}`}>
                    <strong>{paper.title}</strong>
                    <span>{new Date(paper.viewed_at).toLocaleString()}</span>
                  </div>
                )) : <p className="muted">Your recently viewed papers will appear here.</p>}
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

function GuestHome() {
  const [categories, setCategories] = useState([]);
  const [papers, setPapers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [filters, setFilters] = useState({ q: '', category: '', year: '', license: '', visibility: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data));
    paperApi.trending().then(({ data }) => setTrending(data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      paperApi.list(filters)
        .then(({ data }) => setPapers(data))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Discover, submit, review</p>
          <h1>Share research clearly, review submissions faster, and keep every paper organized.</h1>
          <p>An academic repository for uploading papers, browsing by subject, requesting access to private work, and tracking every submission from review to decision.</p>
          <div className="hero-actions">
            <Link className="button hero-primary" to="/register">Create researcher account</Link>
            <Link className="button hero-secondary" to="/login">Sign in</Link>
          </div>
          <SearchBar value={filters.q} onChange={(q) => setFilters({ ...filters, q })} />
        </div>
        <div className="hero-dashboard" aria-label="Repository overview">
          <div className="glass-card large">
            <span className="metric-label">Repository activity</span>
            <strong>{papers.length || 'Live'}</strong>
            <small>Browse the latest approved papers and explore by category.</small>
          </div>
          <div className="glass-card">
            <span className="metric-label">Access options</span>
            <strong>Open, private, or limited</strong>
          </div>
          <div className="glass-card">
            <span className="metric-label">Researcher profile</span>
            <strong>Uploads, decisions, history</strong>
          </div>
        </div>
      </section>

      <section className="proof-grid">
        {proofCards.map((card) => (
          <div className="proof-card" key={card.label}>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </div>
        ))}
      </section>

      <div className="section-heading">
        <div>
          <p className="eyebrow dark">Research zones</p>
          <h2>Browse by academic category</h2>
        </div>
        <button className="ghost-button" onClick={() => setFilters({ ...filters, category: '' })}>Clear category</button>
      </div>
      <section className="category-grid">
        {categories.map((category) => (
          <CategoryZone
            key={category.id}
            category={category}
            active={String(filters.category) === String(category.id)}
            onClick={(categoryId) => setFilters({ ...filters, category: filters.category === categoryId ? '' : categoryId })}
          />
        ))}
      </section>

      <div className="section-heading">
        <div>
          <p className="eyebrow dark">Repository feed</p>
          <h2>Newest approved papers</h2>
        </div>
        <span className="result-pill">{papers.length} results</span>
      </div>
      <div className="content-grid">
        <aside className="filters">
          <div>
            <p className="eyebrow dark">Refine</p>
            <h3>Smart filters</h3>
          </div>
          <label>Year<input value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} /></label>
          <label>License<select value={filters.license} onChange={(e) => setFilters({ ...filters, license: e.target.value })}>
            <option value="">All</option>
            <option value="open_access">Open Access</option>
            <option value="copyright_reserved">Copyright Reserved</option>
            <option value="creative_commons">Creative Commons</option>
          </select></label>
          <label>Visibility<select value={filters.visibility} onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}>
            <option value="">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="restricted">Restricted</option>
          </select></label>
          <button className="ghost-button full" onClick={() => setFilters({ q: '', category: '', year: '', license: '', visibility: '' })}>Reset filters</button>
          <div className="trend-panel">
            <h3>Trending this week</h3>
            {trending.length ? trending.map((paper, index) => (
              <p key={paper.id} className="trend"><b>{index + 1}</b> {paper.title}<br /><small>{paper.weekly_views} views</small></p>
            )) : <p className="muted">Trending papers appear after views are recorded.</p>}
          </div>
        </aside>
        <section className="paper-list">
          {loading && <div className="skeleton-card" />}
          {papers.map((paper) => <PaperCard key={paper.id} paper={paper} />)}
          {!loading && !papers.length && (
            <div className="empty-state">
              <h3>No papers found yet</h3>
              <p>Try clearing filters, or create an account and upload the first paper to start the repository.</p>
              <Link className="button" to="/register">Register account</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  if (user?.role === 'user') return <UserDashboardHome />;
  return <GuestHome />;
}
