import app from './app.js';
import { env } from './config/env.js';
import pool from './config/db.js';

async function start() {
  try {
    const { rows } = await pool.query(
      `SELECT to_regclass('public.users') AS users, to_regclass('public.password_resets') AS resets`
    );
    if (!rows[0].users || !rows[0].resets) {
      console.error('Database tables are missing. Run:  npm run db:setup   (inside the server folder)');
      process.exit(1);
    }
  } catch (err) {
    console.error(`Cannot connect to PostgreSQL: ${err.message}`);
    console.error('Check DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD in server/.env and that PostgreSQL is running.');
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`WMSU CareerLink API running on http://localhost:${env.PORT}`);
    console.log(`Accepting browser requests from: ${env.CLIENT_URLS.join(', ')}`);
  });

  const shutdown = () => server.close(() => pool.end().then(() => process.exit(0)));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
