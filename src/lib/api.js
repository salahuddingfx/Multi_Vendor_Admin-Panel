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

// Add a response interceptor to handle 401 errors
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin-app-state');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
      ]
    };
  },

  // Products
  getProducts: async (siteId) => {
    const response = await adminClient.get('/products', { params: { site_id: siteId } });
    return response.data.data;
  },

  storeProduct: async (productData) => {
    const response = await adminClient.post('/products', productData);
    return response.data.data;
  },

  updateProduct: async (id, productData) => {
    const response = await adminClient.put(`/products/${id}`, productData);
    return response.data.data;
  },

  deleteProduct: async (id) => {
    const response = await adminClient.delete(`/products/${id}`);
    return response.data.data;
  },

  // Categories
  getCategories: async (siteId) => {
    const response = await adminClient.get('/categories', { params: { site_id: siteId } });
    return response.data.data;
  },

  storeCategory: async (categoryData) => {
    const response = await adminClient.post('/categories', categoryData);
    return response.data.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await adminClient.put(`/categories/${id}`, categoryData);
    return response.data.data;
  },

  deleteCategory: async (id) => {
    const response = await adminClient.delete(`/categories/${id}`);
    return response.data.data;
  },

  // Orders
  getOrders: async (siteId) => {
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
