import api from './api';

// The backend returns a PaginatedResponse; expose its content to array-based UI consumers.
export const getAllEvents = async () => {
  const { data } = await api.get('/events', { params: { page: 0, size: 100 } });
  return Array.isArray(data) ? data : (data?.content ?? []);
};

// Corresponds to GET /api/v1/events/{id}
export const getEventById = async (id) => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

// Corresponds to POST /api/v1/events
export const createEvent = async (newEvent) => {
  const { data } = await api.post('/events', newEvent);
  return data;
};

export const joinEvent = async (eventId) => {
  const { data } = await api.post(`/events/${eventId}/join`);
  return data;
};

export const deleteEvent = async (eventId) => {
  const { data } = await api.delete(`/events/${eventId}`);
  return data;
};

export const getChatHistory = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}/messages`);
  return data;
};

export const getMyEvents = async () => {
  const { data } = await api.get('/events/my-events');
  return data;
};
