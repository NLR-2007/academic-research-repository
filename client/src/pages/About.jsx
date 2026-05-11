import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi } from '../api/endpoints.js';

const guidelines = [
  {
    heading: 'Original Work Only',
    body: 'Submissions must be your own research or work you are authorised to share. Plagiarised or duplicate content will be rejected without appeal.',
  },
  {
    heading: 'PDF Format Required',
    body: 'Upload your paper as a PDF file (max 20 MB). Scanned images without selectable text are discouraged. Typeset documents using LaTeX or Word export are preferred.',
  },
  {
    heading: 'Complete Metadata',
    body: 'Provide an accurate title, full author list, abstract (150–400 words), relevant keywords, and — where applicable — a DOI, journal name, and publication year.',
  },
  {
    heading: 'Accurate Visibility Setting',
    body: 'Choose Public for open dissemination, Restricted for logged-in access only, or Private if you want to approve individual access requests before sharing.',
  },
  {
    heading: 'Appropriate Category',
    body: 'Select the academic category that best describes your work. Miscategorised submissions may be returned to you for correction before review begins.',
  },
  {
    heading: 'Moderation Review',
    body: 'Every submission undergoes editorial review. You will receive a notification once your paper is approved or rejected, with reasons provided for rejections.',
  },
];

const accessLevels = [
  {
    label: 'Public',
    color: 'var(--success)',
    desc: 'Anyone — including visitors who are not logged in — can view the abstract and download the PDF directly.',
  },
  {
    label: 'Restricted',
    color: 'var(--primary)',
    desc: 'The abstract is visible publicly but the full PDF requires a registered account. Best for conference proceedings and preprints.',
  },
  {
    label: 'Private',
    color: 'var(--accent)',
    desc: 'Fully gated. Readers must send an access request which the paper\'s author can approve or deny. Alternatively, share a 7-day link.',
  },
];

