import express from 'express';
import { Client } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const clients = await Client.findAll({ where: { is_active: true }, order: [['created_at', 'DESC']] });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const client = await Client.findOne({ where: { slug: req.params.slug, is_active: true } });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
