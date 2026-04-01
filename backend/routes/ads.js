const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');

const BASE_URL = () => `http://localhost:${process.env.PORT || 5000}`;

// Helper: compute show_from / show_until for holiday ads
function computeHolidayWindow(holidayDateStr) {
  const holiday = new Date(holidayDateStr);
  const from = new Date(holiday);
  from.setDate(from.getDate() - 7); // 1 week before
  const until = new Date(holiday);
  until.setDate(until.getDate() + 3); // 3 days after
  return {
    show_from: from.toISOString().split('T')[0],
    show_until: until.toISOString().split('T')[0],
  };
}

function formatAd(ad) {
  return {
    ...ad,
    image_url: ad.image_path ? `${BASE_URL()}/${ad.image_path}` : null,
  };
}

// ─── PUBLIC: get active ads for today ────────────────────────────
// GET /api/ads/active
router.get('/active', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
      `SELECT * FROM ads
       WHERE is_active = 1
         AND show_from <= ?
         AND show_until >= ?
       ORDER BY sort_order ASC, id ASC`,
      [today, today]
    );
    res.json(rows.map(formatAd));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────

// GET /api/ads (all ads)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ads ORDER BY sort_order ASC, id DESC');
    res.json(rows.map(formatAd));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/ads (create)
router.post('/', auth, async (req, res) => {
  let {
    title, type, holiday_name, holiday_date,
    show_from, show_until, link_url,
    duration_sec, sort_order, is_active, company_name,
  } = req.body;

  if (!title) return res.status(400).json({ message: 'Title is required.' });

  // Auto-compute window for holiday ads
  if (type === 'holiday' && holiday_date) {
    const window = computeHolidayWindow(holiday_date);
    show_from = window.show_from;
    show_until = window.show_until;
  }

  if (!show_from || !show_until) {
    return res.status(400).json({ message: 'show_from and show_until are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO ads
        (title, type, holiday_name, holiday_date, show_from, show_until,
         link_url, duration_sec, sort_order, is_active, company_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, type || 'general', holiday_name || null, holiday_date || null,
        show_from, show_until, link_url || null,
        duration_sec || 15, sort_order || 0, is_active ?? 1, company_name || null,
      ]
    );
    const [[ad]] = await db.query('SELECT * FROM ads WHERE id = ?', [result.insertId]);
    res.status(201).json(formatAd(ad));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/ads/:id (update info)
router.put('/:id', auth, async (req, res) => {
  let {
    title, type, holiday_name, holiday_date,
    show_from, show_until, link_url,
    duration_sec, sort_order, is_active, company_name,
  } = req.body;

  if (type === 'holiday' && holiday_date) {
    const window = computeHolidayWindow(holiday_date);
    show_from = window.show_from;
    show_until = window.show_until;
  }

  try {
    await db.query(
      `UPDATE ads SET
        title = ?, type = ?, holiday_name = ?, holiday_date = ?,
        show_from = ?, show_until = ?, link_url = ?,
        duration_sec = ?, sort_order = ?, is_active = ?, company_name = ?
       WHERE id = ?`,
      [
        title, type, holiday_name || null, holiday_date || null,
        show_from, show_until, link_url || null,
        duration_sec || 15, sort_order || 0, is_active ?? 1, company_name || null,
        req.params.id,
      ]
    );
    const [[ad]] = await db.query('SELECT * FROM ads WHERE id = ?', [req.params.id]);
    res.json(formatAd(ad));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/ads/:id/image (upload ad image)
router.post('/:id/image', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  const filePath = req.file.path.replace(/\\/g, '/');

  // Delete old image if exists
  const [[ad]] = await db.query('SELECT image_path FROM ads WHERE id = ?', [req.params.id]);
  if (ad?.image_path && fs.existsSync(ad.image_path)) fs.unlinkSync(ad.image_path);

  await db.query('UPDATE ads SET image_path = ? WHERE id = ?', [filePath, req.params.id]);

  res.json({ image_url: `${BASE_URL()}/${filePath}` });
});

// DELETE /api/ads/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [[ad]] = await db.query('SELECT image_path FROM ads WHERE id = ?', [req.params.id]);
    if (ad?.image_path && fs.existsSync(ad.image_path)) fs.unlinkSync(ad.image_path);
    await db.query('DELETE FROM ads WHERE id = ?', [req.params.id]);
    res.json({ message: 'Ad deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/ads/reorder (update sort_order for rotation)
router.put('/reorder/batch', auth, async (req, res) => {
  // body: [{ id, sort_order }, ...]
  const { items } = req.body;
  try {
    await Promise.all(
      items.map(({ id, sort_order }) =>
        db.query('UPDATE ads SET sort_order = ? WHERE id = ?', [sort_order, id])
      )
    );
    res.json({ message: 'Order updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
