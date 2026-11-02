// src/controllers/taskController.js
// Controllers handle HTTP: validate input, call the model, send the response.
// They do not write SQL.
const taskModel = require('../models/taskModel');

const MAX_TITLE = 255;

// Returns an error message string, or null when the title is valid.
const titleError = (title) => {
  if (typeof title !== 'string' || title.trim() === '') return 'Title is required';
  if (title.trim().length > MAX_TITLE) return `Title must be ${MAX_TITLE} characters or fewer`;
  return null;
};

const taskController = {
  getAllTasks: async (req, res, next) => {
    try {
      const { status } = req.query; // /tasks?status=done|active
      if (status !== undefined && !['done', 'active'].includes(status)) {
        return res.status(400).json({ error: 'status must be done or active' });
      }
      res.json(await taskModel.findAll(status));
    } catch (err) {
      next(err);
    }
  },

  getTaskById: async (req, res, next) => {
    try {
      const task = await taskModel.findById(req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  createTask: async (req, res, next) => {
    try {
      const { title, completed } = req.body;
      const problem = titleError(title);
      if (problem) return res.status(400).json({ error: problem });
      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'completed must be true or false' });
      }

      const newTask = await taskModel.create({
        title: title.trim(),
        completed: completed ?? false,
      });
      res.status(201).json(newTask);
    } catch (err) {
      next(err);
    }
  },

  updateTask: async (req, res, next) => {
    try {
      const { title, completed } = req.body;
      const problem = titleError(title);
      if (problem) return res.status(400).json({ error: problem });
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'completed must be true or false' });
      }

      const task = await taskModel.update(req.params.id, { title: title.trim(), completed });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  patchTask: async (req, res, next) => {
    try {
      const { title, completed } = req.body;
      if (title === undefined && completed === undefined) {
        return res.status(400).json({ error: 'Provide title or completed to update' });
      }
      if (title !== undefined) {
        const problem = titleError(title);
        if (problem) return res.status(400).json({ error: problem });
      }
      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'completed must be true or false' });
      }

      const fields = {};
      if (title !== undefined) fields.title = title.trim();
      if (completed !== undefined) fields.completed = completed;

      const task = await taskModel.partialUpdate(req.params.id, fields);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  deleteTask: async (req, res, next) => {
    try {
      const deleted = await taskModel.remove(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Task not found' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

module.exports = taskController;
