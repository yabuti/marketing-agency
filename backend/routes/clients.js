const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const { translate } = require('../services/translator');

const BASE_URL = () => `http://localhost:${process.env.PORT || 5000}`;

// Helper: get client with images and videos
async function getClientFull(id) {
  const [[client]] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
  if (!client) return null;

  const [images] = await db.query(
    'SELECT * FROM client_media WHERE client_id = ? AND type = "image" ORDER BY sort_order ASC',
    [id]
  );
  const [videos] = await db.query(
    'SELECT * FROM client_media WHERE client_id = ? AND type = "video" ORDER BY sort_order ASC',
    [id]
  );

  // Fetch promotion paths with their media
  const promotionPaths = await getPathsFull(id);

  return {
    ...client,
    images: images.map((m) => ({
      id: m.id,
      url: `${BASE_URL()}/${m.file_path}`,
      description: m.description,
    })),
    videos: videos.map((m) => ({
      id: m.id,
      url: `${BASE_URL()}/${m.file_path}`,
      description: m.description,
    })),
    promotionPaths,
  };
}

// Auto-translate client text fields in background
async function translateClient(clientId, name, category, description, full_description) {
  try {
    const [cat_am, cat_or, desc_am, desc_or, fdesc_am, fdesc_or] = await Promise.all([
      translate(category, 'am'),
      translate(category, 'om'),
      translate(description || '', 'am'),
      translate(description || '', 'om'),
      translate(full_description || '', 'am'),
      translate(full_description || '', 'om'),
    ]);
    await db.query(
      `UPDATE clients SET
        category_am=?, category_or=?,
        description_am=?, description_or=?,
        full_description_am=?, full_description_or=?
       WHERE id=?`,
      [cat_am, cat_or, desc_am, desc_or, fdesc_am, fdesc_or, clientId]
    );
    console.log(`[Translator] Client #${clientId} translated`);
  } catch (err) {
    console.error('[Translator] Client translation failed:', err.message);
  }
}

// ─── PUBLIC ROUTES ───────────────────────────────────────────────

