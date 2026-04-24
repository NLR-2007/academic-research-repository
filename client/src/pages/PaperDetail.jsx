import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { paperApi } from '../api/endpoints.js';
import { uploadsBase } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function asArray(value) {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value || '[]');
  } catch (_error) {
    return [];
  }
}

export default function PaperDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [paper, setPaper] = useState(null);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    paperApi.detail(id, { share: searchParams.get('share') }).then(({ data }) => setPaper(data));
  }, [id, searchParams]);

  async function requestAccess() {
    await paperApi.requestAccess(id);
    setMessage('Access request sent to the uploader.');
    setPaper(p => ({ ...p, requestStatus: 'pending' }));
  }

  if (!paper) return <p>Loading...</p>;

  const authors = asArray(paper.authors);
  const keywords = asArray(paper.keywords);
  const fileUrl = paper.fileUrl ? `${uploadsBase}${paper.fileUrl}` : null;

  return (
    <article className="paper-detail">
      <Link to="/">Back to feed</Link>
      <h1>{paper.title}</h1>
      <p className="muted">{authors.join(', ')}</p>
      <div className="meta-grid">
        <span>DOI: {paper.doi || 'N/A'}</span>
        <span>Journal: {paper.journal || 'N/A'}</span>
        <span>Year: {paper.year}</span>
        <span>Volume: {paper.volume || 'N/A'}</span>
        <span>License: {paper.license}</span>
        <span>Uploaded: {new Date(paper.uploaded_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
      </div>
      <p>{paper.abstract}</p>
      <div className="tag-row">{keywords.map((keyword) => <span className="tag" key={keyword}>{keyword}</span>)}</div>

      {fileUrl ? (
        <section className="pdf-panel">
          <iframe title={paper.title} src={fileUrl} />
          <a className="button" href={fileUrl} download target="_blank" rel="noreferrer">Download PDF</a>
        </section>
      ) : (
        <section className="locked">
          <h2>PDF locked</h2>
          {!user ? (
            <p>Login to request access to view this private paper.</p>
          ) : paper.visibility === 'private' ? (
            paper.requestStatus === 'pending' ? (
              <p className="warning" style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.8rem', color: '#92400e' }}>Your access request is currently <b>pending</b> approval by the owner.</p>
            ) : paper.requestStatus === 'denied' ? (
              <p className="danger" style={{ background: '#fee2e2', padding: '1rem', borderRadius: '0.8rem', color: '#991b1b' }}>Your access request was <b>denied</b> by the owner.</p>
            ) : (
              <button onClick={requestAccess}>Request Access</button>
            )
          ) : (
             <p>This paper is restricted.</p>
          )}
          {message && <p className="success" style={{ marginTop: '1rem', color: '#16a34a', fontWeight: 'bold' }}>{message}</p>}
        </section>
      )}
    </article>
  );
}
