const pool = require('../config/db');

async function clear() {
  const [result] = await pool.query(
    `DELETE FROM research_papers WHERE doi LIKE '10.48550/arXiv.%'`
  );
  console.log(`  ✔  Deleted ${result.affectedRows} seeded paper(s).`);
  process.exit(0);
}

clear().catch(err => {
  console.error('  ✖  Failed:', err.message);
  process.exit(1);
});
