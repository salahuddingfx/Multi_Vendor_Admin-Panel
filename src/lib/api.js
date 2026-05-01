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
      recentSales: (data.recent_orders || []).map(o => ({
        id: o.tracking_id,
        date: new Date(o.created_at).toLocaleDateString(),
        amount: o.total_amount
      })),
      chartData: (data.chart_data || []).map(d => ({
        name: d.name,
        value: d.sales
      }))
    };
  },

  // Products
  getProducts: async (siteId) => {
    const response = await adminClient.get('/products', { params: { site_id: siteId } });
    const products = response.data.data.data; // Access data inside pagination
    
    return products.map(p => ({
      ...p,
      category: p.category?.name || 'Uncategorized',
      image: p.images && p.images.length > 0 ? p.images[0].image_path : 'https://images.unsplash.com/photo-1514516348920-f319999a5e8f?q=80&w=200&auto=format&fit=crop'
    }));
  },

  storeProduct: async (formData) => {
    const response = await adminClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  updateProduct: async (id, formData) => {
    // Laravel has an issue with PUT + Multipart, so we spoof it with POST + _method=PUT
    formData.append('_method', 'PUT');
    const response = await adminClient.post(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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

  // Site Settings
  getSettings: async (siteId) => {
    const response = await adminClient.get(`/sites/${siteId}/settings`);
    return response.data.data;
  },

  updateSettings: async (siteId, settings) => {
    const response = await adminClient.put(`/sites/${siteId}/settings`, { settings });
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
