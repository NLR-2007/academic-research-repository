const pool = require('../config/db');

async function listCategories(_req, res) {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  res.json(rows);
}

module.exports = { listCategories };
