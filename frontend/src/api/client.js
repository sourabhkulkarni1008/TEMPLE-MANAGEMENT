import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const rawBaseUrl = isLocalhost 
  ? 'http://localhost:5000/api'
  : (import.meta.env.VITE_API_BASE_URL || 'https://temple-management-backend-ex80.onrender.com/api');

// Automatically append /api if omitted in VITE_API_BASE_URL configuration
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
export const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('temple_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated sessions
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Network communication error',
      errors: error.response?.data?.errors || [],
      status: error.response?.status
    };
    return Promise.reject(customError);
  }
);

export default api;