export default function About() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'grid', gap: '2.5rem', animation: 'fadeUp 0.5s ease-out forwards' }}>

      {/* ── Page header ── */}
      <section style={{
        padding: 'clamp(2rem, 5vw, 3.5rem)',
        background: 'var(--primary)',
        color: '#fff',
        borderRadius: '4px',
        borderBottom: '4px solid var(--gold)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 55px, rgba(255,255,255,0.022) 55px, rgba(255,255,255,0.022) 56px)',
          pointerEvents: 'none',
        }} />
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gold)', fontFamily: "'Source Sans 3', sans-serif" }}>
          Repository information
        </p>
        <h1 style={{ margin: '0 0 0.75rem', fontFamily: "'Merriweather', serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
          About Lumina
        </h1>
        <p style={{ margin: '0 0 1.5rem', maxWidth: '620px', lineHeight: 1.72, color: 'rgba(255,255,255,0.80)', fontSize: '1.02rem' }}>
          Lumina is an institutional academic repository for uploading, discovering, and sharing peer-reviewed research papers across multiple disciplines. It is designed for researchers, faculty members, and postgraduate students.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link className="button" to="/papers" style={{ background: 'var(--gold)', borderColor: 'var(--gold)', color: '#1c1a16', fontWeight: 700 }}>
            Browse the Repository
          </Link>
          <Link className="button" to="/register" style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.38)', color: '#fff' }}>
            Create an Account
          </Link>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(240px,0.7fr)', gap: '2rem', alignItems: 'start' }} className="admin-main-grid">

        <div style={{ display: 'grid', gap: '2rem' }}>

          {/* ── Mission ── */}
          <section className="workspace-panel">
            <h2 style={{ fontFamily: "'Merriweather', serif", color: 'var(--primary)', fontSize: '1.2rem', margin: '0 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-strong)' }}>
              Our Mission
            </h2>
            <p style={{ lineHeight: 1.78, color: 'var(--ink)', margin: '0 0 0.85rem', fontFamily: "'Merriweather', Georgia, serif", fontWeight: 300, fontSize: '0.97rem' }}>
              Lumina was created to give researchers a dedicated, moderated space to share their academic output without the friction of traditional publishing timelines. Every paper submitted is reviewed by an editorial administrator before it appears in the public feed.
            </p>
            <p style={{ lineHeight: 1.78, color: 'var(--ink)', margin: 0, fontFamily: "'Merriweather', Georgia, serif", fontWeight: 300, fontSize: '0.97rem' }}>
              The repository supports open-access publication as well as controlled-access models — you decide who can see your work. Researchers who consistently contribute high-quality papers earn recognition through a tiered badge system.
            </p>
          </section>

          {/* ── Submission guidelines ── */}
          <section className="workspace-panel">
            <h2 style={{ fontFamily: "'Merriweather', serif", color: 'var(--primary)', fontSize: '1.2rem', margin: '0 0 1.1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-strong)' }}>
              Submission Guidelines
            </h2>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0' }}>
              {guidelines.map((g, i) => (
                <li key={g.heading} style={{
                  display: 'grid',
                  gridTemplateColumns: '2rem 1fr',
                  gap: '0.75rem',
                  padding: '1rem 0',
                  borderBottom: i < guidelines.length - 1 ? '1px solid var(--line)' : 'none',
                  alignItems: 'start',
                }}>
                  <span style={{
                    width: '2rem', height: '2rem',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'grid', placeItems: 'center',
                    fontFamily: "'Merriweather', serif",
                    fontWeight: 700, fontSize: '0.8rem',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--primary-dark)', marginBottom: '0.25rem', fontFamily: "'Merriweather', serif", fontSize: '0.95rem' }}>
                      {g.heading}
                    </strong>
                    <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                      {g.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ── Access levels ── */}
          <section className="workspace-panel">
            <h2 style={{ fontFamily: "'Merriweather', serif", color: 'var(--primary)', fontSize: '1.2rem', margin: '0 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-strong)' }}>
              Access Levels Explained
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {accessLevels.map((a) => (
                <div key={a.label} style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr',
                  gap: '1rem',
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${a.color}`,
                  borderRadius: '3px',
                  background: 'var(--surface-2)',
                  alignItems: 'start',
                }}>
                  <span style={{ fontWeight: 700, color: a.color, fontSize: '0.875rem', fontFamily: "'Source Sans 3', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: '0.1rem' }}>
                    {a.label}
                  </span>
                  <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.65 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── Sidebar ── */}
        <aside style={{ display: 'grid', gap: '1.5rem', position: 'sticky', top: '4.5rem' }}>

          {/* Badge system */}
          <div className="workspace-panel">
            <h2 style={{ fontFamily: "'Merriweather', serif", color: 'var(--primary)', fontSize: '1rem', margin: '0 0 0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-strong)' }}>
              Researcher Badges
            </h2>
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {[
                { label: 'Newcomer',  threshold: '0 approved',   color: '#6b6557' },
                { label: 'Bronze',    threshold: '1–4 approved',  color: '#cd7f32' },
                { label: 'Silver',    threshold: '5–9 approved',  color: '#9e9e9e' },
                { label: 'Gold',      threshold: '10–19 approved', color: '#b8860b' },
                { label: 'Diamond',   threshold: '20+ approved',  color: '#1a3a5c' },
              ].map((b) => (
                <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: 'var(--surface-2)', borderRadius: '3px', border: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, color: b.color, fontSize: '0.875rem' }}>{b.label}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{b.threshold}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disciplines / categories */}
          {categories.length > 0 && (
            <div className="workspace-panel">
              <h2 style={{ fontFamily: "'Merriweather', serif", color: 'var(--primary)', fontSize: '1rem', margin: '0 0 0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-strong)' }}>
                Covered Disciplines
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/papers?category=${c.id}`}
                    style={{
                      textDecoration: 'none',
                      padding: '0.3rem 0.7rem',
                      border: '1px solid var(--primary-border)',
                      borderRadius: '2px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      transition: 'background 0.12s',
                    }}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Contact / quick links */}
          <div className="workspace-panel">
            <h2 style={{ fontFamily: "'Merriweather', serif", color: 'var(--primary)', fontSize: '1rem', margin: '0 0 0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-strong)' }}>
              Quick Links
            </h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[
                { label: 'Browse all papers', to: '/papers' },
                { label: 'Create a researcher account', to: '/register' },
                { label: 'Sign in to your account', to: '/login' },
                { label: 'Submit a new paper', to: '/upload' },
              ].map(({ label, to }) => (
                <Link key={to} to={to} style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--primary)',
                  borderRadius: '3px',
                  background: 'var(--surface-2)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'background 0.12s, border-color 0.12s',
                }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
