import axios from 'axios';

// This will use the Vercel environment variable in production,
// but you can still set a local one for development.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
