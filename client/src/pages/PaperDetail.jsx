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

  if (!paper) return (
    <div className="page-shell" style={{ paddingTop: '4rem', textAlign: 'center', fontStyle: 'italic', color: 'var(--muted)' }}>
      Loading paper…
    </div>
  );

  const authors = asArray(paper.authors);
  const keywords = asArray(paper.keywords);
  const fileUrl = paper.fileUrl ? `${uploadsBase}${paper.fileUrl}` : null;
  const codeUrl = paper.codeUrl ? `${uploadsBase}${paper.codeUrl}` : null;

  return (
    <article className="paper-detail fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: '4px', boxShadow: 'var(--shadow)', margin: 0 }}>

      {/* ── Paper header ── */}
      <div style={{
        borderBottom: '2px solid var(--primary)',
        padding: 'clamp(1.75rem, 4vw, 3rem)',
        background: 'var(--primary)',
        color: '#fff',
        borderRadius: '4px 4px 0 0',
      }}>
        <Link
          className="button"
          to="/papers"
          style={{
            marginBottom: '1.75rem',
            display: 'inline-flex',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.28)',
            color: '#fff',
            fontSize: '0.82rem',
          }}
        >
          ← Back to repository
        </Link>

        <p style={{
          margin: '0 0 0.6rem',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--gold)',
          fontFamily: "'Source Sans 3', sans-serif",
        }}>
          {paper.category_name}{paper.year ? ` · ${paper.year}` : ''}
        </p>

        <h1 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.6rem)',
          margin: '0 0 0.75rem',
          fontFamily: "'Merriweather', Georgia, serif",
          fontWeight: 900,
          lineHeight: 1.18,
          letterSpacing: '-0.02em',
          color: '#fff',
        }}>
          {paper.title}
        </h1>

        {authors.length > 0 && (
          <p style={{
            margin: '0',
            fontSize: '1rem',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.80)',
            fontFamily: "'Merriweather', serif",
          }}>
            {authors.join('; ')}
          </p>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.6fr) minmax(240px,0.6fr)',
        gap: '0',
      }}
        className="admin-main-grid"
      >
        {/* Main column */}
        <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', borderRight: '1px solid var(--border)', display: 'grid', gap: '2rem' }}>

          {/* Abstract */}
          <section>
            <h2 style={{
              fontFamily: "'Merriweather', serif",
              fontSize: '1.1rem',
              color: 'var(--primary)',
              margin: '0 0 0.85rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-strong)',
              letterSpacing: '-0.01em',
            }}>
              Abstract
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.75', color: 'var(--ink)', margin: 0, fontFamily: "'Merriweather', Georgia, serif", fontWeight: 300 }}>
              {paper.abstract}
            </p>
            {keywords.length > 0 && (
              <div className="tag-row" style={{ marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginRight: '0.25rem' }}>
                  Keywords:
                </span>
                {keywords.map((kw) => (
                  <span key={kw} className="chip" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-border)' }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* PDF viewer or locked */}
          {fileUrl ? (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-strong)' }}>
                <h2 style={{ fontFamily: "'Merriweather', serif", fontSize: '1.1rem', color: 'var(--primary)', margin: 0 }}>
                  Full Text
                </h2>
                <a className="button" href={fileUrl} download target="_blank" rel="noreferrer"
                  style={{ fontSize: '0.82rem' }}>
                  Download PDF
                </a>
              </div>
              <section style={{ height: '800px', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-strong)' }}>
                <iframe title={paper.title} src={fileUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
              </section>
            </section>
          ) : (
            <section className="locked" style={{ textAlign: 'center', padding: '3.5rem 2rem', background: 'var(--surface-2)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.85rem' }}>🔒</div>
              <h2 style={{ fontFamily: "'Merriweather', serif", color: 'var(--primary)', marginBottom: '0.65rem' }}>Access Restricted</h2>
              {!user ? (
                <p style={{ color: 'var(--muted)' }}>
                  Please <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>sign in</Link> to request access to this paper.
                </p>
              ) : paper.visibility === 'private' ? (
                paper.requestStatus === 'pending' ? (
                  <p className="chip pending" style={{ display: 'inline-block', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    Your access request is pending approval
                  </p>
                ) : paper.requestStatus === 'denied' ? (
                  <p className="chip rejected" style={{ display: 'inline-block', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    Access request was denied
                  </p>
                ) : (
                  <button onClick={requestAccess}>Request Access</button>
                )
              ) : (
                <p style={{ color: 'var(--muted)' }}>This paper is restricted to authorised users.</p>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ padding: 'clamp(1.25rem, 2.5vw, 2rem)', display: 'grid', gap: '1.5rem', alignContent: 'start', background: 'var(--surface-2)' }}>

          <section>
            <h2 style={{ fontFamily: "'Merriweather', serif", fontSize: '1rem', color: 'var(--primary)', margin: '0 0 0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-strong)' }}>
              Publication Details
            </h2>
            <dl style={{ display: 'grid', gap: '0.65rem', margin: 0 }}>
              {[
                { label: 'DOI', value: paper.doi || '—' },
                { label: 'Journal / Conference', value: paper.journal || '—' },
                { label: 'Year', value: paper.year || '—' },
                { label: 'Volume / Issue', value: (paper.volume || paper.issue) ? `${paper.volume || ''}${paper.issue ? ` (${paper.issue})` : ''}` : '—' },
                { label: 'License', value: paper.license?.replace(/_/g, ' ') || '—' },
                { label: 'Visibility', value: paper.visibility },
                { label: 'Submitted by', value: paper.uploader_name },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'grid', gap: '0.1rem' }}>
                  <dt style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', fontFamily: "'Source Sans 3', sans-serif" }}>
                    {label}
                  </dt>
                  <dd style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 500 }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {codeUrl && (
            <section style={{ padding: '1.1rem', border: '1px solid var(--primary-border)', borderRadius: '4px', borderLeft: '4px solid var(--primary)', background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: "'Merriweather', serif", fontSize: '1rem', color: 'var(--primary)', margin: '0 0 0.5rem' }}>
                Source Code
              </h2>
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                This paper includes an implementation package.
              </p>
              <a className="button" href={codeUrl} download
                style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                Download Code (.zip)
              </a>
            </section>
          )}
        </aside>
      </div>

      {message && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          padding: '0.85rem 1.5rem', borderRadius: '4px',
          background: 'var(--success)', color: 'white',
          animation: 'fadeUp 0.3s ease', boxShadow: 'var(--shadow-md)',
          fontWeight: 600, fontSize: '0.9rem',
          borderLeft: '4px solid var(--success)',
        }}>
          {message}
        </div>
      )}
    </article>
  );
}
