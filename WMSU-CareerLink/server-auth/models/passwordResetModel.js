import pool from '../config/db.js';

export async function createResetToken(userId, tokenHash, ttlMinutes) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Only the newest link works.
    await client.query('DELETE FROM password_resets WHERE user_id = $1 AND used_at IS NULL', [userId]);
    await client.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)`,
      [userId, tokenHash, String(ttlMinutes)]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Atomically consumes a valid token and sets the new password.
 * Returns true on success, false if the token is unknown, used or expired.
 */
export async function resetPasswordWithToken(tokenHash, newPasswordHash) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // The UPDATE ... WHERE used_at IS NULL makes the token single-use even under concurrency.
    const used = await client.query(
      `UPDATE password_resets
          SET used_at = NOW()
        WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
        RETURNING user_id`,
      [tokenHash]
    );
    if (used.rowCount === 0) {
      await client.query('ROLLBACK');
      return false;
    }
    const userId = used.rows[0].user_id;

    await client.query(
      'UPDATE users SET password_hash = $2, password_changed_at = NOW() WHERE user_id = $1',
      [userId, newPasswordHash]
    );
    await client.query('DELETE FROM password_resets WHERE user_id = $1 AND used_at IS NULL', [userId]);

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
