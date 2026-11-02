// src/models/taskModel.js
// Models contain ONLY database queries. No req, no res, no HTTP status codes.
const pool = require('../db');

// MySQL stores BOOLEAN as TINYINT (0/1). Convert so the API returns true/false.
const toTask = (row) => (row ? { ...row, completed: Boolean(row.completed) } : null);

const taskModel = {
  // status: 'active' | 'done' | undefined. Fixed SQL strings, no user text in SQL.
  findAll: async (status) => {
    let sql = 'SELECT * FROM tasks ORDER BY created_at DESC, id DESC';
    if (status === 'done') {
      sql = 'SELECT * FROM tasks WHERE completed = TRUE ORDER BY created_at DESC, id DESC';
    } else if (status === 'active') {
      sql = 'SELECT * FROM tasks WHERE completed = FALSE ORDER BY created_at DESC, id DESC';
    }
    const [rows] = await pool.query(sql);
    return rows.map(toTask);
  },

  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return toTask(rows[0]);
  },

  create: async ({ title, completed = false }) => {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      [title, completed]
    );
    return taskModel.findById(result.insertId);
  },

  update: async (id, { title, completed }) => {
    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, completed = ? WHERE id = ?',
      [title, completed, id]
    );
    if (result.affectedRows === 0) return null;
    return taskModel.findById(id);
  },

  partialUpdate: async (id, fields) => {
    const updates = [];
    const values = [];
    if (fields.title !== undefined) {
      updates.push('title = ?');
      values.push(fields.title);
    }
    if (fields.completed !== undefined) {
      updates.push('completed = ?');
      values.push(fields.completed);
    }
    if (updates.length === 0) return taskModel.findById(id);

    values.push(id);
    const [result] = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return taskModel.findById(id);
  },

  remove: async (id) => {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = taskModel;
