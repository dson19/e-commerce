import axios from 'axios';

const baseURL = 'https://e-commerce-6gc6.onrender.com/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  signIn: (credentials) => api.post('/auth/signin', credentials),
  signUp: (data) => api.post('/auth/signup', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  signOut: () => api.post('/auth/signout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  sendForgotOTP: (email) => api.post('/auth/forgot-password', { email }),
  verifyForgotOTP: (data) => api.post('/auth/verify-forgot-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getAddresses: () => api.get('/auth/addresses'),
  addAddress: (data) => api.post('/auth/addresses', data),
  updateAddress: (id, data) => api.put(`/auth/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
  getDefaultAddress: () => api.get('/auth/addresses/default'),
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProduct: (id) => api.get(`/products/${id}`),
  getBrands: () => api.get('/products/brands'),
  getParentCategories: () => api.get('/products/categories/parents'),
  createProduct: (data) => api.post('/products', data),
};

export const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateInventory: (variantId, data) => api.put(`/admin/inventory/${variantId}`, data),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  removeFromCart: (id) => api.delete(`/cart/remove/${id}`),
  updateQuantity: (data) => api.put('/cart/update', data),
  clearCart: () => api.delete('/cart/clear'),
};

export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getUserOrderHistory: () => api.get('/orders/orderHistory'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
};

export default api;
