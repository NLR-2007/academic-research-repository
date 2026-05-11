/**
 * seedPapers.js — Populate the repository with real arXiv papers.
 *
 * Usage:
 *   node utils/seedPapers.js          → inserts 20 papers (default)
 *   node utils/seedPapers.js 50       → inserts 50 papers
 *   node utils/seedPapers.js 10 clear → clears seeded papers first, then inserts 10
 *
 * Papers are fetched from the free arXiv Atom API (no key required),
 * inserted as status=approved so they appear immediately in the feed.
 * Since no PDF is downloaded, visibility is set to "restricted" so the
 * abstract and metadata are fully visible but the PDF viewer is gated.
 */

const axios  = require('axios');
const { v4: uuidv4 } = require('uuid');
const pool   = require('../config/db');

/* ── How many papers to insert total ── */
const TOTAL  = Math.max(1, parseInt(process.argv[2]) || 20);
const CLEAR  = process.argv[3] === 'clear';

/* ──────────────────────────────────────────────────────────────
   arXiv category queries mapped to repo category names.
   The script distributes TOTAL evenly across these groups.
   ────────────────────────────────────────────────────────────── */
const SOURCES = [
  { query: 'cat:cs.AI',          category: 'Artificial Intelligence', journal: 'arXiv · cs.AI'  },
  { query: 'cat:cs.LG',          category: 'Machine Learning',        journal: 'arXiv · cs.LG'  },
  { query: 'cat:physics.gen-ph', category: 'Physics',                 journal: 'arXiv · physics' },
  { query: 'cat:q-bio.BM',       category: 'Biotechnology',           journal: 'arXiv · q-bio'  },
  { query: 'cat:econ.GN',        category: 'Economics',               journal: 'arXiv · econ'   },
  { query: 'cat:cs.NI',          category: 'Web Development',         journal: 'arXiv · cs.NI'  },
];

/* ── Fetch Atom XML from arXiv (with retries) ── */
async function fetchArxiv(query, maxResults, attempt = 1) {
  const url = 'https://export.arxiv.org/api/query';
  try {
    const { data } = await axios.get(url, {
      params: {
        search_query: query,
        start: 0,
        max_results: maxResults,
        sortBy: 'submittedDate',
        sortOrder: 'descending',
      },
      timeout: 45000,
    });
    return data;
  } catch (err) {
    if (attempt < 3) {
      process.stdout.write(`retry ${attempt}… `);
      await new Promise(r => setTimeout(r, 3000 * attempt));
      return fetchArxiv(query, maxResults, attempt + 1);
    }
    throw err;
  }
}

/* ── Extract first match of an XML tag ── */
function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`));
  return m ? m[1].trim() : '';
}

/* ── Extract all matches of an XML tag ── */
function allTags(xml, name) {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

/* ── Parse Atom XML → array of paper objects ── */
function parseAtom(xml) {
  const papers = [];
  const entries = allTags(xml, 'entry');

  for (const entry of entries) {
    const rawId    = tag(entry, 'id');                           // e.g. http://arxiv.org/abs/2401.00123v1
    const arxivId  = rawId.split('/abs/').pop().replace(/v\d+$/, '');
    const title    = tag(entry, 'title').replace(/\s+/g, ' ');
    const abstract = tag(entry, 'summary').replace(/\s+/g, ' ');
    const pubDate  = tag(entry, 'published');
    const year     = pubDate ? new Date(pubDate).getFullYear() : new Date().getFullYear();

    /* authors */
    const authorBlocks = allTags(entry, 'author');
    const authors = authorBlocks
      .map(b => tag(b, 'name'))
      .filter(Boolean);

    /* keywords from arXiv categories */
    const cats = (entry.match(/term="([^"]+)"/g) || [])
      .map(s => s.replace(/term="([^"]+)"/, '$1'))
      .filter(c => !c.startsWith('http'));

    if (!title || !abstract) continue;

    papers.push({
      arxivId,
      title:    title.slice(0, 500),
      abstract: abstract.slice(0, 3000),
      authors,
      year,
      doi:      `10.48550/arXiv.${arxivId}`,
      keywords: cats.slice(0, 8),
    });
  }
  return papers;
}

/* ── Main ── */
async function seedPapers() {
  /* Resolve category name → id */
  const [catRows] = await pool.query('SELECT id, name FROM categories');
  const catMap    = Object.fromEntries(catRows.map(r => [r.name.toLowerCase(), r.id]));

  /* Pick a user to attribute papers to */
  const [[firstUser]] = await pool.query(
    'SELECT id FROM users ORDER BY created_at ASC LIMIT 1'
  );
  if (!firstUser) {
    console.error('\n  ✖  No users found. Register at least one user account first.\n');
    process.exit(1);
  }
  const userId = firstUser.id;

  /* Optional: wipe previously seeded papers */
  if (CLEAR) {
    await pool.query(
      `DELETE FROM research_papers WHERE doi LIKE '10.48550/arXiv.%' AND is_deleted = FALSE`
    );
    console.log('  ✔  Cleared existing seeded papers.\n');
  }

  const perSource = Math.ceil(TOTAL / SOURCES.length);
  let inserted    = 0;
  let skipped     = 0;

  for (const source of SOURCES) {
    const catId = catMap[source.category.toLowerCase()];
    if (!catId) {
      console.warn(`  ⚠  Category not found in DB: "${source.category}" — skipping`);
      continue;
    }

    process.stdout.write(`  Fetching ${perSource} papers [${source.query}] … `);

    let xml;
    try {
      xml = await fetchArxiv(source.query, perSource);
    } catch (err) {
      console.log(`FAILED (${err.message})`);
      continue;
    }

    const papers = parseAtom(xml);
    console.log(`got ${papers.length}`);

    for (const p of papers) {
      /* Skip duplicates by DOI */
      const [[existing]] = await pool.query(
        'SELECT id FROM research_papers WHERE doi = ? LIMIT 1',
        [p.doi]
      );
      if (existing) { skipped++; continue; }

      await pool.query(
        `INSERT INTO research_papers
           (id, user_id, title, authors, abstract, keywords, doi, journal, year,
            category_id, visibility, license, status, file_path, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'restricted', 'open_access', 'approved', '', FALSE)`,
        [
          uuidv4(),
          userId,
          p.title,
          JSON.stringify(p.authors),
          p.abstract,
          JSON.stringify(p.keywords),
          p.doi,
          source.journal,
          p.year,
          catId,
        ]
      );

      console.log(`    ✓ [${source.category}] ${p.title.slice(0, 65)}…`);
      inserted++;
    }
  }

  console.log(`\n  Done — ${inserted} papers inserted, ${skipped} duplicates skipped.\n`);
  process.exit(0);
}

seedPapers().catch(err => {
  console.error('\n  ✖  Seed failed:', err.message, '\n');
  process.exit(1);
});
