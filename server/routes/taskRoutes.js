// routes/taskRoutes.js — Route definitions
// Keeps route declarations thin: map HTTP method + path → validation middleware + controller.

const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const { validateCreateTask, validateUpdateTask } = require('../middlewares/validateRequest');

router.get('/',    taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post('/',   validateCreateTask, taskController.createTask);
router.patch('/:id', validateUpdateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
