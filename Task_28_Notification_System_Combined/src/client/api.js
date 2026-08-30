const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  me: () => request('/auth/me'),

  logout: () =>
    request('/auth/logout', {
      method: 'POST'
    }),

  notifications: ({ status, type, priority, q }) => {
    const params = new URLSearchParams({
      status,
      type,
      priority,
      q
    });

    return request(`/notifications?${params.toString()}`);
  },

  stats: () => request('/notifications/stats'),

  markRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PATCH'
    }),

  markAllRead: () =>
    request('/notifications/read-all', {
      method: 'PATCH'
    }),

  createDemo: () =>
    request('/notifications/demo', {
      method: 'POST'
    }),

  remove: (id) =>
    request(`/notifications/${id}`, {
      method: 'DELETE'
    })
};
