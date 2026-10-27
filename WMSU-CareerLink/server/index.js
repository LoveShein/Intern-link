import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'database',
  port: process.env.DB_PORT || 5432,
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function getTableName(role) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  if (normalizedRole === 'employer') return 'employers';
  if (normalizedRole === 'admin') return 'admins';
  return 'students';
}

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'WMSU CareerLink Multi-Table PostgreSQL backend is running.',
    timestamp: new Date().toISOString(),
  });
});

// Jobs API
app.get('/api/jobs', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('FETCH JOBS ERROR:', err);
    res.status(500).json({ message: 'Database error fetching jobs.' });
  }
});

app.post('/api/jobs', async (req, res) => {
  const payload = req.body;
  if (!payload || !payload.title || !payload.company) {
    return res.status(400).json({ message: 'Job title and company are required.' });
  }

  try {
    const query = `
      INSERT INTO jobs (title, company, location, type, course, slots, description, requirements, deadline, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      payload.title,
      payload.company,
      payload.location || 'Zamboanga City',
      payload.type || 'Internship',
      payload.course || 'All Courses',
      payload.slots || 1,
      payload.description || '',
      payload.requirements || '',
      payload.deadline || null,
      payload.status || 'Published'
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('CREATE JOB ERROR:', err);
    res.status(500).json({ message: 'Database error creating job.' });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    const query = `
      UPDATE jobs 
      SET title = COALESCE($1, title),
          company = COALESCE($2, company),
          location = COALESCE($3, location),
          type = COALESCE($4, type),
          course = COALESCE($5, course),
          slots = COALESCE($6, slots),
          description = COALESCE($7, description),
          requirements = COALESCE($8, requirements),
          deadline = COALESCE($9, deadline),
          status = COALESCE($10, status)
      WHERE id = $11
      RETURNING *;
    `;
    const values = [
      payload.title,
      payload.company,
      payload.location,
      payload.type,
      payload.course,
      payload.slots,
      payload.description,
      payload.requirements,
      payload.deadline,
      payload.status,
      id
    ];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('UPDATE JOB ERROR:', err);
    res.status(500).json({ message: 'Database error updating job.' });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (err) {
    console.error('DELETE JOB ERROR:', err);
    res.status(500).json({ message: 'Database error deleting job.' });
  }
});

// Applications API
app.get('/api/applications', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM applications ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('FETCH APPLICATIONS ERROR:', err);
    res.status(500).json({ message: 'Database error fetching applications.' });
  }
});

app.post('/api/applications', async (req, res) => {
  const application = req.body;
  if (!application || !application.student || !application.jobId) {
    return res.status(400).json({ message: 'Student and jobId are required.' });
  }

  try {
    const query = `
      INSERT INTO applications (id, student, job_id, job_title, company, date, status, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const id = application.id || Date.now();
    const values = [
      id,
      application.student,
      Number(application.jobId),
      application.jobTitle || 'Unknown opportunity',
      application.company || 'Unknown company',
      application.date || new Date().toISOString().slice(0, 10),
      application.status || 'Submitted',
      application.note || ''
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('SAVE APPLICATION ERROR:', err);
    res.status(500).json({ message: 'Database error saving application.' });
  }
});

app.put('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *;',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('UPDATE APPLICATION STATUS ERROR:', err);
    res.status(500).json({ message: 'Database error updating application status.' });
  }
});

// Profile Update APIs
app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, course, year, skills, bio } = req.body;

  try {
    const query = `
      UPDATE students 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          course = COALESCE($3, course),
          year = COALESCE($4, year),
          skills = COALESCE($5, skills),
          bio = COALESCE($6, bio)
      WHERE id = $7
      RETURNING id, name, email, course, year, skills, bio, status, created_at;
    `;
    const result = await pool.query(query, [name, email, course, year, skills, bio, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Student not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('UPDATE STUDENT ERROR:', err);
    res.status(500).json({ message: 'Database error updating profile.' });
  }
});

