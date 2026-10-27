// Integration tests: need a running PostgreSQL configured in server/.env
// (run `npm run db:setup` once first). Run with:  npm test
process.env.NODE_ENV = 'test';
process.env.BCRYPT_ROUNDS = '4'; // fast hashing for tests only

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const { default: app } = await import('../app.js');
const { default: pool } = await import('../config/db.js');
const { env } = await import('../config/env.js');
const { generateResetToken } = await import('../utils/tokens.js');

let server;
let base;
const tag = crypto.randomBytes(4).toString('hex');
const email = (n) => `test-${tag}-${n}@example.com`;
const PASSWORD = 'correct-horse-9';

const call = async (method, path, { body, token, origin } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(origin && { Origin: origin }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, headers: res.headers, data: await res.json().catch(() => null) };
};

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE $1', [`test-${tag}-%`]);
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test('health check works', async () => {
  const r = await call('GET', '/api/health');
  assert.equal(r.status, 200);
});

test('register: student gets Active status, token, and a profile row', async () => {
  const r = await call('POST', '/api/auth/register', {
    body: { name: 'Test Student', email: email('student'), password: PASSWORD, role: 'Student' },
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.role, 'Student');
  assert.equal(r.data.user.status, 'Active');
  assert.ok(r.data.token);
  assert.equal(r.data.user.password_hash, undefined);
  assert.equal(r.data.user.password, undefined);

  const { rowCount } = await pool.query(
    'SELECT 1 FROM student_profiles WHERE user_id = $1',
    [r.data.user.id]
  );
  assert.equal(rowCount, 1);
});

test('register: employer is Pending and gets a company row', async () => {
  const r = await call('POST', '/api/auth/register', {
    body: { name: 'Test Company', email: email('employer'), password: PASSWORD, role: 'Employer' },
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.status, 'Pending');
  const { rowCount } = await pool.query('SELECT 1 FROM companies WHERE user_id = $1', [r.data.user.id]);
  assert.equal(rowCount, 1);
});

test('register: password is stored hashed, never in plain text', async () => {
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email('student')]);
  assert.notEqual(rows[0].password_hash, PASSWORD);
  assert.match(rows[0].password_hash, /^\$2[aby]\$/);
});

test('register: rejects duplicate email (case-insensitive), bad role, Admin role, weak password, bad email', async () => {
  const dup = await call('POST', '/api/auth/register', {
    body: { name: 'Dup', email: email('student').toUpperCase(), password: PASSWORD, role: 'Student' },
  });
  assert.equal(dup.status, 409);

  const admin = await call('POST', '/api/auth/register', {
    body: { name: 'Hacker', email: email('admin'), password: PASSWORD, role: 'Admin' },
  });
  assert.equal(admin.status, 400);

  const weak = await call('POST', '/api/auth/register', {
    body: { name: 'Weak', email: email('weak'), password: 'abc', role: 'Student' },
  });
  assert.equal(weak.status, 400);

  const badEmail = await call('POST', '/api/auth/register', {
    body: { name: 'Bad', email: 'not-an-email', password: PASSWORD, role: 'Student' },
  });
  assert.equal(badEmail.status, 400);

  const empty = await call('POST', '/api/auth/register', {});
  assert.equal(empty.status, 400);
});

test('login: success, case-insensitive email, role check', async () => {
  const ok = await call('POST', '/api/auth/login', {
    body: { email: email('student').toUpperCase(), password: PASSWORD, role: 'Student' },
  });
  assert.equal(ok.status, 200);
  assert.ok(ok.data.token);

  const wrongRole = await call('POST', '/api/auth/login', {
    body: { email: email('student'), password: PASSWORD, role: 'Employer' },
  });
  assert.equal(wrongRole.status, 403);
});

test('login: wrong password and unknown email give the same generic 401', async () => {
  const wrongPw = await call('POST', '/api/auth/login', { body: { email: email('student'), password: 'nope-nope-1' } });
  const noUser = await call('POST', '/api/auth/login', { body: { email: email('ghost'), password: 'nope-nope-1' } });
  assert.equal(wrongPw.status, 401);
  assert.equal(noUser.status, 401);
  assert.equal(wrongPw.data.message, noUser.data.message);
});

test('login: wrong password + wrong role does NOT reveal the account exists', async () => {
  const r = await call('POST', '/api/auth/login', {
    body: { email: email('student'), password: 'nope-nope-1', role: 'Employer' },
  });
  assert.equal(r.status, 401);
});

test('login: rejected accounts are blocked', async () => {
  await pool.query(`UPDATE users SET status = 'Rejected' WHERE email = $1`, [email('employer')]);
  const r = await call('POST', '/api/auth/login', { body: { email: email('employer'), password: PASSWORD } });
  assert.equal(r.status, 403);
  await pool.query(`UPDATE users SET status = 'Pending' WHERE email = $1`, [email('employer')]);
});

test('/me: requires a valid token', async () => {
  assert.equal((await call('GET', '/api/auth/me')).status, 401);
  assert.equal((await call('GET', '/api/auth/me', { token: 'garbage' })).status, 401);

  // token signed with the wrong secret
  const forged = jwt.sign({ role: 'Admin' }, 'x'.repeat(40), { subject: '1' });
  assert.equal((await call('GET', '/api/auth/me', { token: forged })).status, 401);

  // alg:none token
  const none = Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url') + '.' +
    Buffer.from('{"sub":"1","role":"Admin"}').toString('base64url') + '.';
  assert.equal((await call('GET', '/api/auth/me', { token: none })).status, 401);

  const login = await call('POST', '/api/auth/login', { body: { email: email('student'), password: PASSWORD } });
  const me = await call('GET', '/api/auth/me', { token: login.data.token });
  assert.equal(me.status, 200);
  assert.equal(me.data.user.email, email('student'));
});

