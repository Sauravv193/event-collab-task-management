import axios from 'axios';

// The base URL corresponds to the server port in your backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.replace('/v1', '') || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;