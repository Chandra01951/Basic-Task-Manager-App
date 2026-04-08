// src/services/api.js — Centralised API service
// All fetch calls live here; components never call fetch directly.
// BASE_URL falls back to an empty string so CRA's proxy handles dev requests.

const BASE_URL = (process.env.REACT_APP_API_URL || '') + '/api';

/**
 * Generic request helper.
 * Throws an Error with the server's error message on non-2xx responses.
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

// ─── Task endpoints ────────────────────────────────────────────────────────────

/**
 * @param {object} params - { status?, page?, limit? }
 */
export function fetchTasks(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString();
  return request(`/tasks${qs ? `?${qs}` : ''}`);
}

export function fetchTask(id) {
  return request(`/tasks/${id}`);
}

/**
 * @param {{ title: string, description?: string, status?: string, due_date?: string }} body
 */
export function createTask(body) {
  return request('/tasks', { method: 'POST', body: JSON.stringify(body) });
}

/**
 * @param {number} id
 * @param {object} body - Partial task fields
 */
export function updateTask(id, body) {
  return request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}
