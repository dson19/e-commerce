import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  signIn: (credentials) => api.post('/auth/signin', credentials),
  signUp: (data) => api.post('/auth/signup', data),
  verifyOTP: (data) => api.post('/auth/verify', data),
  signOut: () => api.post('/auth/signout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  sendForgotOTP: (email) => api.post('/auth/forgot-password', { email }),
  verifyForgotOTP: (data) => api.post('/auth/verify-forgot-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProduct: (id) => api.get(`/products/${id}`), 
  getBrands: () => api.get('/products/brands'),
  getParentCategories: () => api.get('/products/categories/parents'),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  removeFromCart: (id) => api.delete(`/cart/remove/${id}`),
  updateQuantity: (data) => api.put('/cart/update', data),
  clearCart: () => api.delete('/cart/clear'),
};

export default api;
