// Creates the administrator account (admins cannot self-register).
// Reads ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from server/.env or the environment.
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import pool from '../config/db.js';
import { requireEmail, requireName, requireNewPassword } from '../utils/validate.js';

try {
  const name = requireName(process.env.ADMIN_NAME || 'WMSU Administrator');
  const email = requireEmail(process.env.ADMIN_EMAIL);
  const password = requireNewPassword(process.env.ADMIN_PASSWORD);

  const existing = await pool.query('SELECT role FROM users WHERE email = $1', [email]);
  if (existing.rowCount) {
    console.log(`An account for ${email} already exists (role: ${existing.rows[0].role}). Nothing changed.`);
  } else {
    const hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, status) VALUES ($1, $2, $3, 'Admin', 'Active')`,
      [name, email, hash]
    );
    console.log(`Admin account created for ${email}.`);
  }
} catch (err) {
  console.error('Could not create admin:', err.message);
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) in server/.env first.');
  process.exitCode = 1;
} finally {
  await pool.end();
}
