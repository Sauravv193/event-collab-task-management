import api from './api';

// Corresponds to PUT /api/users/change-password
export const changePassword = async (passwordData) => {
  const { data } = await api.put('/users/change-password', passwordData);
  return data;
};