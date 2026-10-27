import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const make = ({ windowMinutes, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    skip: () => env.isTest,
  });

// Only failed sign-ins count, so normal users are never locked out by their own successes.
export const loginLimiter = make({
  windowMinutes: 15,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many sign-in attempts. Please wait 15 minutes and try again.',
});

export const registerLimiter = make({
  windowMinutes: 60,
  limit: 20,
  message: 'Too many accounts created from this network. Please try again later.',
});

export const passwordResetLimiter = make({
  windowMinutes: 15,
  limit: 5,
  message: 'Too many password reset requests. Please wait 15 minutes and try again.',
});
