// src/components/TaskItem.js
// Renders a single task card with inline status update and delete (with confirmation).
// Optimistic update: the status change is applied to local state immediately;
// if the API call fails, the parent re-fetches to roll back.

import { useState } from 'react';

const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export default function TaskItem({ task, onStatusChange, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setUpdating(false);
    }
  }

  function formatDate(iso) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();

  return (
    <div className={`task-card status-${task.status}`}>
      <div className="task-card-header">
        <span className={`status-badge status-badge--${task.status}`}>
          {STATUS_LABELS[task.status]}
        </span>
        {task.due_date && (
          <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            {isOverdue ? '⚠ ' : '📅 '}
            {formatDate(task.due_date)}
          </span>
        )}
      </div>

      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-card-footer">
        <select
          className="status-select"
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {!confirmDelete ? (
          <button
            className="btn btn-danger-outline"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        ) : (
          <div className="confirm-delete">
            <span>Sure?</span>
            <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
              Yes
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
              No
            </button>
          </div>
        )}
      </div>

      <p className="task-meta">
        Created {formatDate(task.created_at)}
        {task.updated_at !== task.created_at && ` · Updated ${formatDate(task.updated_at)}`}
      </p>
    </div>
  );
}
