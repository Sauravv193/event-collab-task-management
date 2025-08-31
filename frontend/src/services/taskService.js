import api from './api';

export const getTasksByEvent = async (eventId) => {
  const { data } = await api.get(`/tasks/event/${eventId}`);
  return data;
};

// *** FIX: Updated the function to match the new backend endpoint. ***
export const createTask = async ({ taskData, eventId }) => {
  const { data } = await api.post(`/tasks/event/${eventId}`, taskData);
  return data;
};

export const updateTask = async ({ taskId, taskDetails }) => {
  const { data } = await api.put(`/tasks/${taskId}`, taskDetails);
  return data;
};

export const deleteTask = async (taskId) => {
  await api.delete(`/tasks/${taskId}`);
  return taskId;
};
