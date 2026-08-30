const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const response = await fetch(
    `${API_URL}${path}`,
    {
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
    throw new Error(
      data.message || 'Request failed.'
    );
  }

  return data;
}

export function fetchWorkItems() {
  return request('/work-items');
}

export function createWorkItem(payload) {
  return request('/work-items', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateWorkItemStatus(id, status) {
  return request(
    `/work-items/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }
  );
}

export function deleteWorkItem(id) {
  return request(
    `/work-items/${id}`,
    {
      method: 'DELETE'
    }
  );
}
