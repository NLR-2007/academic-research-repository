const colors = {
  Newcomer: '#64748b',
  Bronze: '#b45309',
  Silver: '#64748b',
  Gold: '#ca8a04',
  Diamond: '#0891b2'
};

export default function BadgeIcon({ level = 'Newcomer' }) {
  return <span className="badge-icon" style={{ background: colors[level] || colors.Newcomer }}>{level}</span>;
}
