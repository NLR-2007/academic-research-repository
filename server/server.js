const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const paperRoutes = require('./routes/papers');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const { ensureRuntimeSchema } = require('./utils/ensureRuntimeSchema');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'Academic Research Repository API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

ensureRuntimeSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to ensure runtime schema', error);
    process.exit(1);
  });
