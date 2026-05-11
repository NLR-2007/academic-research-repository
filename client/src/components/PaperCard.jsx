import { Link } from 'react-router-dom';
import { uploadsBase } from '../api/client.js';

function asArray(value) {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value || '[]');
  } catch {
    return [];
  }
}

export default function PaperCard({ paper }) {
  const authors = asArray(paper.authors);
  const date = new Date(paper.uploaded_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short',
  });

  return (
    <article className="paper-card">
      <div className="paper-card-top">
        <span className={`chip ${paper.visibility}`}>{paper.visibility}</span>
        {paper.category_name && (
          <span className="chip" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-border)' }}>
            {paper.category_name}
          </span>
        )}
        {paper.license && (
          <span className="chip">{paper.license.replace(/_/g, ' ')}</span>
        )}
      </div>

      <h3>
        <Link to={`/papers/${paper.id}`}>{paper.title}</Link>
      </h3>

      {authors.length > 0 && (
        <p style={{ fontSize: '0.85rem', margin: '0 0 0.5rem', color: 'var(--muted)', fontStyle: 'italic' }}>
          {authors.join('; ')}
        </p>
      )}

      <p style={{ fontSize: '0.875rem', lineHeight: 1.60, color: 'var(--ink-2)', margin: 0 }}>
        {paper.abstract?.slice(0, 180)}{paper.abstract?.length > 180 ? '…' : ''}
      </p>

      <footer>
        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--muted-2)' }}>
          {date}
        </span>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {paper.journal && (
            <span style={{ color: 'var(--muted-2)', fontSize: '0.78rem', fontStyle: 'italic' }}>
              {paper.journal}
            </span>
          )}
          {paper.visibility === 'public' && (
            <a
              href={`${uploadsBase}/uploads/${paper.file_path}`}
              target="_blank"
              rel="noreferrer"
              download
              className="pdf-icon-button"
              title="Download PDF"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9"  y1="15" x2="15" y2="15" />
              </svg>
            </a>
          )}
        </div>
      </footer>
    </article>
  );
}
