const pool = require('../config/db');

const userColumns = [
  { name: 'institution', definition: 'VARCHAR(180) NULL AFTER email' },
  { name: 'research_role', definition: 'VARCHAR(120) NULL AFTER institution' },
  { name: 'bio', definition: 'TEXT NULL AFTER research_role' },
  { name: 'scholar_links', definition: 'JSON NULL AFTER bio' },
  { name: 'profile_image', definition: 'VARCHAR(500) NULL AFTER scholar_links' }
];

async function ensureUserColumns() {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
  );

  const existing = new Set(rows.map((row) => row.COLUMN_NAME));

  for (const column of userColumns) {
    if (existing.has(column.name)) continue;
    await pool.query(`ALTER TABLE users ADD COLUMN ${column.name} ${column.definition}`);
  }
}

async function ensurePaperColumns() {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'research_papers'`
  );
  
  const existing = new Set(rows.map((row) => row.COLUMN_NAME));
  if (!existing.has('file_hash')) {
    await pool.query('ALTER TABLE research_papers ADD COLUMN file_hash VARCHAR(64) NULL AFTER file_path');
  }
  if (!existing.has('code_path')) {
    await pool.query('ALTER TABLE research_papers ADD COLUMN code_path VARCHAR(500) NULL AFTER file_hash');
  }
  if (!existing.has('code_hash')) {
    await pool.query('ALTER TABLE research_papers ADD COLUMN code_hash VARCHAR(64) NULL AFTER code_path');
  }
}

async function ensureRuntimeSchema() {
  await ensureUserColumns();
  await ensurePaperColumns();
}

module.exports = { ensureRuntimeSchema };
