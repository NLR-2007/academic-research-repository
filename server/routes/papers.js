const router = require('express').Router();
const upload = require('../middleware/uploadMiddleware');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const {
  uploadTemp,
  extractPdf,
  duplicateCheck,
  submitPaper,
  listPapers,
  getPaper,
  updatePaper,
  requestAccess,
  respondAccess,
  createShareLink,
  trending
} = require('../controllers/paperController');

router.get('/', listPapers);
router.get('/trending', trending);
router.get('/duplicate-check', authMiddleware, duplicateCheck);
router.post('/upload-temp', authMiddleware, upload.single('pdf'), uploadTemp);
router.post('/extract', authMiddleware, extractPdf);
router.post('/submit', authMiddleware, submitPaper);
router.get('/:id', optionalAuth, getPaper);
router.put('/:id', authMiddleware, updatePaper);
router.post('/:id/request-access', authMiddleware, requestAccess);
router.post('/access-requests/:requestId/respond', authMiddleware, respondAccess);
router.post('/:id/share-link', authMiddleware, createShareLink);

module.exports = router;
