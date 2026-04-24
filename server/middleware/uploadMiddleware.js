const fs = require('fs');
const path = require('path');
const multer = require('multer');

const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const pdfOnly = (_req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF uploads are allowed'));
  }
  return cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter: pdfOnly,
  limits: { fileSize: 20 * 1024 * 1024 }
});
