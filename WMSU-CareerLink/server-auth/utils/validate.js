import { HttpError } from './HttpError.js';

export const ROLES = ['Student', 'Employer', 'Admin'];
export const SELF_REGISTER_ROLES = ['Student', 'Employer'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;
// bcrypt only uses the first 72 bytes; reject longer input instead of silently truncating.
export const PASSWORD_MAX_BYTES = 72;

export const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

export const normalizeEmail = (value) => cleanString(value).toLowerCase();

export function requireEmail(value) {
  const email = normalizeEmail(value);
  if (!email) throw new HttpError(400, 'Email is required.');
  if (email.length > 150 || !EMAIL_RE.test(email)) {
    throw new HttpError(400, 'Enter a valid email address.');
  }
  return email;
}

export function requireName(value) {
  const name = cleanString(value).replace(/\s+/g, ' ');
  if (!name) throw new HttpError(400, 'Name is required.');
  if (name.length < 2) throw new HttpError(400, 'Name must be at least 2 characters.');
  if (name.length > 120) throw new HttpError(400, 'Name must be 120 characters or fewer.');
  return name;
}

export function requireNewPassword(value) {
  if (typeof value !== 'string' || !value) throw new HttpError(400, 'Password is required.');
  if (value.length < PASSWORD_MIN) {
    throw new HttpError(400, `Password must be at least ${PASSWORD_MIN} characters.`);
  }
  if (Buffer.byteLength(value, 'utf8') > PASSWORD_MAX_BYTES) {
    throw new HttpError(400, 'Password is too long (maximum 72 bytes).');
  }
  return value;
}
