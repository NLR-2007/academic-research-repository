const pool = require('../config/db');

function parseScholarLinks(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

async function profile(req, res) {
  const [[user]] = await pool.query(
    `SELECT id, name, email, institution, research_role, bio, scholar_links, profile_image,
            badge_level, approved_count, rejected_count, created_at
     FROM users
     WHERE id = ? AND is_active = TRUE`,
    [req.user.id]
  );
  if (!user) return res.status(404).json({ message: 'User not found' });

  try {
    user.scholar_links = user.scholar_links ? JSON.parse(user.scholar_links) : [];
  } catch (_error) {
    user.scholar_links = [];
  }

  const [[stats]] = await pool.query(
    `SELECT
      COUNT(*) AS total_uploaded,
      SUM(status = 'approved' AND is_deleted = FALSE) AS approved,
      SUM(status = 'rejected' AND is_deleted = FALSE) AS rejected,
      SUM(status = 'pending' AND is_deleted = FALSE) AS pending
     FROM research_papers
     WHERE user_id = ?`,
    [req.user.id]
  );
  const [papers] = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM research_papers p
     JOIN categories c ON c.id = p.category_id
     WHERE p.user_id = ? AND p.is_deleted = FALSE
     ORDER BY p.uploaded_at DESC`,
    [req.user.id]
  );
  const [notifications] = await pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
    [req.user.id]
  );
  const [recentlyViewed] = await pool.query(
    `SELECT p.id, p.title, p.authors, v.viewed_at
     FROM paper_views v
     JOIN research_papers p ON p.id = v.paper_id
     WHERE v.user_id = ? AND p.is_deleted = FALSE
     ORDER BY v.viewed_at DESC
     LIMIT 10`,
    [req.user.id]
  );
  const [accessRequests] = await pool.query(
    `SELECT ar.*, p.title, u.name AS requester_name
     FROM access_requests ar
     JOIN research_papers p ON p.id = ar.paper_id
     JOIN users u ON u.id = ar.requester_id
     WHERE p.user_id = ? AND ar.status = 'pending'
     ORDER BY ar.requested_at DESC`,
    [req.user.id]
  );

  res.json({ user, stats, papers, notifications, recentlyViewed, accessRequests });
}

async function updateProfile(req, res) {
  const { name, institution, role, bio, scholarLinks, profileImage } = req.body;

  if (!name || !institution || !role) {
    return res.status(400).json({ message: 'Name, institution, and role are required' });
  }

  const links = parseScholarLinks(scholarLinks);

  await pool.query(
    `UPDATE users
     SET name = ?, institution = ?, research_role = ?, bio = ?, scholar_links = ?, profile_image = ?
     WHERE id = ? AND is_active = TRUE`,
    [
      name.trim(),
      institution.trim(),
      role.trim(),
      bio?.trim() || null,
      JSON.stringify(links),
      profileImage?.trim() || null,
      req.user.id
    ]
  );

  res.json({ message: 'Profile updated' });
}

async function markNotificationsRead(req, res) {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
  res.json({ message: 'Notifications marked as read' });
}

module.exports = { profile, updateProfile, markNotificationsRead };
