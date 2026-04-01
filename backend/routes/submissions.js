const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');
const fs = require('fs');

function userAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated.' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(403).json({ message: 'Invalid token.' }); }
}

const BASE_URL = () => `http://localhost:${process.env.PORT || 5000}`;

// POST /api/submissions — create a new path submission
router.post('/', userAuth, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 5 },
]), async (req, res) => {
  const { path_name, description } = req.body;
  const images = req.files?.images || [];
  const videos = req.files?.videos || [];

  if (!path_name) return res.status(400).json({ message: 'Path name is required.' });
  if (images.length < 3) return res.status(400).json({ message: 'Please upload at least 3 images.' });
  if (images.length > 5) return res.status(400).json({ message: 'Maximum 5 images allowed.' });
  if (videos.length < 3) return res.status(400).json({ message: 'Please upload at least 3 videos.' });
  if (videos.length > 5) return res.status(400).json({ message: 'Maximum 5 videos allowed.' });

  try {
    const [result] = await db.query(
      'INSERT INTO user_submissions (user_id, path_name, description) VALUES (?, ?, ?)',
      [req.user.id, path_name, description || null]
    );
    const subId = result.insertId;

    const fileRows = [
      ...images.map(f => [subId, 'image', f.path.replace(/\\/g, '/')]),
      ...videos.map(f => [subId, 'video', f.path.replace(/\\/g, '/')]),
    ];
    await db.query('INSERT INTO user_submission_files (submission_id, type, file_path) VALUES ?', [fileRows]);

    res.status(201).json({ message: 'Submission received.', id: subId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/submissions — get own submissions
router.get('/', userAuth, async (req, res) => {
  try {
    const [subs] = await db.query(
      'SELECT * FROM user_submissions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    for (const sub of subs) {
      const [files] = await db.query('SELECT * FROM user_submission_files WHERE submission_id = ?', [sub.id]);
      sub.files = files.map(f => ({ ...f, url: `${BASE_URL()}/${f.file_path}` }));
    }
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
