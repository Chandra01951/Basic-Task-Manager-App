// models/taskModel.js — Data-access layer (raw SQL via pg Pool)
// All database interactions live here; no business logic, no HTTP concerns.
// Parameterised queries are used throughout to prevent SQL injection.

const { pool } = require('../config/db');

/**
 * Retrieve tasks with optional status filter and pagination.
 * @param {object} options
 * @param {string|undefined} options.status  - Filter by status enum value
 * @param {number}           options.page    - 1-based page number
 * @param {number}           options.limit   - Records per page
 * @returns {{ tasks: object[], total: number }}
 */
async function getAllTasks({ status, page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const params = [];
  let whereClause = '';

  if (status) {
    params.push(status);
    whereClause = `WHERE status = $${params.length}`;
  }

  // Run count and data fetch in parallel for efficiency
  const [countResult, dataResult] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM tasks ${whereClause}`, params),
    pool.query(
      `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  return {
    tasks: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

/**
 * Retrieve a single task by primary key.
 * @param {number|string} id
 * @returns {object|null}
 */
async function getTaskById(id) {
  const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Insert a new task row.
 * @param {object} data - { title, description, status, due_date }
 * @returns {object} Newly created task row
 */
async function createTask({ title, description, status = 'todo', due_date }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, description, status, due_date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title.trim(), description || null, status, due_date || null]
  );
  return rows[0];
}

/**
 * Partially update a task; only supplied fields are changed.
 * updated_at is always refreshed to CURRENT_TIMESTAMP.
 * @param {number|string} id
 * @param {object} fields - Any combination of { title, description, status, due_date }
 * @returns {object|null} Updated row or null if not found
 */
async function updateTask(id, fields) {
  const allowed = ['title', 'description', 'status', 'due_date'];
  const setClauses = [];
  const values = [];

  allowed.forEach((key) => {
    if (fields[key] !== undefined) {
      values.push(fields[key]);
      setClauses.push(`${key} = $${values.length}`);
    }
  });

  // Always bump updated_at
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0] || null;
}

/**
 * Delete a task by primary key.
 * @param {number|string} id
 * @returns {object|null} Deleted row or null if not found
 */
async function deleteTask(id) {
  const { rows } = await pool.query(
    'DELETE FROM tasks WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] || null;
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