app.put('/api/employers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const query = `
      UPDATE employers 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email)
      WHERE id = $3
      RETURNING id, name, email, status, created_at;
    `;
    const result = await pool.query(query, [name, email, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Employer not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('UPDATE EMPLOYER ERROR:', err);
    res.status(500).json({ message: 'Database error updating employer profile.' });
  }
});

// Authentication APIs
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const targetRole = role || 'Student';
    const tableName = getTableName(targetRole);

    const result = await pool.query(`SELECT * FROM ${tableName} WHERE LOWER(email) = $1`, [normalizedEmail]);
    const user = result.rows[0];

    if (!user || user.password !== String(password).trim()) {
      return res.status(401).json({ message: 'Invalid credentials or account not found.' });
    }

    const { password: _, ...safeUser } = user;
    res.json({
      user: { ...safeUser, role: targetRole },
      token: `token-${targetRole.toLowerCase()}-${user.id}`,
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: err.message || 'Server login error.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const user = req.body;
  const targetRole = user.role || 'Student';

  if (!user || !user.name || !user.email || !user.password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const tableName = getTableName(targetRole);

  try {
    const normalizedEmail = String(user.email).trim().toLowerCase();
    const checkExists = await pool.query(`SELECT id FROM ${tableName} WHERE LOWER(email) = $1`, [normalizedEmail]);
    
    if (checkExists.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const id = (user.id || Date.now()).toString();
    const status = targetRole.toLowerCase() === 'employer' ? 'Pending' : 'Active';

    const insertQuery = `
      INSERT INTO ${tableName} (id, name, email, password, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [id, user.name, normalizedEmail, user.password, status]);
    const newUser = result.rows[0];

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ 
      user: { ...safeUser, role: targetRole }, 
      token: `token-${targetRole.toLowerCase()}-${newUser.id}` 
    });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    res.status(500).json({ message: err.message || 'Server registration error.' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`WMSU CareerLink Multi-Table PostgreSQL backend running on http://localhost:${PORT}`);
});

// ==========================================
// ADMIN & ANNOUNCEMENTS APIs
// ==========================================

// Get Announcements
app.get('/api/announcements', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM announcements ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('FETCH ANNOUNCEMENTS ERROR:', err);
    res.status(500).json({ message: 'Database error fetching announcements.' });
  }
});

// Create Announcement
app.post('/api/announcements', async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required.' });
  }
  try {
    const query = `
      INSERT INTO announcements (title, message, date)
      VALUES ($1, $2, CURRENT_DATE)
      RETURNING *;
    `;
    const result = await pool.query(query, [title, message]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('CREATE ANNOUNCEMENT ERROR:', err);
    res.status(500).json({ message: 'Database error creating announcement.' });
  }
});

// Delete Announcement
app.delete('/api/announcements/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    console.error('DELETE ANNOUNCEMENT ERROR:', err);
    res.status(500).json({ message: 'Database error deleting announcement.' });
  }
});

// Categories APIs
app.get('/api/categories', async (_req, res) => {
  try {
    const result = await pool.query('SELECT name FROM categories ORDER BY id ASC');
    res.json(result.rows.map(row => row.name));
  } catch (err) {
    console.error('FETCH CATEGORIES ERROR:', err);
    res.status(500).json({ message: 'Database error fetching categories.' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name required.' });
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING name;',
      [name.trim()]
    );
    res.status(201).json({ name: name.trim() });
  } catch (err) {
    console.error('ADD CATEGORY ERROR:', err);
    res.status(500).json({ message: 'Database error adding category.' });
  }
});

app.delete('/api/categories/:name', async (req, res) => {
  const { name } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE name = $1', [name]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE CATEGORY ERROR:', err);
    res.status(500).json({ message: 'Database error deleting category.' });
  }
});

// Update User Status (Admin moderation for students/employers)
app.put('/api/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, role } = req.body;
  const tableName = role === 'Employer' ? 'employers' : 'students';

  try {
    const result = await pool.query(
      `UPDATE ${tableName} SET status = $1 WHERE id = $2 RETURNING id, name, email, status;`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('UPDATE USER STATUS ERROR:', err);
    res.status(500).json({ message: 'Database error updating user status.' });
  }
});