import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always read server/.env, even when the server is started from the project root.
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const get = (name, fallback = '') => (process.env[name] ?? fallback).toString().trim();

const JWT_SECRET = get('JWT_SECRET');
if (JWT_SECRET.length < 32 || JWT_SECRET.toLowerCase().startsWith('change-me')) {
  throw new Error(
    'JWT_SECRET is missing, too short (min 32 characters), or still the example value.\n' +
      'Generate one with:\n' +
      '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
      'and put it in server/.env as JWT_SECRET=...'
  );
}

const NODE_ENV = get('NODE_ENV', 'development');

export const env = {
  NODE_ENV,
  isProduction: NODE_ENV === 'production',
  isTest: NODE_ENV === 'test',

  PORT: Number(get('PORT', '5001')) || 5001,

  // One or more allowed frontend origins, comma separated.
  CLIENT_URLS: get('CLIENT_URL', 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean),

  // Number of reverse-proxy hops in front of the app (0 = none). Needed for correct
  // client IPs in rate limiting when deployed behind Render/Heroku/Nginx/etc.
  TRUST_PROXY: Number(get('TRUST_PROXY', '0')) || 0,

  JWT_SECRET,
  JWT_EXPIRES_IN: get('JWT_EXPIRES_IN', '7d'),
  BCRYPT_ROUNDS: Number(get('BCRYPT_ROUNDS', '12')) || 12,
  RESET_TOKEN_TTL_MINUTES: Number(get('RESET_TOKEN_TTL_MINUTES', '60')) || 60,

  DATABASE_URL: get('DATABASE_URL'),
  DB_HOST: get('DB_HOST', 'localhost'),
  DB_PORT: Number(get('DB_PORT', '5432')) || 5432,
  DB_NAME: get('DB_NAME', 'careerlink'),
  DB_USER: get('DB_USER', 'postgres'),
  DB_PASSWORD: get('DB_PASSWORD'),
  DB_SSL: get('DB_SSL').toLowerCase() === 'true',

  SMTP_HOST: get('SMTP_HOST'),
  SMTP_PORT: Number(get('SMTP_PORT', '587')) || 587,
  SMTP_SECURE: get('SMTP_SECURE').toLowerCase() === 'true',
  SMTP_USER: get('SMTP_USER'),
  SMTP_PASS: get('SMTP_PASS'),
  MAIL_FROM: get('MAIL_FROM', 'WMSU CareerLink <no-reply@careerlink.local>'),
};
