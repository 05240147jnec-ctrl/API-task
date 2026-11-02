// src/routes/taskRoutes.js
// Routes only map (HTTP method + URL) to a controller function.
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validateId = require('../middleware/validateId');

router.param('id', validateId);

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.patch('/:id', taskController.patchTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
