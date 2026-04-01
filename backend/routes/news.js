const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const { translateNews } = require('../services/translator');

const BASE_URL = () => `http://localhost:${process.env.PORT || 5000}`;

async function getNewsFull(id) {
  const [[news]] = await db.query('SELECT * FROM news WHERE id = ?', [id]);
  if (!news) return null;

  const [images] = await db.query(
    'SELECT * FROM news_images WHERE news_id = ? ORDER BY sort_order ASC',
    [id]
  );

  return {
    ...news,
    images: images.map((img) => ({
      id: img.id,
      url: `${BASE_URL()}/${img.file_path}`,
      description: img.description,
    })),
  };
}

// ─── PUBLIC ROUTES ───────────────────────────────────────────────

// GET /api/news
router.get('/', async (req, res) => {
  try {
    const [newsList] = await db.query(
      'SELECT * FROM news WHERE is_published = 1 ORDER BY created_at DESC'
    );
    const result = await Promise.all(newsList.map((n) => getNewsFull(n.id)));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/news/:id
router.get('/:id', async (req, res) => {
  try {
    const news = await getNewsFull(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found.' });
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────

// GET /api/news/admin/all
router.get('/admin/all', auth, async (req, res) => {
  try {
    const [newsList] = await db.query('SELECT * FROM news ORDER BY created_at DESC');
    const result = await Promise.all(newsList.map((n) => getNewsFull(n.id)));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/news (create) — auto-translates English to Amharic + Oromo
router.post('/', auth, async (req, res) => {
  const { title, content, category, is_published, source_url } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    // Auto-translate in background — respond immediately with English, update after
    const [result] = await db.query(
      `INSERT INTO news (title, title_am, title_or, content, content_am, content_or, category, is_published, source_url)
       VALUES (?, '', '', ?, '', '', ?, ?, ?)`,
      [title, content, category || 'General', is_published ?? 1, source_url || null]
    );
    const newsId = result.insertId;

    // Respond immediately so admin doesn't wait
    const news = await getNewsFull(newsId);
    res.status(201).json(news);

    // Translate in background and update DB
    translateNews(title, content).then(async ({ title_am, title_or, content_am, content_or }) => {
      await db.query(
        'UPDATE news SET title_am=?, title_or=?, content_am=?, content_or=? WHERE id=?',
        [title_am, title_or, content_am, content_or, newsId]
      );
      console.log(`[Translator] News #${newsId} translated to AM + OR`);
    }).catch(err => console.error('[Translator] Failed:', err.message));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/news/:id — re-translates when English content changes
router.put('/:id', auth, async (req, res) => {
  const { title, content, category, is_published, source_url } = req.body;

  try {
    // Save English immediately
    await db.query(
      `UPDATE news SET title=?, content=?, category=?, is_published=?, source_url=? WHERE id=?`,
      [title, content, category, is_published ?? 1, source_url || null, req.params.id]
    );

    const news = await getNewsFull(req.params.id);
    res.json(news);

    // Re-translate in background
    translateNews(title, content).then(async ({ title_am, title_or, content_am, content_or }) => {
      await db.query(
        'UPDATE news SET title_am=?, title_or=?, content_am=?, content_or=? WHERE id=?',
        [title_am, title_or, content_am, content_or, req.params.id]
      );
      console.log(`[Translator] News #${req.params.id} re-translated`);
    }).catch(err => console.error('[Translator] Failed:', err.message));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/news/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [images] = await db.query('SELECT file_path FROM news_images WHERE news_id = ?', [req.params.id]);
    images.forEach((img) => {
      if (fs.existsSync(img.file_path)) fs.unlinkSync(img.file_path);
    });

    await db.query('DELETE FROM news_images WHERE news_id = ?', [req.params.id]);
    await db.query('DELETE FROM news WHERE id = ?', [req.params.id]);

    res.json({ message: 'News deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/news/:id/images (upload image)
router.post('/:id/images', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  const { description, sort_order } = req.body;
  const filePath = req.file.path.replace(/\\/g, '/');

  try {
    const [result] = await db.query(
      'INSERT INTO news_images (news_id, file_path, description, sort_order) VALUES (?, ?, ?, ?)',
      [req.params.id, filePath, description || '', sort_order || 0]
    );

    res.status(201).json({
      id: result.insertId,
      url: `${BASE_URL()}/${filePath}`,
      description: description || '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/news/:id/images/:imageId
router.delete('/:id/images/:imageId', auth, async (req, res) => {
  try {
    const [[img]] = await db.query(
      'SELECT * FROM news_images WHERE id = ? AND news_id = ?',
      [req.params.imageId, req.params.id]
    );

    if (!img) return res.status(404).json({ message: 'Image not found.' });

    if (fs.existsSync(img.file_path)) fs.unlinkSync(img.file_path);
    await db.query('DELETE FROM news_images WHERE id = ?', [req.params.imageId]);

    res.json({ message: 'Image deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
