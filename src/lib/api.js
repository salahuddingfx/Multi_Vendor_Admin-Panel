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

export const api = {
  // Login
  login: async (credentials) => {
    const response = await adminClient.post('/login', credentials);
    return response.data;
  },

  // Dashboard Stats
  getDashboardStats: async (storeId) => {
    const siteId = storeId === 'acharu' ? 1 : 2;
    const response = await adminClient.get('/stats', { params: { site_id: siteId } });
    const data = response.data.data;
    
    return {
      totalSales: data.total_sales || 0,
      totalOrders: data.total_orders || 0,
      activeProducts: data.active_products || 0,
      lowStock: data.low_stock_products || 0,
      recentSales: data.recent_orders.map(o => ({
        id: o.tracking_id,
        date: new Date(o.created_at).toLocaleDateString(),
        amount: o.total_amount
      })),
      chartData: [
        { name: 'Mon', value: 4000 },
        { name: 'Tue', value: 3000 },
        { name: 'Wed', value: 2000 },
        { name: 'Thu', value: 2780 },
        { name: 'Fri', value: 1890 },
        { name: 'Sat', value: 2390 },
        { name: 'Sun', value: 3490 },
      ]
    };
  },

  // Products CRUD
  getProducts: async (storeId) => {
    const siteId = storeId === 'acharu' ? 1 : 2;
    const response = await adminClient.get('/products', { params: { site_id: siteId } });
    const products = response.data.data.data;
    
    return products.map(p => ({
      ...p,
      category: p.category?.name || 'Uncategorized',
      image: p.images && p.images.length > 0 ? p.images[0].image_path : null
    }));
  },

  // Orders
  getOrders: async (storeId) => {
    const siteId = storeId === 'acharu' ? 1 : 2;
    const response = await adminClient.get('/orders', { params: { site_id: siteId } });
    return response.data.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await adminClient.put(`/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  // User Management
  getUsers: async () => {
    const response = await adminClient.get('/users');
    return response.data.data;
  },

  updateUser: async (userId, userData) => {
    const response = await adminClient.put(`/users/${userId}`, userData);
    return response.data.data;
  }
};
