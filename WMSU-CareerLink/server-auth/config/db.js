import pg from 'pg';
import { env } from './env.js';

const ssl = env.DB_SSL ? true : undefined;

const pool = new pg.Pool(
  env.DATABASE_URL
    ? { connectionString: env.DATABASE_URL, ssl }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        ssl,
      }
);

// An idle client erroring should be logged, not crash the whole API.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err.message);
});

export default pool;
