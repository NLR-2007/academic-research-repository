function badgeForApprovedCount(count) {
  if (count >= 30) return 'Diamond';
  if (count >= 15) return 'Gold';
  if (count >= 5) return 'Silver';
  if (count >= 1) return 'Bronze';
  return 'Newcomer';
}

async function recalculateBadge(pool, userId) {
  const [[stats]] = await pool.query(
    `SELECT
      SUM(status = 'approved' AND is_deleted = FALSE) AS approved,
      SUM(status = 'rejected' AND is_deleted = FALSE) AS rejected
     FROM research_papers
     WHERE user_id = ?`,
    [userId]
  );
  const approved = Number(stats.approved || 0);
  const rejected = Number(stats.rejected || 0);
  const badge = badgeForApprovedCount(approved);
  await pool.query(
    'UPDATE users SET approved_count = ?, rejected_count = ?, badge_level = ? WHERE id = ?',
    [approved, rejected, badge, userId]
  );
  return badge;
}

module.exports = { badgeForApprovedCount, recalculateBadge };
