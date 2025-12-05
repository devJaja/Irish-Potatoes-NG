import axios from 'axios';
import { Product } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  sendOTP: (email: string) => api.post('/auth/send-otp', { email }),
  resetPassword: (token: string, newPassword: string) => api.post(`/auth/reset-password/${token}`, { password: newPassword }),
};

export const productsAPI = {
  getProducts: async (params?: any) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (productData: Product) => api.post('/products', productData),
  updateProduct: (id: string, productData: Product) => api.put(`/products/${id}`, productData),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

export const ordersAPI = {
  createOrder: (data: any) => api.post('/orders', data),
  getOrder: (id: string) => api.get(`/orders/${id}`),
};

export default api;
