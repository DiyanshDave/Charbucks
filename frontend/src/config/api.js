import axios from 'axios';

// ──────────────────────────────────────────────────────────────
// API BASE URL CONFIGURATION
// ──────────────────────────────────────────────────────────────
// If frontend runs on the SAME machine as backend:
//   → Use 'http://localhost:3000/api'
//
// If frontend runs on a DIFFERENT machine:
//   → Use 'http://<BACKEND_PC_IP>:3000/api'
//   → Example: 'http://192.168.1.10:3000/api'
//
// You can also set this via environment variable in .env:
//   VITE_API_URL=http://192.168.1.10:3000/api
// ──────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ──────────────────────────────────────────────────────────────
// API ENDPOINT HELPERS
// ──────────────────────────────────────────────────────────────

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
};

// Products
export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Tables
export const tablesAPI = {
  getAll: () => api.get('/tables'),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.patch(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
};

// Orders
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
  sendToKitchen: (id) => api.post(`/orders/${id}/send`),
  update: (id, data) => api.patch(`/orders/${id}`, data),
};

// Payments
export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getAll: () => api.get('/payments'),
};

// Kitchen
export const kitchenAPI = {
  getOrders: () => api.get('/kitchen/orders'),
  getCompleted: () => api.get('/kitchen/orders/completed'),
  updateStatus: (id, data) => api.patch(`/kitchen/orders/${id}`, data),
};

// Sessions
export const sessionsAPI = {
  open: (data) => api.post('/sessions/open', data),
  close: (data) => api.post('/sessions/close', data),
  getAll: () => api.get('/sessions'),
};

// Reports
export const reportsAPI = {
  get: (params) => api.get('/reports', { params }),
  dashboard: () => api.get('/reports/dashboard'),
};
