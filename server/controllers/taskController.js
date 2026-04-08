// controllers/taskController.js — HTTP request / response layer
// Controllers call model functions, shape the response payload, and
// delegate all error propagation to the central error handler via next().
// No business logic or SQL lives here.

const taskModel = require('../models/taskModel');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/tasks
 * Supports ?status=todo|in-progress|done  and  ?page=1&limit=10
 */
async function getTasks(req, res, next) {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const { tasks, total } = await taskModel.getAllTasks({
      status,
      page: parsedPage,
      limit: parsedLimit,
    });

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tasks/:id
 */
async function getTask(req, res, next) {
  try {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) return next(ApiError.notFound(`Task with id ${req.params.id} not found.`));
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/tasks
 */
async function createTask(req, res, next) {
  try {
    const task = await taskModel.createTask(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tasks/:id
 */
async function updateTask(req, res, next) {
  try {
    const task = await taskModel.updateTask(req.params.id, req.body);
    if (!task) return next(ApiError.notFound(`Task with id ${req.params.id} not found.`));
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/tasks/:id
 */
async function deleteTask(req, res, next) {
  try {
    const task = await taskModel.deleteTask(req.params.id);
    if (!task) return next(ApiError.notFound(`Task with id ${req.params.id} not found.`));
    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
