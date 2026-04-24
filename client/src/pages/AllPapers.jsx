import { useEffect, useState } from 'react';
import { categoryApi, paperApi } from '../api/endpoints.js';
import SearchBar from '../components/SearchBar.jsx';
import CategoryZone from '../components/CategoryZone.jsx';
import PaperCard from '../components/PaperCard.jsx';

export default function AllPapers() {
  const [categories, setCategories] = useState([]);
  const [papers, setPapers] = useState([]);
  const [filters, setFilters] = useState({ q: '', category: '', year: '', license: '', visibility: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data));
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
    <div className="papers-page">
      <section className="papers-hero">
        <div>
          <p className="eyebrow">Research library</p>
          <h1>All research papers</h1>
          <p>Browse the full repository, filter by category, and search for the exact paper you need.</p>
        </div>
        <SearchBar value={filters.q} onChange={(q) => setFilters({ ...filters, q })} />
      </section>

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

      <section className="content-grid papers-layout">
        <aside className="filters">
          <div>
            <p className="eyebrow dark">Filter papers</p>
            <h3>Explore repository</h3>
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
        </aside>

        <section className="paper-list">
          <div className="section-heading tight">
            <div>
              <p className="eyebrow dark">Results</p>
              <h2>Repository papers</h2>
            </div>
            <span className="result-pill">{papers.length} papers</span>
          </div>
          {loading && <div className="skeleton-card" />}
          {!loading && papers.map((paper) => <PaperCard key={paper.id} paper={paper} />)}
          {!loading && !papers.length && (
            <div className="empty-state">
              <h3>No papers found</h3>
              <p>Try another search term or remove some filters.</p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
