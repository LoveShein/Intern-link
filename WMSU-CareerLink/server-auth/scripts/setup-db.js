// Creates the tables from shema.sql (only if they don't exist yet) and applies the auth additions.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../config/env.js';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(process.env.SCHEMA_PATH || path.join(__dirname, '../../../shema.sql'));
const additionsPath = path.join(__dirname, '../sql/auth_additions.sql');

try {
  const { rows } = await pool.query(`SELECT to_regclass('public.users') AS users`);

  if (rows[0].users) {
    console.log('Base tables already exist - skipping shema.sql.');
  } else {
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}. Set SCHEMA_PATH in server/.env to the location of shema.sql.`);
    }
    await pool.query(fs.readFileSync(schemaPath, 'utf8'));
    console.log(`Created base tables from ${schemaPath}`);
  }

  await pool.query(fs.readFileSync(additionsPath, 'utf8'));
  console.log('Applied auth additions (password_resets, password_changed_at).');
  console.log('Database is ready.');
} catch (err) {
  console.error('Database setup failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
