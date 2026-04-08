// src/components/TaskList.js
// Renders the list of tasks or an empty state message.

import TaskItem from './TaskItem';

export default function TaskList({ tasks, onStatusChange, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📋</span>
        <p>No tasks found. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