test('/me: expired token is rejected', async () => {
  const { rows } = await pool.query('SELECT user_id FROM users WHERE email = $1', [email('student')]);
  const expired = jwt.sign({ role: 'Student' }, env.JWT_SECRET, { subject: String(rows[0].user_id), expiresIn: -10 });
  assert.equal((await call('GET', '/api/auth/me', { token: expired })).status, 401);
});

test('PUT /me: updates name/email, blocks duplicate email', async () => {
  const login = await call('POST', '/api/auth/login', { body: { email: email('student'), password: PASSWORD } });
  const token = login.data.token;

  const ok = await call('PUT', '/api/auth/me', { token, body: { name: 'Renamed Student' } });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.user.name, 'Renamed Student');

  const dup = await call('PUT', '/api/auth/me', { token, body: { email: email('employer') } });
  assert.equal(dup.status, 409);

  assert.equal((await call('PUT', '/api/auth/me', { token, body: {} })).status, 400);
  assert.equal((await call('PUT', '/api/auth/me', { body: { name: 'x y' } })).status, 401);
});

test('forgot-password: same response for existing and unknown email', async () => {
  const a = await call('POST', '/api/auth/forgot-password', { body: { email: email('student') } });
  const b = await call('POST', '/api/auth/forgot-password', { body: { email: email('ghost') } });
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(a.data.message, b.data.message);
  assert.equal((await call('POST', '/api/auth/forgot-password', { body: { email: 'bad' } })).status, 400);
});

test('reset-password: full flow, single use, old tokens invalidated', async () => {
  const login = await call('POST', '/api/auth/login', { body: { email: email('student'), password: PASSWORD } });
  const oldToken = login.data.token;
  const { rows } = await pool.query('SELECT user_id FROM users WHERE email = $1', [email('student')]);

  // The raw token is only ever emailed, so create one the same way the controller does.
  const { raw, hash } = generateResetToken();
  await pool.query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + interval '1 hour')`,
    [rows[0].user_id, hash]
  );

  const weak = await call('POST', '/api/auth/reset-password', { body: { token: raw, password: 'short' } });
  assert.equal(weak.status, 400);

  // make sure the second-resolution `iat` of oldToken is strictly before the reset
  await new Promise((r) => setTimeout(r, 1100));

  const NEW_PASSWORD = 'brand-new-pass-1';
  const ok = await call('POST', '/api/auth/reset-password', { body: { token: raw, password: NEW_PASSWORD } });
  assert.equal(ok.status, 200);

  const reuse = await call('POST', '/api/auth/reset-password', { body: { token: raw, password: 'another-pass-22' } });
  assert.equal(reuse.status, 400);

  assert.equal((await call('POST', '/api/auth/login', { body: { email: email('student'), password: PASSWORD } })).status, 401);
  const fresh = await call('POST', '/api/auth/login', { body: { email: email('student'), password: NEW_PASSWORD } });
  assert.equal(fresh.status, 200);

  // session issued before the reset no longer works; the new one does
  assert.equal((await call('GET', '/api/auth/me', { token: oldToken })).status, 401);
  assert.equal((await call('GET', '/api/auth/me', { token: fresh.data.token })).status, 200);
});

test('reset-password: expired and garbage tokens are rejected', async () => {
  const { rows } = await pool.query('SELECT user_id FROM users WHERE email = $1', [email('student')]);
  const { raw, hash } = generateResetToken();
  await pool.query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() - interval '1 minute')`,
    [rows[0].user_id, hash]
  );
  assert.equal((await call('POST', '/api/auth/reset-password', { body: { token: raw, password: 'valid-pass-123' } })).status, 400);
  assert.equal((await call('POST', '/api/auth/reset-password', { body: { token: 'nope', password: 'valid-pass-123' } })).status, 400);
  assert.equal((await call('POST', '/api/auth/reset-password', { body: { password: 'valid-pass-123' } })).status, 400);
});

test('SQL injection attempts are harmless', async () => {
  const r = await call('POST', '/api/auth/login', { body: { email: "' OR 1=1 --", password: "' OR '1'='1" } });
  assert.equal(r.status, 401);
  const r2 = await call('POST', '/api/auth/login', { body: { email: { $ne: null }, password: { $ne: null } } });
  assert.equal(r2.status, 400);
});

test('CORS: allowed origin gets headers, foreign origin does not', async () => {
  const good = await call('GET', '/api/health', { origin: env.CLIENT_URLS[0] });
  assert.equal(good.headers.get('access-control-allow-origin'), env.CLIENT_URLS[0]);
  const bad = await call('GET', '/api/health', { origin: 'https://evil.example' });
  assert.equal(bad.headers.get('access-control-allow-origin'), null);
});

test('malformed JSON and unknown routes return JSON errors', async () => {
  const res = await fetch(base + '/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad json',
  });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).message);
  assert.equal((await call('GET', '/api/nope')).status, 404);
});
