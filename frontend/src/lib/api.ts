import axios from 'axios';
import { getApiBaseUrl } from './config';

export { getApiBaseUrl };

export function formatApiError(err: any, fallback = 'An unexpected error occurred'): string {
  const detail = err?.response?.data?.detail ?? err?.detail;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => {
      if (typeof e === 'string') return e;
      const loc = Array.isArray(e.loc) ? e.loc.filter((l: any) => l !== 'body').join(' → ') : '';
      const msg = e.msg || JSON.stringify(e);
      return loc ? `${loc}: ${msg}` : msg;
    }).join(' | ');
  }
  if (typeof detail === 'object') {
    return detail.msg || detail.detail || JSON.stringify(detail);
  }
  return String(detail);
}

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
    // If sending FormData, remove Content-Type so browser/Axios properly sets multipart/form-data with boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
