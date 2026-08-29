import axios from 'axios';

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api/v1',
  timeout: 10000
});

export async function fetchItems(category) {
  const { data } = await api.get('/items', {
    params: { category }
  });

  return data;
}

export async function fetchStats() {
  const { data } = await api.get('/items/stats');
  return data;
}

export async function fetchMetrics() {
  const { data } = await api.get('/metrics');
  return data;
}

export async function createDemoItem(category) {
  const { data } = await api.post(
    '/items/demo',
    { category }
  );

  return data;
}

export async function deleteItem(id) {
  const { data } = await api.delete(
    `/items/${id}`
  );

  return data;
}
