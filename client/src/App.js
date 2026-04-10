import { useState, useEffect, useCallback } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import * as api from './services/api';
import './styles.css';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Done', value: 'done' },
];

export default function App() {
  const [tasks, setTasks]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [statusFilter, setFilter] = useState('');
  const [loading, setLoading]     = useState(false);
  const [formLoading, setFL]      = useState(false);
  const [error, setError]         = useState('');

  const LIMIT = 10;

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.fetchTasks({
        status: statusFilter || undefined,
        page,
        limit: LIMIT,
      });
      setTasks(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Reset to page 1 whenever filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);
  //create task
  async function handleCreate(payload) {
    setFL(true);
    try {
      const res = await api.createTask(payload);
      // Optimistic: prepend to list if it matches current filter
      if (!statusFilter || statusFilter === res.data.status) {
        setTasks((prev) => [res.data, ...prev]);
        setTotal((t) => t + 1);
      }
    } finally {
      setFL(false);
    }
  }
  //update tasks
  async function handleStatusChange(id, newStatus) {
    // Optimistic update — apply immediately, rollback on error
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    try {
      await api.updateTask(id, { status: newStatus });
      // If a filter is active and the task no longer matches, remove it from view
      if (statusFilter && statusFilter !== newStatus) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setTotal((t) => t - 1);
      }
    } catch (err) {
      setError(err.message);
      loadTasks(); // rollback by re-fetching
    }
  }
  //delete taks
  async function handleDelete(id) {
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTotal((t) => t - 1);
    try {
      await api.deleteTask(id);
    } catch (err) {
      setError(err.message);
      loadTasks(); // rollback
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1>Task Manager</h1>
          <p className="subtitle">{total} task{total !== 1 ? 's' : ''} total</p>
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <TaskForm onSubmit={handleCreate} loading={formLoading} />
        </aside>

        <section className="content">
          {/* Filter bar */}
          <div className="filter-bar">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-btn ${statusFilter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
              <span>Loading tasks…</span>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn btn-ghost"
              >
                ← Prev
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-ghost"
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
