const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

export async function createProfile(payload) {
  const response = await fetch(
    `${API_URL}/profiles`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || 'Request failed.'
    );

    error.status = response.status;
    error.fieldErrors = data.errors || {};
    throw error;
  }

  return data;
}

export async function fetchProfileStats() {
  const response = await fetch(
    `${API_URL}/profiles/stats`
  );

  if (!response.ok) {
    throw new Error(
      'Unable to load profile stats.'
    );
  }

  return response.json();
}
