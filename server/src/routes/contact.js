import express from 'express';
import { ContactMessage } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { business_type, company, message } = req.body;
    await ContactMessage.create({
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      business_type,
      company,
      message
    });
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
