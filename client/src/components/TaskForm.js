// src/components/TaskForm.js
// Controlled form for creating a new task.
// Calls onSubmit with the payload; parent owns the actual API call.

import { useState } from 'react';

const INITIAL = { title: '', description: '', status: 'todo', due_date: '' };

export default function TaskForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    const payload = { ...form };
    if (!payload.due_date) delete payload.due_date;

    try {
      await onSubmit(payload);
      setForm(INITIAL);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="form-title">New Task</h2>

      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label htmlFor="title">Title <span className="required">*</span></label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Add details (optional)"
          value={form.description}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange} disabled={loading}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="due_date">Due Date</label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            value={form.due_date}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Creating…' : '+ Add Task'}
      </button>
    </form>
  );
}
