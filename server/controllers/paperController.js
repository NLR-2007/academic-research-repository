const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { extractMetadata } = require('../utils/pdfParser');

function parseJson(value, fallback = []) {
  if (Array.isArray(value)) return value;
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (_error) {
    return fallback;
  }
}

async function canAccessPaper(paper, user, token) {
  if (paper.visibility === 'public') return true;
  if (paper.visibility === 'restricted') return Boolean(user);
  if (user && user.id === paper.user_id) return true;
  if (token) {
    const [[share]] = await pool.query(
      'SELECT id FROM private_share_links WHERE paper_id = ? AND token = ? AND expires_at > NOW()',
      [paper.id, token]
    );
    if (share) return true;
  }
  if (!user) return false;
  const [[grant]] = await pool.query(
    'SELECT id FROM access_requests WHERE requester_id = ? AND paper_id = ? AND status = "granted"',
    [user.id, paper.id]
  );
  return Boolean(grant);
}

function currentYearWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOffset = Math.floor((now - start) / 86400000);
  return now.getFullYear() * 100 + Math.ceil((dayOffset + start.getDay() + 1) / 7);
}

async function uploadTemp(req, res) {
  try {
    const fileBuffer = await fs.readFile(req.file.path);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const fileHash = hashSum.digest('hex');

    // Only check duplicates for PDF files
    if (req.file.mimetype === 'application/pdf') {
      const [[existing]] = await pool.query('SELECT id FROM research_papers WHERE file_hash = ? AND is_deleted = FALSE', [fileHash]);
      if (existing) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(409).json({ message: 'THIS PAPER IS SOMEONES WORKS U CANNOT UPLOAD THIS.' });
      }
    }

    res.status(201).json({
      fileName: req.file.originalname,
      size: req.file.size,
      tempPath: req.file.filename,
      fileHash,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload temp error:', error);
    res.status(500).json({ message: 'Failed to process uploaded file' });
  }
}

async function extractPdf(req, res) {
  const filePath = path.join(__dirname, '..', 'uploads', 'temp', req.body.tempPath || '');
  const metadata = await extractMetadata(filePath);
  res.json(metadata);
}

async function duplicateCheck(req, res) {
  const [rows] = await pool.query(
    'SELECT id, title FROM research_papers WHERE LOWER(title) = LOWER(?) AND is_deleted = FALSE LIMIT 5',
    [req.query.title || '']
  );
  res.json({ duplicate: rows.length > 0, matches: rows });
}

async function submitPaper(req, res) {
  try {
    const {
      tempPath, codeTempPath, title, authors, abstract, keywords, doi, journal, year, volume, issue,
      category_id, sub_category, visibility, license, declaration
    } = req.body;

    if (!declaration) return res.status(400).json({ message: 'Rights declaration is required' });
    if (!tempPath || !title || !abstract || !year || !category_id) {
      return res.status(400).json({ message: 'Missing required metadata' });
    }

    const id = uuidv4();
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    
    const paperDestDir = path.join(__dirname, '..', 'uploads', 'papers', yyyy, mm);
    const codeDestDir = path.join(__dirname, '..', 'uploads', 'code', yyyy, mm);
    await fs.mkdir(paperDestDir, { recursive: true });
    await fs.mkdir(codeDestDir, { recursive: true });

    const source = path.join(__dirname, '..', 'uploads', 'temp', tempPath);
    await fs.access(source).catch(() => {
      const error = new Error('Temporary paper upload not found.');
      error.status = 400;
      throw error;
    });

    const fileBuffer = await fs.readFile(source);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const fileHash = hashSum.digest('hex');

    const [[existing]] = await pool.query('SELECT id FROM research_papers WHERE file_hash = ? AND is_deleted = FALSE', [fileHash]);
    if (existing) return res.status(409).json({ message: 'THIS PAPER IS SOMEONES WORKS U CANNOT UPLOAD THIS.' });

    const paperDestName = `${id}.pdf`;
    const paperDest = path.join(paperDestDir, paperDestName);
    const relativePaperPath = path.join('papers', yyyy, mm, paperDestName).replace(/\\/g, '/');

    let relativeCodePath = null;
    let codeHash = null;

    if (codeTempPath) {
      const codeSource = path.join(__dirname, '..', 'uploads', 'temp', codeTempPath);
      await fs.access(codeSource).catch(() => {
        const error = new Error('Temporary code upload not found.');
        error.status = 400;
        throw error;
      });

      const codeBuffer = await fs.readFile(codeSource);
      const cHashSum = crypto.createHash('sha256');
      cHashSum.update(codeBuffer);
      codeHash = cHashSum.digest('hex');

      const codeDestName = `${id}.zip`;
      const codeDest = path.join(codeDestDir, codeDestName);
      relativeCodePath = path.join('code', yyyy, mm, codeDestName).replace(/\\/g, '/');
      await fs.rename(codeSource, codeDest);
    }

    await fs.rename(source, paperDest);

    try {
      await pool.query(
        `INSERT INTO research_papers
         (id, user_id, title, authors, abstract, keywords, doi, journal, year, volume, issue,
          category_id, sub_category, visibility, license, file_path, file_hash, code_path, code_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, req.user.id, title, JSON.stringify(parseJson(authors)), abstract,
          JSON.stringify(parseJson(keywords)), doi || null, journal || null, Number(year),
          volume || null, issue || null, Number(category_id), sub_category || null,
          visibility || 'public', license || 'open_access', relativePaperPath, fileHash,
          relativeCodePath, codeHash
        ]
      );
      await pool.query('UPDATE categories SET paper_count = paper_count + 1 WHERE id = ?', [category_id]);
    } catch (error) {
      await fs.unlink(paperDest).catch(() => {});
      if (relativeCodePath) {
        const codeAbs = path.join(__dirname, '..', 'uploads', relativeCodePath);
        await fs.unlink(codeAbs).catch(() => {});
      }
      throw error;
    }

    res.status(201).json({ id, status: 'pending', message: 'Research & Code submitted for admin review' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || 'Paper submission failed' });
  }
}

async function listPapers(req, res) {
  const { category, year, license, visibility, q, status = 'approved' } = req.query;
  const params = [];
  const filters = ['p.is_deleted = FALSE'];
  if (status !== 'all') {
    filters.push('p.status = ?');
    params.push(status);
  }
  if (category) {
    filters.push('p.category_id = ?');
    params.push(category);
  }
  if (year) {
    filters.push('p.year = ?');
    params.push(year);
  }
  if (license) {
    filters.push('p.license = ?');
    params.push(license);
  }
  if (visibility) {
    filters.push('p.visibility = ?');
    params.push(visibility);
  }
  if (q) {
    filters.push('(p.title LIKE ? OR p.abstract LIKE ? OR JSON_SEARCH(p.authors, "one", ?) IS NOT NULL OR JSON_SEARCH(p.keywords, "one", ?) IS NOT NULL)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, u.name AS uploader_name
     FROM research_papers p
     JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = p.user_id
     WHERE ${filters.join(' AND ')}
     ORDER BY p.uploaded_at DESC`,
    params
  );
  res.json(rows);
}

async function getPaper(req, res) {
  const [[paper]] = await pool.query(
    `SELECT p.*, c.name AS category_name, u.name AS uploader_name
     FROM research_papers p
     JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = p.user_id
     WHERE p.id = ? AND p.is_deleted = FALSE`,
    [req.params.id]
  );
  if (!paper) return res.status(404).json({ message: 'Paper not found' });

  const allowed = await canAccessPaper(paper, req.user, req.query.share);
  const viewerId = req.user?.id || null;
  if (allowed) {
    const [viewResult] = await pool.query(
      'INSERT IGNORE INTO paper_views (user_id, paper_id, view_week) VALUES (?, ?, ?)',
      [viewerId, paper.id, currentYearWeek()]
    );
    if (viewResult.affectedRows > 0) {
      await pool.query('UPDATE research_papers SET view_count = view_count + 1 WHERE id = ?', [paper.id]);
    }
  }

  let requestStatus = null;
  if (!allowed && req.user) {
    const [[reqRow]] = await pool.query(
      'SELECT status FROM access_requests WHERE requester_id = ? AND paper_id = ?',
      [req.user.id, paper.id]
    );
    if (reqRow) requestStatus = reqRow.status;
  }

  const fileUrl = allowed ? `/uploads/${paper.file_path}` : null;
  const codeUrl = (allowed && paper.code_path) ? `/uploads/${paper.code_path}` : null;
  res.json({ ...paper, canAccess: allowed, fileUrl, codeUrl, requestStatus });
}

async function requestAccess(req, res) {
  const [[paper]] = await pool.query('SELECT * FROM research_papers WHERE id = ? AND visibility = "private"', [req.params.id]);
  if (!paper) return res.status(404).json({ message: 'Private paper not found' });
  if (paper.user_id === req.user.id) return res.status(400).json({ message: 'You already own this paper' });

  await pool.query(
    'INSERT INTO access_requests (requester_id, paper_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = "pending"',
    [req.user.id, paper.id]
  );
  await pool.query(
    'INSERT INTO notifications (user_id, paper_id, type, message) VALUES (?, ?, "access_request", ?)',
    [paper.user_id, paper.id, `${req.user.name || 'A user'} requested access to "${paper.title}".`]
  );
  res.status(201).json({ message: 'Access request sent' });
}

async function respondAccess(req, res) {
  const { status } = req.body;
  if (!['granted', 'denied'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const [[request]] = await pool.query(
    `SELECT ar.*, p.user_id, p.title
     FROM access_requests ar
     JOIN research_papers p ON p.id = ar.paper_id
     WHERE ar.id = ?`,
    [req.params.requestId]
  );
  if (!request || request.user_id !== req.user.id) return res.status(404).json({ message: 'Request not found' });

  await pool.query('UPDATE access_requests SET status = ? WHERE id = ?', [status, request.id]);
  if (status === 'granted') {
    await pool.query(
      'INSERT INTO notifications (user_id, paper_id, type, message) VALUES (?, ?, "access_granted", ?)',
      [request.requester_id, request.paper_id, `Access granted for "${request.title}".`]
    );
  }
  res.json({ message: `Access ${status}` });
}

async function createShareLink(req, res) {
  const [[paper]] = await pool.query('SELECT * FROM research_papers WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!paper) return res.status(404).json({ message: 'Paper not found' });
  const token = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query('INSERT INTO private_share_links (paper_id, token, expires_at) VALUES (?, ?, ?)', [paper.id, token, expires]);
  res.status(201).json({ token, expires_at: expires, url: `${process.env.CLIENT_URL}/papers/${paper.id}?share=${token}` });
}

async function trending(_req, res) {
  const [rows] = await pool.query(
    `SELECT p.id, p.title, p.authors, p.view_count, c.name AS category_name, COUNT(v.id) AS weekly_views
     FROM research_papers p
     LEFT JOIN paper_views v ON v.paper_id = p.id AND v.viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     JOIN categories c ON c.id = p.category_id
     WHERE p.status = 'approved' AND p.is_deleted = FALSE
     GROUP BY p.id
     ORDER BY weekly_views DESC, p.view_count DESC
     LIMIT 5`
  );
  res.json(rows);
}

module.exports = {
  uploadTemp,
  extractPdf,
  duplicateCheck,
  submitPaper,
  listPapers,
  getPaper,
  requestAccess,
  respondAccess,
  createShareLink,
  trending
};
