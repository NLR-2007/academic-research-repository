import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import { adminApi, categoryApi } from '../../api/endpoints.js';
import { uploadsBase } from '../../api/client';

export default function PaperManager() {
  const [papers, setPapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', q: '', visibility: '' });

  async function load() {
    const { data } = await adminApi.papers(filters);
    setPapers(data);
  }

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    load();
  }, [filters]);

  async function approve(id) {
    await adminApi.approve(id);
    load();
  }

  async function reject(id) {
    const reason = window.prompt('Enter rejection reason');
    if (reason) {
      await adminApi.reject(id, reason);
      load();
    }
  }

  async function remove(id) {
    const reason = window.prompt('Enter deletion reason');
    if (reason) {
      await adminApi.deletePaper(id, reason);
      load();
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <div className="admin-hero-panel">
          <div>
            <p className="eyebrow dark">Content Oversight</p>
            <h1>Paper Manager</h1>
            <p className="muted">Review, approve, or remove research submissions from the repository.</p>
          </div>
        </div>

        <div className="workspace-panel">
          <div className="table-filters">
            <input placeholder="Search title or author" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <select value={filters.visibility} onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}>
              <option value="">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
        </div>

        <div className="stack-list">
          {papers.length ? papers.map((paper) => (
            <article className="admin-paper-card premium" key={paper.id}>
              <div className="admin-card-info">
                <div className="admin-card-header">
                  <strong>{paper.title}</strong>
                  <span className={`chip ${paper.status}`}>{paper.status}</span>
                </div>
                <p>{paper.uploader_name} • {paper.category_name}</p>
                <div className="admin-card-meta">
                  <small>{new Date(paper.uploaded_at).toLocaleDateString()}</small>
                  <span className="badge-mini">{paper.visibility}</span>
                </div>
              </div>
              <div className="action-row">
                <a 
                  href={`${uploadsBase}/uploads/${paper.file_path}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="button secondary-button"
                >
                  Read Paper
                </a>
                {paper.status === 'pending' && (
                  <>
                    <button className="approve-button" onClick={() => approve(paper.id)}>Approve</button>
                    <button className="reject-button" onClick={() => reject(paper.id)}>Reject</button>
                  </>
                )}
                <button className="danger-button" onClick={() => remove(paper.id)}>Delete</button>
              </div>
            </article>
          )) : (
            <div className="workspace-panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="muted">No papers found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
