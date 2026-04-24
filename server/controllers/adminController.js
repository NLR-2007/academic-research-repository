const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');
const { recalculateBadge } = require('../utils/badgeUpdater');
const { sendMail } = require('../utils/mailer');

async function dashboard(req, res) {
  const { q = '', category = '', status = '' } = req.query;
  const listFilters = ['p.is_deleted = FALSE'];
  const listParams = [];
  if (status) {
    listFilters.push('p.status = ?');
    listParams.push(status);
  }
  if (category) {
    listFilters.push('p.category_id = ?');
    listParams.push(category);
  }
  if (q) {
    listFilters.push('(p.title LIKE ? OR u.name LIKE ? OR JSON_SEARCH(p.authors, "one", ?) IS NOT NULL)');
    listParams.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const [[stats]] = await pool.query(
    `SELECT
      COUNT(*) AS total_papers,
      SUM(status = 'pending' AND is_deleted = FALSE) AS pending_review,
      SUM(status = 'approved' AND MONTH(approved_at) = MONTH(CURRENT_DATE()) AND YEAR(approved_at) = YEAR(CURRENT_DATE())) AS approved_this_month,
      SUM(status = 'rejected' AND MONTH(uploaded_at) = MONTH(CURRENT_DATE()) AND YEAR(uploaded_at) = YEAR(CURRENT_DATE())) AS rejected_this_month
     FROM research_papers
     WHERE is_deleted = FALSE`
  );
  const [[users]] = await pool.query('SELECT COUNT(*) AS total_users FROM users WHERE is_active = TRUE');
  const [categoryCounts] = await pool.query(
    `SELECT c.name, COUNT(p.id) AS count
     FROM categories c
     LEFT JOIN research_papers p ON p.category_id = c.id AND p.is_deleted = FALSE
     GROUP BY c.id
     ORDER BY c.name`
  );
  const [monthlyTrend] = await pool.query(
    `SELECT DATE_FORMAT(uploaded_at, '%Y-%m') AS month, COUNT(*) AS count
     FROM research_papers
     WHERE uploaded_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH) AND is_deleted = FALSE
     GROUP BY month
     ORDER BY month`
  );
  const [recentActivity] = await pool.query(
    `SELECT 'upload' AS type, p.id AS paper_id, p.title, u.name AS actor_name, p.uploaded_at AS created_at,
            CONCAT(u.name, ' uploaded "', p.title, '".') AS message
     FROM research_papers p
     JOIN users u ON u.id = p.user_id
     WHERE p.is_deleted = FALSE
     UNION ALL
     SELECT l.action AS type, l.paper_id, COALESCE(p.title, 'Unknown paper') AS title, a.username AS actor_name, l.created_at,
            CONCAT(a.username, ' ', l.action, 'd "', COALESCE(p.title, 'a paper'), '".') AS message
     FROM admin_logs l
     JOIN admins a ON a.id = l.admin_id
     LEFT JOIN research_papers p ON p.id = l.paper_id
     ORDER BY created_at DESC
     LIMIT 12`
  );
  const [pendingPapers] = await pool.query(
    `SELECT p.id, p.title, p.uploaded_at, p.authors, c.name AS category_name, u.name AS uploader_name
     FROM research_papers p
     JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = p.user_id
     WHERE p.status = 'pending' AND p.is_deleted = FALSE
     ORDER BY p.uploaded_at DESC`
  );
  const [latestPapers] = await pool.query(
    `SELECT p.id, p.title, p.uploaded_at, p.status, c.name AS category_name, u.name AS uploader_name
     FROM research_papers p
     JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = p.user_id
     WHERE p.is_deleted = FALSE
     ORDER BY p.uploaded_at DESC
     LIMIT 8`
  );
  const [topContributors] = await pool.query(
    `SELECT u.id, u.name, u.email, u.badge_level, COUNT(p.id) AS approved_papers
     FROM users u
     LEFT JOIN research_papers p
       ON p.user_id = u.id
      AND p.status = 'approved'
      AND p.is_deleted = FALSE
     WHERE u.is_active = TRUE
     GROUP BY u.id
     ORDER BY approved_papers DESC, u.name ASC
     LIMIT 6`
  );
  const [notifications] = await pool.query(
    `SELECT n.id, n.type, n.message, n.created_at, u.name AS user_name, p.title
     FROM notifications n
     JOIN users u ON u.id = n.user_id
     LEFT JOIN research_papers p ON p.id = n.paper_id
     ORDER BY n.created_at DESC
     LIMIT 10`
  );
  const [filteredPapers] = await pool.query(
    `SELECT p.id, p.title, p.status, p.visibility, p.uploaded_at, c.name AS category_name, u.name AS uploader_name
     FROM research_papers p
     JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = p.user_id
     WHERE ${listFilters.join(' AND ')}
     ORDER BY p.uploaded_at DESC
     LIMIT 12`,
    listParams
  );
  const [categories] = await pool.query('SELECT id, name FROM categories ORDER BY name');

  res.json({
    ...stats,
    total_users: users.total_users,
    categoryCounts,
    monthlyTrend,
    recentActivity,
    pendingPapers,
    latestPapers,
    topContributors,
    notifications,
    filteredPapers,
    categories
  });
}

async function pendingCount(_req, res) {
  const [[row]] = await pool.query('SELECT COUNT(*) AS count FROM research_papers WHERE status = "pending" AND is_deleted = FALSE');
  res.json(row);
}

async function listAdminPapers(req, res) {
  const { status, category, visibility, q, from, to } = req.query;
  const params = [];
  const filters = ['p.is_deleted = FALSE'];
  if (status) {
    filters.push('p.status = ?');
    params.push(status);
  }
  if (category) {
    filters.push('p.category_id = ?');
    params.push(category);
  }
  if (visibility) {
    filters.push('p.visibility = ?');
    params.push(visibility);
  }
  if (from) {
    filters.push('DATE(p.uploaded_at) >= ?');
    params.push(from);
  }
  if (to) {
    filters.push('DATE(p.uploaded_at) <= ?');
    params.push(to);
  }
  if (q) {
    filters.push('(p.title LIKE ? OR JSON_SEARCH(p.authors, "one", ?) IS NOT NULL)');
    params.push(`%${q}%`, `%${q}%`);
  }

  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, u.name AS uploader_name, u.email AS uploader_email
     FROM research_papers p
     JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = p.user_id
     WHERE ${filters.join(' AND ')}
     ORDER BY p.uploaded_at DESC`,
    params
  );
  res.json(rows);
}

async function approvePaper(req, res) {
  const [[paper]] = await pool.query(
    `SELECT p.*, u.email, u.name
     FROM research_papers p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = ? AND p.is_deleted = FALSE`,
    [req.params.id]
  );
  if (!paper) return res.status(404).json({ message: 'Paper not found' });

  await pool.query(
    'UPDATE research_papers SET status = "approved", rejection_reason = NULL, approved_at = NOW(), approved_by = ? WHERE id = ?',
    [req.user.id, paper.id]
  );
  await recalculateBadge(pool, paper.user_id);
  await pool.query(
    'INSERT INTO notifications (user_id, paper_id, type, message) VALUES (?, ?, "approved", ?)',
    [paper.user_id, paper.id, `Your paper "${paper.title}" was approved.`]
  );
  await pool.query('INSERT INTO admin_logs (admin_id, paper_id, action) VALUES (?, ?, "approve")', [req.user.id, paper.id]);
  await sendMail({ to: paper.email, subject: 'Paper approved', text: `Your paper "${paper.title}" was approved.` });
  res.json({ message: 'Paper approved' });
}

async function rejectPaper(req, res) {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

  const [[paper]] = await pool.query(
    `SELECT p.*, u.email
     FROM research_papers p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = ? AND p.is_deleted = FALSE`,
    [req.params.id]
  );
  if (!paper) return res.status(404).json({ message: 'Paper not found' });

  await pool.query('UPDATE research_papers SET status = "rejected", rejection_reason = ? WHERE id = ?', [reason, paper.id]);
  await recalculateBadge(pool, paper.user_id);
  await pool.query(
    'INSERT INTO notifications (user_id, paper_id, type, message) VALUES (?, ?, "rejected", ?)',
    [paper.user_id, paper.id, `Your paper "${paper.title}" was rejected. Reason: ${reason}`]
  );
  await pool.query('INSERT INTO admin_logs (admin_id, paper_id, action, reason) VALUES (?, ?, "reject", ?)', [req.user.id, paper.id, reason]);
  await sendMail({ to: paper.email, subject: 'Paper rejected', text: `Your paper "${paper.title}" was rejected. Reason: ${reason}` });
  res.json({ message: 'Paper rejected' });
}

async function deletePaper(req, res) {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'Deletion reason is required' });

  const [[paper]] = await pool.query('SELECT * FROM research_papers WHERE id = ? AND is_deleted = FALSE', [req.params.id]);
  if (!paper) return res.status(404).json({ message: 'Paper not found' });

  await pool.query('UPDATE research_papers SET is_deleted = TRUE, deletion_reason = ? WHERE id = ?', [reason, paper.id]);
  const absolute = path.join(__dirname, '..', 'uploads', paper.file_path);
  await fs.unlink(absolute).catch(() => {});
  await recalculateBadge(pool, paper.user_id);
  await pool.query(
    'INSERT INTO notifications (user_id, paper_id, type, message) VALUES (?, ?, "deleted", ?)',
    [paper.user_id, paper.id, `Your paper "${paper.title}" was deleted. Reason: ${reason}`]
  );
  await pool.query('INSERT INTO admin_logs (admin_id, paper_id, action, reason) VALUES (?, ?, "delete", ?)', [req.user.id, paper.id, reason]);
  res.json({ message: 'Paper deleted' });
}

async function listUsers(_req, res) {
  const [rows] = await pool.query(
    `SELECT u.*,
      COUNT(p.id) AS uploaded,
      SUM(p.status = 'pending' AND p.is_deleted = FALSE) AS pending
     FROM users u
     LEFT JOIN research_papers p ON p.user_id = u.id AND p.is_deleted = FALSE
     WHERE u.is_active = TRUE
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  res.json(rows);
}

async function deleteUser(req, res) {
  const { id } = req.params;
  await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
  await pool.query('UPDATE research_papers SET is_deleted = TRUE WHERE user_id = ?', [id]);
  res.json({ message: 'User and their papers were soft-deleted' });
}

async function logs(_req, res) {
  const [rows] = await pool.query(
    `SELECT l.*, a.username, p.title
     FROM admin_logs l
     JOIN admins a ON a.id = l.admin_id
     LEFT JOIN research_papers p ON p.id = l.paper_id
     ORDER BY l.created_at DESC
     LIMIT 200`
  );
  res.json(rows);
}

module.exports = {
  dashboard,
  pendingCount,
  listAdminPapers,
  approvePaper,
  rejectPaper,
  deletePaper,
  listUsers,
  deleteUser,
  logs
};
