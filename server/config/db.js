// config/db.js — PostgreSQL connection pool
// Uses a single shared Pool instance to avoid connection exhaustion.
// connectDB() is called once at startup to verify connectivity and
// initialise the schema (idempotent CREATE TABLE IF NOT EXISTS).

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Keep SSL for hosted DBs (e.g. Render, Railway); disabled locally by default.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

/**
 * Verify the connection and create the tasks table if it does not exist.
 * Design notes:
 *  - status is constrained to a small enum set via CHECK.
 *  - due_date is nullable so tasks without a deadline are valid.
 *  - updated_at is updated by an application-level SET rather than a DB trigger
 *    to keep the schema portable (no PL/pgSQL required).
 */
async function connectDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          SERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        description TEXT,
        status      TEXT NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo', 'in-progress', 'done')),
        due_date    TIMESTAMP,
        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅  Database connected & schema ready');
  } finally {
    client.release();
  }
}

module.exports = { pool, connectDB };