// GET /api/clients
router.get('/', async (req, res) => {
  try {
    const [clients] = await db.query(
      'SELECT * FROM clients WHERE is_active = 1 ORDER BY created_at DESC'
    );

    const result = await Promise.all(clients.map((c) => getClientFull(c.id)));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── ADMIN: Stats for dashboard ───────────────────────────────
// GET /api/clients/admin/stats
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const [[pathRow]] = await db.query('SELECT COUNT(*) AS totalPaths FROM client_promotion_paths');
    const [[imgRow]] = await db.query("SELECT COUNT(*) AS totalImages FROM client_path_media WHERE type = 'image'");
    const [[vidRow]] = await db.query("SELECT COUNT(*) AS totalVideos FROM client_path_media WHERE type = 'video'");
    res.json({
      totalPaths: pathRow.totalPaths,
      totalImages: imgRow.totalImages,
      totalVideos: vidRow.totalVideos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── ADMIN: Analytics — filter clients by location/date ───────
// GET /api/clients/admin/analytics?location=&date=&month=&year=
router.get('/admin/analytics', auth, async (req, res) => {
  try {
    const { location, date, month, year } = req.query;
    let where = [];
    let params = [];

    if (location) {
      where.push('location = ?');
      params.push(location);
    }
    if (date) {
      where.push('DATE(created_at) = ?');
      params.push(date);
    } else if (month && year) {
      where.push('MONTH(created_at) = ? AND YEAR(created_at) = ?');
      params.push(parseInt(month), parseInt(year));
    } else if (month) {
      where.push('MONTH(created_at) = ?');
      params.push(parseInt(month));
    } else if (year) {
      where.push('YEAR(created_at) = ?');
      params.push(parseInt(year));
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [clients] = await db.query(
      `SELECT id, name, location, category, created_at FROM clients ${whereClause} ORDER BY created_at DESC`,
      params
    );
    res.json({ count: clients.length, clients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const client = await getClientFull(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found.' });
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────

// POST /api/clients (create)
router.post('/', auth, async (req, res) => {
  const {
    name, category, business_type, icon, description, full_description,
    established, location, license_number, phone,
    tin_number, business_license_number, website,
    facebook, instagram, tiktok, telegram,
    followers, growth, engagement,
  } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: 'Name and category are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO clients 
        (name, category, business_type, icon, description, full_description, established, location,
         license_number, phone, tin_number, business_license_number, website,
         facebook, instagram, tiktok, telegram,
         followers, growth, engagement, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name, category, business_type || null, icon || '🏢', description, full_description,
        established, location, license_number, phone,
        tin_number, business_license_number, website,
        facebook || null, instagram || null, tiktok || null, telegram || null,
        followers || '0', growth || '0%', engagement || '0%',
      ]
    );

    const client = await getClientFull(result.insertId);
    res.status(201).json(client);

    // Translate in background
    translateClient(result.insertId, name, category, description, full_description);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/clients/:id (update info)
router.put('/:id', auth, async (req, res) => {
  const {
    name, category, business_type, icon, description, full_description,
    established, location, license_number, phone,
    tin_number, business_license_number, website,
    facebook, instagram, tiktok, telegram,
    followers, growth, engagement, is_active,
  } = req.body;

  try {
    await db.query(
      `UPDATE clients SET
        name = ?, category = ?, business_type = ?, icon = ?, description = ?, full_description = ?,
        established = ?, location = ?, license_number = ?, phone = ?,
        tin_number = ?, business_license_number = ?, website = ?,
        facebook = ?, instagram = ?, tiktok = ?, telegram = ?,
        followers = ?, growth = ?, engagement = ?, is_active = ?
       WHERE id = ?`,
      [
        name, category, business_type || null, icon, description, full_description,
        established, location, license_number, phone,
        tin_number, business_license_number, website,
        facebook || null, instagram || null, tiktok || null, telegram || null,
        followers, growth, engagement, is_active ?? 1,
        req.params.id,
      ]
    );

    const client = await getClientFull(req.params.id);
    res.json(client);

    // Re-translate in background when text changes
    translateClient(req.params.id, name, category, description, full_description);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    // Delete associated media files
    const [media] = await db.query('SELECT file_path FROM client_media WHERE client_id = ?', [req.params.id]);
    media.forEach((m) => {
      if (fs.existsSync(m.file_path)) fs.unlinkSync(m.file_path);
    });

    await db.query('DELETE FROM client_media WHERE client_id = ?', [req.params.id]);
    await db.query('DELETE FROM clients WHERE id = ?', [req.params.id]);

    res.json({ message: 'Client deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/clients/:id/media (upload image or video)
router.post(
  '/:id/media',
  auth,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const { description, sort_order } = req.body;
    const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    const filePath = req.file.path.replace(/\\/g, '/');

    try {
      const [result] = await db.query(
        'INSERT INTO client_media (client_id, type, file_path, description, sort_order) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, type, filePath, description || '', sort_order || 0]
      );

      res.status(201).json({
        id: result.insertId,
        type,
        url: `${BASE_URL()}/${filePath}`,
        description: description || '',
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// DELETE /api/clients/:id/media/:mediaId
router.delete('/:id/media/:mediaId', auth, async (req, res) => {
  try {
    const [[media]] = await db.query(
      'SELECT * FROM client_media WHERE id = ? AND client_id = ?',
      [req.params.mediaId, req.params.id]
    );

    if (!media) return res.status(404).json({ message: 'Media not found.' });

    if (fs.existsSync(media.file_path)) fs.unlinkSync(media.file_path);
    await db.query('DELETE FROM client_media WHERE id = ?', [req.params.mediaId]);

    res.json({ message: 'Media deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/clients/admin/all (admin sees all including inactive)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const [clients] = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
    const result = await Promise.all(clients.map((c) => getClientFull(c.id)));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PATH CRUD ────────────────────────────────────────────────

// Helper: get all paths for a client with their media
async function getPathsFull(clientId) {
  const [paths] = await db.query(
    'SELECT * FROM client_promotion_paths WHERE client_id = ? ORDER BY path_date DESC, created_at DESC',
    [clientId]
  );
  return Promise.all(paths.map(async (p) => {
    const [images] = await db.query(
      "SELECT * FROM client_path_media WHERE path_id = ? AND type = 'image' ORDER BY sort_order ASC",
      [p.id]
    );
    const [videos] = await db.query(
      "SELECT * FROM client_path_media WHERE path_id = ? AND type = 'video' ORDER BY sort_order ASC",
      [p.id]
    );
    return {
      ...p,
      images: images.map(m => ({ id: m.id, url: `${BASE_URL()}/${m.file_path}`, description: m.description })),
      videos: videos.map(m => ({ id: m.id, url: `${BASE_URL()}/${m.file_path}`, description: m.description })),
    };
  }));
}

// GET /api/clients/:id/paths
router.get('/:id/paths', async (req, res) => {
  try {
    const paths = await getPathsFull(req.params.id);
    res.json(paths);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/clients/:id/paths
router.post('/:id/paths', auth, async (req, res) => {
  const { title, path_date } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required.' });
  try {
    const [result] = await db.query(
      'INSERT INTO client_promotion_paths (client_id, title, path_date) VALUES (?, ?, ?)',
      [req.params.id, title, path_date || null]
    );
    const [[path]] = await db.query('SELECT * FROM client_promotion_paths WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...path, images: [], videos: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/clients/:id/paths/:pathId
router.put('/:id/paths/:pathId', auth, async (req, res) => {
  const { title, path_date } = req.body;
  try {
    const [[existing]] = await db.query(
      'SELECT * FROM client_promotion_paths WHERE id = ? AND client_id = ?',
      [req.params.pathId, req.params.id]
    );
    if (!existing) return res.status(404).json({ message: 'Path not found.' });
    await db.query(
      'UPDATE client_promotion_paths SET title = ?, path_date = ? WHERE id = ?',
      [title ?? existing.title, path_date ?? existing.path_date, req.params.pathId]
    );
    const [[updated]] = await db.query('SELECT * FROM client_promotion_paths WHERE id = ?', [req.params.pathId]);
    const paths = await getPathsFull(req.params.id);
    const full = paths.find(p => p.id === updated.id);
    res.json(full || updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/clients/:id/paths/:pathId
router.delete('/:id/paths/:pathId', auth, async (req, res) => {
  try {
    const [[path]] = await db.query(
      'SELECT * FROM client_promotion_paths WHERE id = ? AND client_id = ?',
      [req.params.pathId, req.params.id]
    );
    if (!path) return res.status(404).json({ message: 'Path not found.' });

    // Delete media files from disk
    const [media] = await db.query('SELECT file_path FROM client_path_media WHERE path_id = ?', [req.params.pathId]);
    media.forEach(m => { if (fs.existsSync(m.file_path)) fs.unlinkSync(m.file_path); });

    await db.query('DELETE FROM client_promotion_paths WHERE id = ?', [req.params.pathId]);
    res.json({ message: 'Path deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PATH MEDIA ───────────────────────────────────────────────

// POST /api/clients/:id/paths/:pathId/media
router.post('/:id/paths/:pathId/media', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
  const filePath = req.file.path.replace(/\\/g, '/');
  const { description, sort_order } = req.body;

  try {
    // Enforce 5-item limit per type per path
    const [[countRow]] = await db.query(
      'SELECT COUNT(*) AS cnt FROM client_path_media WHERE path_id = ? AND type = ?',
      [req.params.pathId, type]
    );
    if (countRow.cnt >= 5) {
      fs.existsSync(filePath) && fs.unlinkSync(filePath);
      return res.status(400).json({
        message: type === 'image' ? 'Maximum 5 images per path reached.' : 'Maximum 5 videos per path reached.',
      });
    }

    const [result] = await db.query(
      'INSERT INTO client_path_media (path_id, type, file_path, description, sort_order) VALUES (?, ?, ?, ?, ?)',
      [req.params.pathId, type, filePath, description || '', sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, type, url: `${BASE_URL()}/${filePath}`, description: description || '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/clients/:id/paths/:pathId/media/:mediaId
router.delete('/:id/paths/:pathId/media/:mediaId', auth, async (req, res) => {
  try {
    const [[media]] = await db.query(
      'SELECT * FROM client_path_media WHERE id = ? AND path_id = ?',
      [req.params.mediaId, req.params.pathId]
    );
    if (!media) return res.status(404).json({ message: 'Media not found.' });
    if (fs.existsSync(media.file_path)) fs.unlinkSync(media.file_path);
    await db.query('DELETE FROM client_path_media WHERE id = ?', [req.params.mediaId]);
    res.json({ message: 'Media deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
