const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');

const BASE_URL = () => `http://localhost:${process.env.PORT || 5000}`;

// GET /api/team — public
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows.map(m => ({
      ...m,
      photo_url: m.photo_path ? `${BASE_URL()}/${m.photo_path}` : null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/team/all — admin (includes inactive)
router.get('/all', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC');
    res.json(rows.map(m => ({
      ...m,
      photo_url: m.photo_path ? `${BASE_URL()}/${m.photo_path}` : null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/team — admin create
router.post('/', auth, upload.single('photo'), async (req, res) => {
  const { full_name, position, department, responsibilities, sort_order } = req.body;
  if (!position || !department) return res.status(400).json({ message: 'Position and department are required.' });
  const photo_path = req.file ? req.file.path.replace(/\\/g, '/') : null;
  try {
    const [result] = await db.query(
      'INSERT INTO team_members (full_name, position, department, responsibilities, photo_path, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name || 'Abebe Kebede', position, department, responsibilities || '', photo_path, sort_order || 0]
    );
    const [[member]] = await db.query('SELECT * FROM team_members WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...member, photo_url: photo_path ? `${BASE_URL()}/${photo_path}` : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/team/:id — admin update
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  const { full_name, position, department, responsibilities, sort_order, is_active } = req.body;
  try {
    const [[existing]] = await db.query('SELECT * FROM team_members WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Member not found.' });

    let photo_path = existing.photo_path;
    if (req.file) {
      if (photo_path && fs.existsSync(photo_path)) fs.unlinkSync(photo_path);
      photo_path = req.file.path.replace(/\\/g, '/');
    }

    await db.query(
      'UPDATE team_members SET full_name=?, position=?, department=?, responsibilities=?, photo_path=?, sort_order=?, is_active=? WHERE id=?',
      [full_name ?? existing.full_name, position ?? existing.position, department ?? existing.department,
       responsibilities ?? existing.responsibilities, photo_path, sort_order ?? existing.sort_order,
       is_active ?? existing.is_active, req.params.id]
    );
    const [[updated]] = await db.query('SELECT * FROM team_members WHERE id = ?', [req.params.id]);
    res.json({ ...updated, photo_url: updated.photo_path ? `${BASE_URL()}/${updated.photo_path}` : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/team/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const [[member]] = await db.query('SELECT * FROM team_members WHERE id = ?', [req.params.id]);
    if (!member) return res.status(404).json({ message: 'Member not found.' });
    if (member.photo_path && fs.existsSync(member.photo_path)) fs.unlinkSync(member.photo_path);
    await db.query('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Member deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
