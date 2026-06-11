import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const adminClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Add a request interceptor to include the token and site context
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add site context header
  try {
    const appStateStr = localStorage.getItem('admin-app-state');
    if (appStateStr) {
      const appState = JSON.parse(appStateStr);
      const selectedStore = appState.state?.selectedStore;
      if (selectedStore) {
        config.headers['X-Site-Context'] = selectedStore;
      }
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }

  return config;
});

// Add a response interceptor to handle 401 errors and broadcast data changes
adminClient.interceptors.response.use(
  (response) => {
    const method = response.config?.method;
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      try {
        const channel = new BroadcastChannel('multivendor-storefront');
        channel.postMessage({ type: 'data-changed', timestamp: Date.now() });
        channel.close();
      } catch { /* BroadcastChannel may not be available */ }
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out — please try again');
      } else if (!axios.isCancel(error)) {
        toast.error('Connection lost — checking server status...');
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin-app-state');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    switch (status) {
      case 403:
        toast.error('You don\'t have permission to do that');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 422:
        const validationErrors = data?.data || data?.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          const errorMessages = Object.values(validationErrors).flat();
          if (errorMessages.length > 0) {
            toast.error(errorMessages[0]);
          } else {
            toast.error(data.message || 'Validation Error.');
          }
        } else if (data?.message) {
          toast.error(data.message);
        } else {
          toast.error('Please check your input and try again');
        }
        break;
      case 429:
        toast.error('Too many requests — please slow down');
        break;
      case 500:
        toast.error('Server error — please try again later');
        break;
      default:
        if (status !== 401) toast.error(data?.message || 'Something went wrong');
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

  getProfile: async () => {
    const response = await adminClient.get('/me');
    return response.data.data;
  },

  // Dashboard Stats
  getDashboardStats: async (storeId) => {
    const siteId = storeId === 'acharu' ? 1 : 2;
    const response = await adminClient.get('/stats', { params: { site_id: siteId } });
    return response.data.data;
  },

  getSalesStats: async (siteId, range = 'monthly', startDate = null, endDate = null) => {
    const response = await adminClient.get('/sales/stats', { 
      params: { 
        site_id: siteId, 
        range,
        start_date: startDate,
        end_date: endDate
      } 
    });
    return response.data;
  },

  // Products
  getProducts: async (siteId) => {
    const response = await adminClient.get('/products', { params: { site_id: siteId } });
    return response.data;
  },

  // Fetch ALL products across all pages (admin)
  getAllProducts: async (siteId) => {
    let allItems = [];
    let page = 1;
    let lastPage = 1;
    do {
      const response = await adminClient.get('/products', { params: { site_id: siteId, page } });
      const res = response.data;
      const pageData = res?.data?.data ?? res?.data ?? [];
      if (Array.isArray(pageData)) allItems = [...allItems, ...pageData];
      lastPage = res?.data?.last_page ?? 1;
      page++;
    } while (page <= lastPage);
    return allItems;
  },

  storeProduct: async (formData) => {
    const response = await adminClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateProduct: async (id, formData) => {
    const response = await adminClient.post(`/products/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await adminClient.post(`/products/${id}/delete`);
    return response.data;
  },

  // Categories
  getCategories: async (siteId) => {
    const response = await adminClient.get('/categories', { params: { site_id: siteId } });
    return response.data.data;
  },

  storeCategory: async (formData) => {
    const response = await adminClient.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateCategory: async (id, formData) => {
    const response = await adminClient.post(`/categories/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await adminClient.post(`/categories/${id}/delete`);
    return response.data;
  },

  // Orders & Inventory
  getOrders: async (siteId) => {
    const response = await adminClient.get('/orders', { params: { site_id: siteId } });
    return response.data;
  },

  // Fetch ALL orders across all pages (admin)
  getAllOrders: async (siteId) => {
    let allItems = [];
    let page = 1;
    let lastPage = 1;
    do {
      const response = await adminClient.get('/orders', { params: { site_id: siteId, page } });
      const res = response.data;
      const pageData = res?.data?.data ?? res?.data ?? [];
      if (Array.isArray(pageData)) allItems = [...allItems, ...pageData];
      lastPage = res?.data?.last_page ?? 1;
      page++;
    } while (page <= lastPage);
    return allItems;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await adminClient.post(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  updatePaymentStatus: async (orderId, paymentStatus) => {
    const response = await adminClient.post(`/orders/${orderId}/payment-status`, { payment_status: paymentStatus });
    return response.data;
  },
  
  updateOrder: async (id, data) => {
    const response = await adminClient.post(`/orders/${id}/update`, data);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await adminClient.post(`/orders/${id}/delete`);
    return response.data;
  },

  recordReturn: async (data) => {
    const response = await adminClient.post('/inventory/return', data);
    return response.data;
  },
  
  getReturns: async (siteId) => {
    const response = await adminClient.get('/inventory/returns', { params: { site_id: siteId } });
    return response.data;
  },

  // Site Settings
  getSettings: async (siteId) => {
    const response = await adminClient.get(`/sites/${siteId}/settings`);
    return response.data.data;
  },

  updateSettings: async (siteId, settings) => {
    const response = await adminClient.post(`/sites/${siteId}/settings/update`, { settings });
    return response.data;
  },

  uploadSettingsMedia: async (formData) => {
    const response = await adminClient.post('/settings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Hero Slides (Banners)
  getHeroSlides: async (siteId) => {
    const response = await adminClient.get('/hero-slides', { params: { site_id: siteId } });
    return response.data.data;
  },

  storeHeroSlide: async (formData) => {
    const response = await adminClient.post('/hero-slides', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateHeroSlide: async (id, formData) => {
    const response = await adminClient.post(`/hero-slides/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteHeroSlide: async (id) => {
    const response = await adminClient.post(`/hero-slides/${id}/delete`);
    return response.data;
  },



  // Reviews
  getReviews: async (siteId) => {
    const response = await adminClient.get('/reviews', { params: { site_id: siteId } });
    return response.data.data;
  },

  updateReview: async (id, reviewData) => {
    const response = await adminClient.post(`/reviews/${id}/update`, reviewData);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await adminClient.post(`/reviews/${id}/delete`);
    return response.data;
  },

  // Coupons
  getCoupons: async (siteId) => {
    const response = await adminClient.get('/coupons', { params: { site_id: siteId } });
    return response.data;
  },

  storeCoupon: async (couponData) => {
    const response = await adminClient.post('/coupons', couponData);
    return response.data;
  },

  updateCoupon: async (id, couponData) => {
    const response = await adminClient.post(`/coupons/${id}/update`, couponData);
    return response.data;
  },

  deleteCoupon: async (id) => {
    const response = await adminClient.post(`/coupons/${id}/delete`);
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await adminClient.get('/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await adminClient.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await adminClient.post('/notifications/mark-all-read');
    return response.data;
  },

  // Contact Messages
  getMessages: async (siteId) => {
    const response = await adminClient.get('/messages', { params: { site_id: siteId } });
    return response.data.data;
  },

  markMessageRead: async (id) => {
    const response = await adminClient.post(`/messages/${id}/read`);
    return response.data;
  },

  // Admin User Management
  getUsers: async () => {
    const response = await adminClient.get('/users');
    return response.data.data;
  },

  storeUser: async (formData) => {
    const response = await adminClient.post('/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateUser: async (id, formData) => {
    const response = await adminClient.post(`/users/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await adminClient.post(`/users/${id}/delete`);
    return response.data;
  },

  getCustomers: async (siteId) => {
    const response = await adminClient.get('/customers', { params: { site_id: siteId } });
    return response.data;
  }
};
