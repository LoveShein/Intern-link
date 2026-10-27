import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';
import {
  ROLES,
  SELF_REGISTER_ROLES,
  cleanString,
  normalizeEmail,
  requireEmail,
  requireName,
  requireNewPassword,
} from '../utils/validate.js';
import { signAccessToken, generateResetToken, hashToken } from '../utils/tokens.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';
import * as Users from '../models/userModel.js';
import * as Resets from '../models/passwordResetModel.js';

// Compared against when an email doesn't exist so response time doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', env.BCRYPT_ROUNDS);

const UNIQUE_VIOLATION = '23505';
const FK_VIOLATION = '23503';

// POST /api/auth/register
export async function register(req, res) {
  const body = req.body ?? {};
  const name = requireName(body.name);
  const email = requireEmail(body.email);
  const password = requireNewPassword(body.password);
  const role = cleanString(body.role);

  if (!SELF_REGISTER_ROLES.includes(role)) {
    throw new HttpError(400, 'Invalid role selection.');
  }

  let courseId = null;
  if (body.courseId !== undefined && body.courseId !== null && body.courseId !== '') {
    courseId = Number(body.courseId);
    if (!Number.isInteger(courseId) || courseId < 1) throw new HttpError(400, 'Invalid course.');
  }

  if (await Users.findByEmail(email)) {
    throw new HttpError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  let user;
  try {
    user = await Users.createAccount({ name, email, passwordHash, role, courseId });
  } catch (err) {
    // Two sign-ups racing for the same email, or a course that doesn't exist.
    if (err.code === UNIQUE_VIOLATION) throw new HttpError(409, 'An account with this email already exists.');
    if (err.code === FK_VIOLATION) throw new HttpError(400, 'Invalid course.');
    throw err;
  }

  res.status(201).json({
    message: 'Account created successfully.',
    token: signAccessToken(user),
    user: Users.toPublicUser(user),
  });
}

// POST /api/auth/login
export async function login(req, res) {
  const body = req.body ?? {};
  const email = normalizeEmail(body.email);
  const password = body.password;
  const role = cleanString(body.role);

  if (!email || typeof password !== 'string' || !password) {
    throw new HttpError(400, 'Email and password are required.');
  }
  if (role && !ROLES.includes(role)) {
    throw new HttpError(400, 'Invalid role selection.');
  }

  const user = await Users.findByEmail(email);
  const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

  // Same message for "no such email" and "wrong password".
  if (!user || !passwordOk) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  // Checked only after the password is verified, so it can't be used to probe which emails exist.
  if (role && user.role !== role) {
    throw new HttpError(403, `This account is not registered as ${role}. Choose the correct portal role.`);
  }
  if (user.status === 'Rejected') {
    throw new HttpError(403, 'This account has been rejected or suspended. Please contact the WMSU administrator.');
  }

  res.json({
    message: 'Signed in successfully.',
    token: signAccessToken(user),
    user: Users.toPublicUser(user),
  });
}

// GET /api/auth/me   (protected)
export async function getMe(req, res) {
  res.json({ user: req.user });
}

// PUT /api/auth/me   (protected) – update display name and/or email
export async function updateMe(req, res) {
  const body = req.body ?? {};
  const changes = {};
  if (body.name !== undefined) changes.name = requireName(body.name);
  if (body.email !== undefined) changes.email = requireEmail(body.email);

  if (Object.keys(changes).length === 0) {
    throw new HttpError(400, 'Nothing to update.');
  }

  let updated;
  try {
    updated = await Users.updateProfile(req.user.id, changes);
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) throw new HttpError(409, 'An account with this email already exists.');
    throw err;
  }

  res.json({ message: 'Account updated.', user: Users.toPublicUser(updated) });
}

const FORGOT_MESSAGE =
  'If an account exists with that email, reset instructions have been dispatched.';

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  const email = requireEmail(req.body?.email);

  const user = await Users.findByEmail(email);
  if (user) {
    const { raw, hash } = generateResetToken();
    await Resets.createResetToken(user.user_id, hash, env.RESET_TOKEN_TTL_MINUTES);

    // Not awaited: a slow/failed mail server must not change the response (or its timing).
    sendPasswordResetEmail({ to: user.email, name: user.full_name, rawToken: raw }).catch((err) =>
      console.error('Failed to send password reset email:', err.message)
    );
  }

  // Identical response whether or not the account exists.
  res.json({ message: FORGOT_MESSAGE });
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  const body = req.body ?? {};
  const token = cleanString(body.token);
  const password = requireNewPassword(body.password);

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    throw new HttpError(400, 'This reset link is invalid or has expired.');
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const ok = await Resets.resetPasswordWithToken(hashToken(token), passwordHash);

  if (!ok) throw new HttpError(400, 'This reset link is invalid or has expired.');

  res.json({ message: 'Password updated. You can now sign in with your new password.' });
}
