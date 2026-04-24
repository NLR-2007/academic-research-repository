const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  dashboard,
  pendingCount,
  listAdminPapers,
  approvePaper,
  rejectPaper,
  deletePaper,
  listUsers,
  deleteUser,
  logs
} = require('../controllers/adminController');

router.use(authMiddleware, adminMiddleware);
router.get('/dashboard', dashboard);
router.get('/pending-count', pendingCount);
router.get('/papers', listAdminPapers);
router.patch('/papers/:id/approve', approvePaper);
router.patch('/papers/:id/reject', rejectPaper);
router.delete('/papers/:id', deletePaper);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);
router.get('/logs', logs);

module.exports = router;
