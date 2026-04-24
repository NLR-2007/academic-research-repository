function CategoryIllustration({ name, color }) {
  const stroke = color || '#ffffff';
  const common = { fill: 'none', stroke, strokeWidth: '2.6', strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (name) {
    case 'Artificial Intelligence':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect x="16" y="18" width="32" height="28" rx="9" {...common} />
          <path d="M24 30h16M24 37h10M32 13v5M22 12l2 4M42 12l-2 4M13 30h5M46 30h5M22 50l2-4M42 46l-2-4" {...common} />
          <circle cx="25" cy="30" r="2.5" fill={stroke} />
          <circle cx="39" cy="30" r="2.5" fill={stroke} />
        </svg>
      );
    case 'Biotechnology':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M24 14c8 6 8 12 0 18s-8 12 0 18M40 14c-8 6-8 12 0 18s8 12 0 18" {...common} />
          <path d="M23 20h18M19 28h26M21 36h22M23 44h18" {...common} />
        </svg>
      );
    case 'Chemistry':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M24 14v11l-9 16a8 8 0 0 0 7 12h20a8 8 0 0 0 7-12L40 25V14" {...common} />
          <path d="M22 20h20M23 38c3-4 7-3 10 0s7 4 11 0" {...common} />
        </svg>
      );
    case 'Economics':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M14 46l10-12 8 6 18-20" {...common} />
          <path d="M42 20h8v8M16 52h34" {...common} />
          <path d="M24 17v30M20 21c0-2.5 2.7-4 5.5-4s5.5 1.5 5.5 4-2.7 4-5.5 4-5.5 1.5-5.5 4 2.7 4 5.5 4 5.5-1.5 5.5-4" {...common} />
        </svg>
      );
    case 'Machine Learning':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="20" cy="22" r="5" {...common} />
          <circle cx="44" cy="20" r="5" {...common} />
          <circle cx="32" cy="42" r="6" {...common} />
          <path d="M25 24l14-2M22 27l7 10M42 25l-6 11" {...common} />
        </svg>
      );
    case 'Physics':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="4" fill={stroke} />
          <ellipse cx="32" cy="32" rx="20" ry="8" {...common} />
          <ellipse cx="32" cy="32" rx="20" ry="8" transform="rotate(60 32 32)" {...common} />
          <ellipse cx="32" cy="32" rx="20" ry="8" transform="rotate(-60 32 32)" {...common} />
        </svg>
      );
    case 'Web Development':
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect x="12" y="16" width="40" height="30" rx="8" {...common} />
          <path d="M12 24h40M24 34l-5-4 5-4M40 26l5 4-5 4M34 24l-4 12M22 52h20" {...common} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="14" {...common} />
          <path d="M32 18v28M18 32h28" {...common} />
        </svg>
      );
  }
}

export default function CategoryZone({ category, active, onClick }) {
  return (
    <button className={`category-card ${active ? 'active' : ''}`} onClick={() => onClick(category.id)}>
      <div className="category-icon-wrap">
        <span className="category-dot" style={{ background: category.icon_color }} />
        <div className="category-illustration">
          <CategoryIllustration name={category.name} color="#ffffff" />
        </div>
      </div>
      <strong>{category.name}</strong>
      <small>{category.description}</small>
      <b>{category.paper_count || 0} papers</b>
    </button>
  );
}
