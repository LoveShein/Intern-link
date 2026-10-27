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
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wmsu_careerlink',
  port: process.env.DB_PORT || 5432,
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Helper to determine which table to query based on role
function getTableName(role) {
  if (role === 'Employer') return 'employers';
  if (role === 'Admin') return 'admins';
  return 'students'; // default
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
  const { job } = req.body;
  const payload = job || req.body;

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

// ==========================================
// AUTHENTICATION APIs (Separated Tables)
// ==========================================

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

    if (!user) {
      return res.status(401).json({ message: `${targetRole} account not found.` });
    }

    if (user.password !== String(password).trim()) {
      return res.status(401).json({ message: 'Password is invalid.' });
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

  // Admins cannot self-register here
  if (targetRole === 'Admin') {
    return res.status(403).json({ message: 'Admin registration is restricted.' });
  }

  const tableName = getTableName(targetRole);

  try {
    const normalizedEmail = String(user.email).trim().toLowerCase();
    const checkExists = await pool.query(`SELECT id FROM ${tableName} WHERE LOWER(email) = $1`, [normalizedEmail]);
    
    if (checkExists.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const id = (user.id || Date.now()).toString();
    const status = targetRole === 'Employer' ? 'Pending' : 'Active';

    const insertQuery = `
      INSERT INTO ${tableName} (id, name, email, password, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [id, user.name, normalizedEmail, user.password, status];
    const result = await pool.query(insertQuery, values);
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

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Check across all three tables for the email
    const studentCheck = await pool.query('SELECT email FROM students WHERE LOWER(email) = $1', [normalizedEmail]);
    const employerCheck = await pool.query('SELECT email FROM employers WHERE LOWER(email) = $1', [normalizedEmail]);
    const adminCheck = await pool.query('SELECT email FROM admins WHERE LOWER(email) = $1', [normalizedEmail]);

    if (studentCheck.rows.length === 0 && employerCheck.rows.length === 0 && adminCheck.rows.length === 0) {
      return res.json({ success: true, message: 'If account exists, instructions have been sent.' });
    }

    const resetToken = Math.random().toString(36).substring(2);
    await pool.query(
      'INSERT INTO password_resets (email, token) VALUES ($1, $2)',
      [normalizedEmail, resetToken]
    );

    res.json({ success: true, message: 'Password reset instructions dispatched.' });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    res.status(500).json({ message: err.message || 'Server error processing request.' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`WMSU CareerLink Multi-Table PostgreSQL backend running on http://localhost:${PORT}`);
});