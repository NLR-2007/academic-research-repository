const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { profile, updateProfile, markNotificationsRead } = require('../controllers/userController');

router.get('/me', authMiddleware, profile);
router.patch('/me', authMiddleware, updateProfile);
router.patch('/notifications/read', authMiddleware, markNotificationsRead);

module.exports = router;
