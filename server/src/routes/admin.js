import express from 'express';
import slugify from 'slugify';
import { Client, ContactMessage } from '../models/index.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === (process.env.ADMIN_USERNAME || 'admin') && 
      password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    req.session.adminLoggedIn = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

router.post('/logout', (req, res) => {
  req.session.adminLoggedIn = false;
  res.json({ success: true });
});

router.get('/check', (req, res) => {
  res.json({ authenticated: !!req.session.adminLoggedIn });
});

router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalClients = await Client.count();
    const totalMessages = await ContactMessage.count();
    const newMessages = await ContactMessage.count({ where: { status: 'new' } });
    const recentMessages = await ContactMessage.findAll({ order: [['created_at', 'DESC']], limit: 5 });
    res.json({ totalClients, totalMessages, newMessages, recentMessages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Messages
router.get('/messages', adminAuth, async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/messages/:id', adminAuth, async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: 'Not found' });
    if (message.status === 'new') {
      await message.update({ status: 'read' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/messages/:id', adminAuth, async (req, res) => {
  try {
    await ContactMessage.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clients
router.get('/clients', adminAuth, async (req, res) => {
  try {
    const clients = await Client.findAll({ order: [['created_at', 'DESC']] });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/clients', adminAuth, async (req, res) => {
  try {
    const data = { ...req.body, slug: slugify(req.body.name, { lower: true }) };
    const client = await Client.create(data);
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/clients/:id', adminAuth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/clients/:id', adminAuth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Not found' });
    const data = { ...req.body, slug: slugify(req.body.name, { lower: true }) };
    await client.update(data);
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/clients/:id', adminAuth, async (req, res) => {
  try {
    await Client.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
// News Management
router.get('/news', adminAuth, async (req, res) => {
  try {
    // Mock news data for now - replace with actual database calls
    const news = [
      {
        id: 1,
        title: 'Ethiopia Launches New Digital Payment System',
        title_am: 'ኢትዮጵያ አዲስ ዲጂታል የክፍያ ስርዓት ጀመረች',
        title_or: 'Itoophiyaan Sirna Kaffaltii Dijitaalaa Haaraa Jalqabde',
        content: 'The National Bank of Ethiopia has launched a revolutionary digital payment system...',
        content_am: 'የኢትዮጵያ ብሔራዊ ባንክ አዲስ ዲጂታል የክፍያ ስርዓት ጀምሯል...',
        content_or: 'Baankiin Biyyaalessaa Itoophiyaa sirna kaffaltii dijitaalaa haaraa jalqabe...',
        category: 'Technology',
        status: 'published',
        images: [
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
          'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
        ],
        date: '2026-02-15'
      }
    ];
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/news', adminAuth, async (req, res) => {
  try {
    // Mock creation - replace with actual database calls
    const news = { id: Date.now(), ...req.body, date: new Date().toISOString().split('T')[0] };
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/news/:id', adminAuth, async (req, res) => {
  try {
    // Mock data - replace with actual database calls
    const news = {
      id: req.params.id,
      title: 'Ethiopia Launches New Digital Payment System',
      title_am: 'ኢትዮጵያ አዲስ ዲጂታል የክፍያ ስርዓት ጀመረች',
      title_or: 'Itoophiyaan Sirna Kaffaltii Dijitaalaa Haaraa Jalqabde',
      content: 'The National Bank of Ethiopia has launched a revolutionary digital payment system...',
      content_am: 'የኢትዮጵያ ብሔራዊ ባንክ አዲስ ዲጂታል የክፍያ ስርዓት ጀምሯል...',
      content_or: 'Baankiin Biyyaalessaa Itoophiyaa sirna kaffaltii dijitaalaa haaraa jalqabe...',
      category: 'Technology',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
      ],
      date: '2026-02-15'
    };
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/news/:id', adminAuth, async (req, res) => {
  try {
    // Mock update - replace with actual database calls
    const news = { id: req.params.id, ...req.body };
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/news/:id/status', adminAuth, async (req, res) => {
  try {
    // Mock status update - replace with actual database calls
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/news/:id', adminAuth, async (req, res) => {
  try {
    // Mock deletion - replace with actual database calls
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Client Media Management
router.put('/clients/:id/media', adminAuth, async (req, res) => {
  try {
    const { images, videos } = req.body;
    // Mock update - replace with actual database calls
    // In real implementation, update the client record with new images and videos
    res.json({ success: true, images, videos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});