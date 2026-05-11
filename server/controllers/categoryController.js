const pool = require('../config/db');

async function listCategories(_req, res) {
  const [rows] = await pool.query(`
    SELECT c.id, c.name, c.sub_category, c.icon_color, c.description,
      COUNT(CASE WHEN p.status = 'approved' AND p.is_deleted = FALSE THEN 1 END) AS paper_count
    FROM categories c
    LEFT JOIN research_papers p ON p.category_id = c.id
    GROUP BY c.id, c.name, c.sub_category, c.icon_color, c.description
    ORDER BY c.name ASC
  `);
  res.json(rows);
}

module.exports = { listCategories };
