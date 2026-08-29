import axios from 'axios';
export const api = axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1',timeout:10000});
export async function fetchOrders({page,limit,sort}) { return (await api.get('/orders',{params:{page,limit,sort}})).data; }
export async function fetchStats() { return (await api.get('/orders/stats')).data; }
export async function createDemoOrder() { return (await api.post('/orders/demo')).data; }
export async function deleteOrder(id) { return (await api.delete(`/orders/${id}`)).data; }
