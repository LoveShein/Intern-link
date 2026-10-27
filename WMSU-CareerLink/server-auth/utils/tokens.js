import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: String(user.user_id),
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
}

export const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

/** Random single-use token. Only the hash is stored in the database. */
export function generateResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: hashToken(raw) };
}
