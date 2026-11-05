import axios from 'axios';

// Main application API: event/task resources live under /api/v1.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication endpoints are currently mounted at /api/auth (not /api/v1/auth).
const authBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '/api');
export const authApi = axios.create({
  baseURL: authBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
