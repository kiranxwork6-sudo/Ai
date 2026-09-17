/**
 * Centralized API helper for Gereply
 * Uses VITE_API_URL if defined (e.g. https://your-backend.vercel.app),
 * or defaults to relative paths (/api/...) for same-origin deployments.
 */
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export function apiFetch(path, options = {}) {
  const url = apiUrl(path);
  return fetch(url, {
    ...options,
    credentials: options.credentials || 'include'
  });
}

export default {
  apiUrl,
  apiFetch
};
