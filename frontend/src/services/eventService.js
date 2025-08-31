import api from './api';

// Corresponds to GET /api/events
export const getAllEvents = async () => {
  const { data } = await api.get('/events');
  return data;
};

// Corresponds to GET /api/events/{id}
export const getEventById = async (id) => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

// Corresponds to POST /api/events
export const createEvent = async (newEvent) => {
  const { data } = await api.post('/events', newEvent);
  return data;
};

// Corresponds to POST /api/events/{eventId}/join
export const joinEvent = async (eventId) => {
  const { data } = await api.post(`/events/${eventId}/join`);
  return data;
};

// *** NEW: Corresponds to DELETE /api/events/{eventId} ***
export const deleteEvent = async (eventId) => {
  const { data } = await api.delete(`/events/${eventId}`);
  return data;
};


// Corresponds to GET /api/events/{eventId}/messages
export const getChatHistory = async (eventId) => {
    const { data } = await api.get(`/events/${eventId}/messages`);
    return data;
}
export const getMyEvents = async () => {
  const { data } = await api.get('/events/my-events');
  return data;
}
