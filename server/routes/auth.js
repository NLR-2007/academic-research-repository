const router = require('express').Router();
const { register, login, adminLogin, verifyAdminOtp } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/admin/verify-otp', verifyAdminOtp);

module.exports = router;
