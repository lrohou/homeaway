// HomeAway Secure API Client
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API Error: ${response.status}`);
  return data;
};

export const api = {
  auth: {
    register: async ({ email, password, name, avatar, code }) => {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, avatar, code }),
      });
      localStorage.setItem('authToken', data.token);
      return data.user;
    },
    sendCode: (email) => apiCall('/auth/send-code', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyCode: (email, code) => apiCall('/auth/verify-code', { method: 'POST', body: JSON.stringify({ email, code }) }),
    login: async ({ email, password }) => {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('authToken', data.token);
      return data.user;
    },
    loginWithGoogle: async (accessToken) => {
      const data = await apiCall('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ access_token: accessToken }),
      });
      localStorage.setItem('authToken', data.token);
      return data.user;
    },
    me: async () => {
      return await apiCall('/auth/me', { method: 'GET' });
    },
    updateMe: async (data) => {
      return await apiCall('/auth/me', { method: 'PUT', body: JSON.stringify(data) });
    },
    deleteAccount: async () => {
      return await apiCall('/auth/me', { method: 'DELETE' });
    },
    logout: () => {
      localStorage.removeItem('authToken');
    },
  },
  trips: {
    list: async () => apiCall('/trips', { method: 'GET' }),
    get: async (id) => apiCall(`/trips/${id}`, { method: 'GET' }),
    create: async (data) => apiCall('/trips', { method: 'POST', body: JSON.stringify(data) }),
    update: async (id, data) => apiCall(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (id) => apiCall(`/trips/${id}`, { method: 'DELETE' }),
  },
  tripSteps: {
    list: async (tripId) => apiCall(`/trips/${tripId}/steps`, { method: 'GET' }),
    get: async (tripId, stepId) => apiCall(`/trips/${tripId}/steps/${stepId}`, { method: 'GET' }),
    create: async (tripId, data) => apiCall(`/trips/${tripId}/steps`, { method: 'POST', body: JSON.stringify(data) }),
    update: async (stepId, data) => apiCall(`/trip-steps/${stepId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (stepId) => apiCall(`/trip-steps/${stepId}`, { method: 'DELETE' }),
  },
  accommodations: {
    list: async (tripId) => apiCall(`/trips/${tripId}/accommodations`, { method: 'GET' }),
    get: async (tripId, accId) => apiCall(`/trips/${tripId}/accommodations/${accId}`, { method: 'GET' }),
    create: async (tripId, data) => apiCall(`/trips/${tripId}/accommodations`, { method: 'POST', body: JSON.stringify(data) }),
    update: async (accId, data) => apiCall(`/accommodations/${accId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (accId) => apiCall(`/accommodations/${accId}`, { method: 'DELETE' }),
  },
  activities: {
    list: async (tripId) => apiCall(`/trips/${tripId}/activities`, { method: 'GET' }),
    get: async (tripId, actId) => apiCall(`/trips/${tripId}/activities/${actId}`, { method: 'GET' }),
    create: async (tripId, data) => apiCall(`/trips/${tripId}/activities`, { method: 'POST', body: JSON.stringify(data) }),
    update: async (actId, data) => apiCall(`/activities/${actId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (actId) => apiCall(`/activities/${actId}`, { method: 'DELETE' }),
  },
  transports: {
    list: async (tripId) => apiCall(`/trips/${tripId}/transports`, { method: 'GET' }),
    get: async (tripId, trId) => apiCall(`/trips/${tripId}/transports/${trId}`, { method: 'GET' }),
    create: async (tripId, data) => apiCall(`/trips/${tripId}/transports`, { method: 'POST', body: JSON.stringify(data) }),
    update: async (trId, data) => apiCall(`/transports/${trId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (trId) => apiCall(`/transports/${trId}`, { method: 'DELETE' }),
  },
  expenses: {
    list: async (tripId) => apiCall(`/trips/${tripId}/expenses`, { method: 'GET' }),
    get: async (tripId, expId) => apiCall(`/trips/${tripId}/expenses/${expId}`, { method: 'GET' }),
    create: async (tripId, data) => apiCall(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(data) }),
    update: async (expId, data) => apiCall(`/expenses/${expId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (expId) => apiCall(`/expenses/${expId}`, { method: 'DELETE' }),
  },
  members: {
    list: async (tripId) => apiCall(`/trips/${tripId}/members`, { method: 'GET' }),
    listInvitations: async (tripId) => apiCall(`/trips/${tripId}/members/invitations`, { method: 'GET' }),
    invite: async (tripId, data) => apiCall(`/trips/${tripId}/members/invite`, { method: 'POST', body: JSON.stringify(data) }),
    join: async (token) => apiCall(`/members/join/${token}`, { method: 'POST' }),
    cancelInvitation: async (tripId, invitationId) => apiCall(`/trips/${tripId}/members/invitations/${invitationId}`, { method: 'DELETE' }),
    remove: async (tripId, memberId) => apiCall(`/trips/${tripId}/members/${memberId}`, { method: 'DELETE' }),
  },
  messages: {
    list: async (tripId) => apiCall(`/trips/${tripId}/messages`, { method: 'GET' }),
    send: async (tripId, data) => apiCall(`/trips/${tripId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  },
  documents: {
    list: async (tripId) => apiCall(`/trips/${tripId}/documents`, { method: 'GET' }),
    upload: async (tripId, formData) => {
      const url = `${API_URL}/trips/${tripId}/documents`;
      const token = localStorage.getItem('authToken');
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { method: 'POST', body: formData, headers });
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `API Error: ${response.status}`);
      return data;
    },
    delete: async (docId) => apiCall(`/documents/${docId}`, { method: 'DELETE' }),
  },
  community: {
    list: async () => apiCall('/community', { method: 'GET' }),
    get: async (id) => apiCall(`/community/${id}`, { method: 'GET' }),
    share: async (data) => apiCall('/community/share', { method: 'POST', body: JSON.stringify(data) }),
    unshare: async (tripId) => apiCall(`/community/unshare/${tripId}`, { method: 'DELETE' }),
    getSettings: async (tripId) => apiCall(`/community/settings/${tripId}`, { method: 'GET' }),
    getContent: async (id) => apiCall(`/community/${id}/content`, { method: 'GET' }),
  },
};
