const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO admins (username, password_hash, telegram_chat_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE telegram_chat_id = VALUES(telegram_chat_id)`,
    [username, hash, process.env.TELEGRAM_CHAT_ID || null]
  );
  console.log(`Admin ensured: ${username}`);
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
