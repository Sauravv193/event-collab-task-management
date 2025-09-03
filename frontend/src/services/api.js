import axios from 'axios';

// The base URL will now come from the Vercel environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
