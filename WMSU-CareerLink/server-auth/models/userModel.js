import pool from '../config/db.js';

const USER_COLUMNS =
  'user_id, full_name, email, password_hash, role, status, created_at, password_changed_at';

/** The only user shape ever sent to the client (never includes the hash). */
export const toPublicUser = (row) => ({
  id: row.user_id,
  name: row.full_name,
  email: row.email,
  role: row.role,
  status: row.status,
});

export async function findByEmail(email) {
  const { rows } = await pool.query(`SELECT ${USER_COLUMNS} FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
}

export async function findById(id) {
  if (!Number.isInteger(Number(id))) return null;
  const { rows } = await pool.query(`SELECT ${USER_COLUMNS} FROM users WHERE user_id = $1`, [id]);
  return rows[0] || null;
}

/**
 * Creates the user and the matching profile row (student_profiles / companies)
 * in a single transaction so we never end up with half an account.
 */
export async function createAccount({ name, email, passwordHash, role, courseId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Employers must be approved by an admin; students are active immediately.
    const status = role === 'Employer' ? 'Pending' : 'Active';

    const { rows } = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${USER_COLUMNS}`,
      [name, email, passwordHash, role, status]
    );
    const user = rows[0];

    if (role === 'Student') {
      let course = courseId;
      if (!course) {
        // course_id is NOT NULL in the schema and the sign-up form has no course field,
        // so new students start on a placeholder course they can change later.
        await client.query(
          `INSERT INTO courses (course_name) VALUES ('Undeclared') ON CONFLICT (course_name) DO NOTHING`
        );
        const res = await client.query(`SELECT course_id FROM courses WHERE course_name = 'Undeclared'`);
        course = res.rows[0].course_id;
      }
      await client.query(
        `INSERT INTO student_profiles (user_id, course_id, year_level) VALUES ($1, $2, '1st Year')`,
        [user.user_id, course]
      );
    } else if (role === 'Employer') {
      await client.query(
        `INSERT INTO companies (user_id, company_name, contact_email) VALUES ($1, $2, $3)`,
        [user.user_id, name, email]
      );
    }

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateProfile(id, { name, email }) {
  const { rows } = await pool.query(
    `UPDATE users
        SET full_name = COALESCE($2, full_name),
            email     = COALESCE($3, email)
      WHERE user_id = $1
      RETURNING ${USER_COLUMNS}`,
    [id, name ?? null, email ?? null]
  );
  return rows[0] || null;
}
