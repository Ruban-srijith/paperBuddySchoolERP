import axios from 'axios';
import { getApiBaseUrl } from './config';

export { getApiBaseUrl };

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach auth token from localStorage and ensure dynamic baseURL
if (api && api.interceptors) {
  api.interceptors.request.use((config) => {
    if (!config.baseURL) {
      config.baseURL = getApiBaseUrl();
    }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pb_token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        const isLoginAttempt = error.config?.url?.includes('/auth/login');
        if (!isLoginAttempt) {
          localStorage.removeItem('pb_token');
          localStorage.removeItem('pb_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;
