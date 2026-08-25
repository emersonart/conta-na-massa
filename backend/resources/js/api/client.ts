import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 20000,
});

// Attach bearer token automatically if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('conta_na_massa_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired/invalid
      localStorage.removeItem('conta_na_massa_token');
      localStorage.removeItem('conta_na_massa_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
