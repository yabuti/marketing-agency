const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const { notifyContact } = require('../services/mailer');

// POST /api/contact  (public)
router.post('/', async (req, res) => {
  const {
    full_name, email, phone, business_type,
    company_name, tin_number, elmis_registration,
    business_license, message,
  } = req.body;

  if (!full_name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required.' });
  }

  try {
    await db.query(
      `INSERT INTO contact_submissions
        (full_name, email, phone, business_type, company_name, tin_number,
         elmis_registration, business_license, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone, business_type, company_name,
       tin_number, elmis_registration, business_license, message]
    );

    // Fire-and-forget email — don't block the response
    notifyContact({ full_name, email, phone, business_type, company_name,
                    tin_number, elmis_registration, business_license, message });

    res.json({ message: 'Submission received. We will contact you soon.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/contact  (admin)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM contact_submissions ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/contact/:id/status  (admin)
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/contact/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM contact_submissions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
