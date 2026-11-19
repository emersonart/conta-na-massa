import axios from 'axios';
import { addApiBreadcrumb, captureApiFailure, telemetryLog } from '../observability';

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
  addApiBreadcrumb(config.method || 'get', apiClient.getUri(config));
  return config;
});

// Response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => {
    addApiBreadcrumb(response.config.method || 'get', apiClient.getUri(response.config), response.status);
    return response;
  },
  (error) => {
    const config = error.config;
    const url = config ? apiClient.getUri(config) : '/api/v1';
    const method = config?.method || 'get';
    const status = error.response?.status;
    addApiBreadcrumb(method, url, status);

    // Validation and authentication failures are normal API responses. Report
    // only server/network failures, with no request body or credential data.
    if (!status || status >= 500) {
      telemetryLog.error('API request failed', { method: method.toUpperCase(), status: status || 'network_error' });
      captureApiFailure(method, url, status);
    }

    if (error.response?.status === 401) {
      // Clear token if expired/invalid
      localStorage.removeItem('conta_na_massa_token');
      localStorage.removeItem('conta_na_massa_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
