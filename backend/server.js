require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve banner images statically (drop images into backend/banners/)
// Using express.static with fallthrough disabled so encoded filenames work
app.use('/banners', (req, res, next) => {
  // decode the URL so "A%20(1).png" → "A (1).png" on disk
  req.url = decodeURIComponent(req.url);
  next();
}, express.static(path.join(__dirname, 'banners')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/news', require('./routes/news'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/team', require('./routes/team'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'All Things API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
