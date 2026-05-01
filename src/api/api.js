import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';

const adminClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials) => {
  const response = await adminClient.post('/login', credentials);
  return response.data;
};

export const getStats = async (siteId) => {
  const response = await adminClient.get('/stats', { params: { site_id: siteId } });
  return response.data;
};

export const getProducts = async (siteId) => {
  const response = await adminClient.get('/products', { params: { site_id: siteId } });
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await adminClient.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const getUsers = async () => {
  const response = await adminClient.get('/users');
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await adminClient.put(`/users/${userId}`, userData);
  return response.data;
};

export default adminClient;
