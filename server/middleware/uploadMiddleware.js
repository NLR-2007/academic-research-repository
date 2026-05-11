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

const allowedTypes = (_req, file, cb) => {
  const isPdf = file.mimetype === 'application/pdf';
  const isZip = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'].includes(file.mimetype) 
             && file.originalname.toLowerCase().endsWith('.zip');
  
  if (isPdf || isZip) {
    return cb(null, true);
  }
  return cb(new Error('Only PDF and ZIP uploads are allowed'));
};

module.exports = multer({
  storage,
  fileFilter: allowedTypes,
  limits: { fileSize: 50 * 1024 * 1024 } // Increased limit for code zips
});
