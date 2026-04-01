const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const adminAuth = require('../middleware/auth');
const { notifyRegistration, welcomeUser, notifyProfileUpdate, notifyUserActivated } = require('../services/mailer');

// ─── User JWT middleware ───────────────────────────────────────
function userAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

// ─── PUBLIC: Register ──────────────────────────────────────────
// POST /api/users/register
router.post('/register', async (req, res) => {
  const {
    full_name, email, password,
    phone, company_name, business_type,
    tin_number, elmis_registration,
    business_license_number, location, website,
  } = req.body;

  if (!full_name || !phone || !password) {
    return res.status(400).json({ message: 'Name, phone and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const [existingPhone] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existingPhone.length > 0) {
      return res.status(409).json({ message: 'Phone number already registered.' });
    }
    if (email) {
      const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        return res.status(409).json({ message: 'Email already registered.' });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO users
        (full_name, email, password, phone, company_name, business_type,
         tin_number, elmis_registration, business_license_number, location, website)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email || null, hashed, phone, company_name, business_type,
       tin_number, elmis_registration, business_license_number, location, website]
    );

    await db.query('INSERT INTO user_profiles (user_id) VALUES (?)', [result.insertId]);

    const token = jwt.sign(
      { id: result.insertId, phone, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    notifyRegistration({ full_name, email, phone, company_name, business_type,
                         tin_number, elmis_registration, business_license_number, location, website });
    if (email) welcomeUser({ full_name, email });

    res.status(201).json({
      token,
      user: { id: result.insertId, full_name, email, phone, company_name, status: 'pending' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PUBLIC: Login ─────────────────────────────────────────────
// POST /api/users/login
router.post('/login', async (req, res) => {
  const { phone, email, password } = req.body;
  const identifier = phone || email; // accept either phone or email

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Phone/email and password are required.' });
  }

  try {
    // Try matching by phone first, then by email
    let rows;
    if (phone) {
      [rows] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    } else {
      [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    }

    // If not found by phone, try email as fallback (handles cases where user typed email in phone field)
    if (rows.length === 0 && phone) {
      [rows] = await db.query('SELECT * FROM users WHERE email = ?', [phone]);
    }

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id, full_name: user.full_name, email: user.email,
        phone: user.phone, company_name: user.company_name, status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PROTECTED USER: Get own profile ──────────────────────────
// GET /api/users/me
router.get('/me', userAuth, async (req, res) => {
  try {
    const [[user]] = await db.query(
      `SELECT u.*, p.bio, p.instagram, p.tiktok, p.telegram, p.facebook,
              p.employees, p.established, p.services_needed, p.notes
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PROTECTED USER: Update own profile ───────────────────────
// PUT /api/users/me
router.put('/me', userAuth, async (req, res) => {
  const {
    full_name, phone, company_name, business_type,
    tin_number, elmis_registration, business_license_number,
    location, website,
    // profile extras
    bio, instagram, tiktok, telegram, facebook,
    employees, established, services_needed, notes,
  } = req.body;

  try {
    await db.query(
      `UPDATE users SET
        full_name = ?, phone = ?, company_name = ?, business_type = ?,
        tin_number = ?, elmis_registration = ?, business_license_number = ?,
        location = ?, website = ?
       WHERE id = ?`,
      [full_name, phone, company_name, business_type,
       tin_number, elmis_registration, business_license_number,
       location, website, req.user.id]
    );

    await db.query(
      `INSERT INTO user_profiles
        (user_id, bio, instagram, tiktok, telegram, facebook, employees, established, services_needed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        bio = VALUES(bio), instagram = VALUES(instagram), tiktok = VALUES(tiktok),
        telegram = VALUES(telegram), facebook = VALUES(facebook),
        employees = VALUES(employees), established = VALUES(established),
        services_needed = VALUES(services_needed), notes = VALUES(notes)`,
      [req.user.id, bio, instagram, tiktok, telegram, facebook,
       employees, established, services_needed, notes]
    );

    // Notify admin of profile update
    notifyProfileUpdate({ full_name, email: req.user.email, phone, company_name,
                          business_type, tin_number, business_license_number });

    res.json({ message: 'Profile updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PROTECTED USER: Change password ──────────────────────────
// POST /api/users/change-password
router.post('/change-password', userAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }
  try {
    const [[user]] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Password changed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── ADMIN: Get all users ──────────────────────────────────────
// GET /api/users
router.get('/', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.company_name, u.business_type,
              u.tin_number, u.elmis_registration, u.business_license_number,
              u.location, u.website, u.status, u.created_at, u.updated_at,
              p.bio, p.instagram, p.tiktok, p.telegram, p.facebook,
              p.employees, p.established, p.services_needed, p.notes
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── ADMIN: Get single user ────────────────────────────────────
// GET /api/users/:id
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const [[user]] = await db.query(
      `SELECT u.*, p.bio, p.instagram, p.tiktok, p.telegram, p.facebook,
              p.employees, p.established, p.services_needed, p.notes
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.params.id]
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── ADMIN: Update user status ─────────────────────────────────
// PUT /api/users/:id/status
router.put('/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body; // 'pending', 'active', 'suspended'
  try {
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);

    // Send SMS + email notification when account is activated
    if (status === 'active') {
      const [[user]] = await db.query('SELECT full_name, email, phone FROM users WHERE id = ?', [req.params.id]);
      if (user) notifyUserActivated(user); // fire-and-forget
    }

    res.json({ message: 'Status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── ADMIN: Delete user ────────────────────────────────────────
// DELETE /api/users/:id
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
