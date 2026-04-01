require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function resetAdmin() {
  const email = 'admin@allthings.com';
  const password = 'Admin@123';
  const name = 'Admin';

  const hash = await bcrypt.hash(password, 10);

  // Delete existing and re-insert
  await db.query('DELETE FROM admins WHERE email = ?', [email]);
  await db.query(
    'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
    [name, email, hash]
  );

  console.log('✅ Admin account reset successfully!');
  console.log('   Email:    ' + email);
  console.log('   Password: ' + password);
  process.exit(0);
}

resetAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  console.error('Make sure MySQL is running and the database is imported.');
  process.exit(1);
});
