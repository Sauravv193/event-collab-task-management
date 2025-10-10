import api from './api';

// Corresponds to POST /api/auth/signin
export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/signin', credentials);
  return data;
};

// Corresponds to POST /api/auth/signup
export const signupUser = async (userData) => {
  const { data } = await api.post('/auth/signup', userData);
  return data;
};