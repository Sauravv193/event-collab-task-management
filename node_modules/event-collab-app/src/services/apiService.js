import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (response?.status === 403) {
      toast.error('Access denied. You don\'t have permission for this action.');
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (response?.data?.message) {
      toast.error(response.data.message);
    } else {
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Event API methods
export const eventAPI = {
  // Get paginated events with filtering
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 0,
      size: params.size || 10,
      ...(params.category && { category: params.category }),
      ...(params.search && { search: params.search }),
    });
    return api.get(`/events?${queryParams}`);
  },
  
  getById: (id) => api.get(`/events/${id}`),
  
  create: (eventData) => api.post('/events', eventData),
  
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  
  delete: (id) => api.delete(`/events/${id}`),
  
  join: (id) => api.post(`/events/${id}/join`),
  
  leave: (id) => api.post(`/events/${id}/leave`),
  
  isMember: (id) => api.get(`/events/${id}/is-member`),
  
  getMembers: (id) => api.get(`/events/${id}/members`),
  
  removeMember: (eventId, userId) => api.delete(`/events/${eventId}/members/${userId}`),
  
  getMyEvents: () => api.get('/events/my-events'),
};

// Task API methods
export const taskAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 0,
      size: params.size || 10,
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority }),
      ...(params.eventId && { eventId: params.eventId }),
    });
    return api.get(`/tasks?${queryParams}`);
  },
  
  getById: (id) => api.get(`/tasks/${id}`),
  
  create: (taskData) => api.post('/tasks', taskData),
  
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  
  delete: (id) => api.delete(`/tasks/${id}`),
  
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  
  assign: (id, userId) => api.patch(`/tasks/${id}/assign`, { userId }),
  
  getByEvent: (eventId) => api.get(`/tasks/event/${eventId}`),
};

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/signin', credentials),
  
  register: (userData) => api.post('/auth/signup', userData),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

// User API methods
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 0,
      size: params.size || 10,
      ...(params.search && { search: params.search }),
    });
    return api.get(`/users?${queryParams}`);
  },
};

// Health check
export const healthAPI = {
  check: () => api.get('/actuator/health'),
  
  info: () => api.get('/actuator/info'),
  
  metrics: () => api.get('/actuator/metrics'),
};

export default api;