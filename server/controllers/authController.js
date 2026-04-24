const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { generateOtp, sendAdminOtp } = require('../utils/telegramOTP');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

async function register(req, res) {
  const { name, email, password, institution, role, bio, scholarLinks, profileImage } = req.body;
  if (!name || !email || !password || !institution || !role) {
    return res.status(400).json({ message: 'Name, email, password, institution, and role are required' });
  }

  const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const id = uuidv4();
  const hash = await bcrypt.hash(password, 10);
  const links = Array.isArray(scholarLinks)
    ? scholarLinks.filter(Boolean)
    : String(scholarLinks || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

  await pool.query(
    `INSERT INTO users
     (id, name, email, institution, research_role, bio, scholar_links, profile_image, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name.trim(),
      email.trim(),
      institution.trim(),
      role.trim(),
      bio?.trim() || null,
      JSON.stringify(links),
      profileImage?.trim() || null,
      hash
    ]
  );

  const token = signToken({ id, name, email, role: 'user' });
  res.status(201).json({
    token,
    user: {
      id,
      name: name.trim(),
      email: email.trim(),
      institution: institution.trim(),
      research_role: role.trim(),
      bio: bio?.trim() || null,
      scholar_links: links,
      profile_image: profileImage?.trim() || null,
      role: 'user',
      badge_level: 'Newcomer'
    }
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  const [[user]] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ id: user.id, name: user.name, email: user.email, role: 'user' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: 'user', badge_level: user.badge_level } });
}

async function adminLogin(req, res) {
  const { username, password } = req.body;
  const [[admin]] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const otp = generateOtp();
  const expires = new Date(Date.now() + 5 * 60 * 1000);
  await pool.query('UPDATE admins SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [otp, expires, admin.id]);
  await sendAdminOtp(admin.telegram_chat_id || process.env.TELEGRAM_CHAT_ID, otp);
  res.json({ message: 'OTP sent to configured Telegram chat', adminId: admin.id });
}

async function verifyAdminOtp(req, res) {
  const { adminId, otp } = req.body;
  const [[admin]] = await pool.query('SELECT * FROM admins WHERE id = ?', [adminId]);
  const now = new Date();
  if (!admin || !admin.otp_code || admin.otp_code !== otp || new Date(admin.otp_expires_at) < now) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  await pool.query('UPDATE admins SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [admin.id]);
  const token = signToken({ id: admin.id, username: admin.username, role: 'admin' });
  res.json({ token, user: { id: admin.id, username: admin.username, role: 'admin' } });
}

module.exports = { register, login, adminLogin, verifyAdminOtp };
