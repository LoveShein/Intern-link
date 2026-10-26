import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ==========================================
// 1. REGISTER USER
// POST /api/auth/register
// ==========================================
export const registerUser = async (req, res) => {
  const { name, email, role, courseId } = req.body;
  const password = req.body.password;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // Validate allowed role
  const allowedRoles = ['Student', 'Employer'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role selection.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if user exists
    const userCheck = await client.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Initial status logic: Employers default to Pending, Students to Active
    const status = role === 'Employer' ? 'Pending' : 'Active';

    // Insert User
    const userResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, full_name, email, role, status, created_at`,
      [name, email, passwordHash, role, status]
    );

    const newUser = userResult.rows[0];

    // Create linked profile based on role
    if (role === 'Student') {
      // Default course fallback or selected course_id
      const defaultCourseId = courseId || 1; 

      await client.query(
        `INSERT INTO student_profiles (user_id, course_id, year_level)
         VALUES ($1, $2, $3)`,
        [newUser.user_id, defaultCourseId, '1st Year']
      );
    } else if (role === 'Employer') {
      await client.query(
        `INSERT INTO companies (user_id, company_name, contact_email)
         VALUES ($1, $2, $3)`,
        [newUser.user_id, name, email]
      );
    }

    await client.query('COMMIT');

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.user_id,
        name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  } finally {
    client.release();
  }
};

// ==========================================
// 2. LOGIN USER
// POST /api/auth/login
// ==========================================
export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // Check optional role match from frontend
    if (role && user.role !== role) {
      return res.status(401).json({ message: `Account exists, but not as a ${role}.` });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check account status
    if (user.status === 'Rejected') {
      return res.status(403).json({ message: 'Your account has been suspended or rejected.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// ==========================================
// 3. FORGOT PASSWORD
// POST /api/auth/forgot-password
// ==========================================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const userResult = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    
    // Always return 200 for security to prevent email enumeration
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        message: 'If an account exists with that email, reset instructions have been dispatched.',
      });
    }

    // In production: generate reset token, insert to DB, and send email via Nodemailer/Resend
    return res.status(200).json({
      message: 'Password reset email sent successfully.',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ message: 'Server error processing password reset.' });
  }
};

// ==========================================
// 4. GET CURRENT USER PROFILE
// GET /api/auth/me
// ==========================================
export const getMe = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT user_id, full_name, email, role, status, created_at FROM users WHERE user_id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = userResult.rows[0];
    return res.status(200).json({
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Get User Error:', error);
    return res.status(500).json({ message: 'Server error retrieving user info.' });
  }
};