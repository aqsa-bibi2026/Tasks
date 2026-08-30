const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      credentials: 'include',
      headers: {
        'Content-Type':
          'application/json',
        ...(options.headers || {})
      },
      ...options
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || 'Request failed.'
    );
    error.status =
      response.status;
    throw error;
  }

  return data;
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getMe() {
  return request('/auth/me');
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST'
  });
}

export function fetchDashboard() {
  return request('/dashboard');
}

export function fetchAdminUsers() {
  return request(
    '/dashboard/admin/users'
  );
}

export function fetchManagerTeam() {
  return request(
    '/dashboard/manager/team'
  );
}
