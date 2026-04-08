// app.js — Express application setup
// Responsibilities: configure middleware, mount routes, attach error handler

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);

// Health-check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
