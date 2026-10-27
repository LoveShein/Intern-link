import { HttpError } from '../utils/HttpError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { findById, toPublicUser } from '../models/userModel.js';

/** Requires a valid Bearer token and loads the current user into req.user. */
export async function protect(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Authentication required.');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  }

  // Re-check the database on every request so deleted/rejected users or
  // tokens issued before a password reset stop working immediately.
  const user = await findById(payload.sub);
  if (!user) throw new HttpError(401, 'Your session is no longer valid. Please sign in again.');
  if (user.status === 'Rejected') throw new HttpError(403, 'This account has been rejected or suspended.');
  if (user.password_changed_at && payload.iat < Math.floor(user.password_changed_at.getTime() / 1000)) {
    throw new HttpError(401, 'Your password was changed. Please sign in again.');
  }

  req.user = toPublicUser(user);
  next();
}

/** Use after protect(): restrictTo('Admin') or restrictTo('Admin', 'Employer'). */
export const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    throw new HttpError(403, 'You do not have permission to do that.');
  }
  next();
};
