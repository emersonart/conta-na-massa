import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

let authPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('conta_na_massa_token');
  const savedUser = localStorage.getItem('conta_na_massa_user');

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken,
    isLoading: false,
    isCheckingAuth: true,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/auth/login', { email, password });
        const { user, token } = response.data;

        localStorage.setItem('conta_na_massa_token', token);
        localStorage.setItem('conta_na_massa_user', JSON.stringify(user));

        set({ user, token, isLoading: false });
        return true;
      } catch (err: any) {
        const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Falha ao autenticar.';
        set({ error: message, isLoading: false });
        return false;
      }
    },

    register: async (name, email, password, password_confirmation) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/auth/register', {
          name,
          email,
          password,
          password_confirmation,
        });
        const { user, token } = response.data;

        localStorage.setItem('conta_na_massa_token', token);
        localStorage.setItem('conta_na_massa_user', JSON.stringify(user));

        set({ user, token, isLoading: false });
        return true;
      } catch (err: any) {
        const errorsObj = (err.response?.data?.errors || {}) as Record<string, string[]>;
        const firstErrorList = Object.values(errorsObj)[0];
        const firstError = Array.isArray(firstErrorList) ? firstErrorList[0] : null;
        const message = err.response?.data?.message || firstError || 'Falha ao registrar.';
        set({ error: message, isLoading: false });
        return false;
      }
    },

    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // ignore
      } finally {
        localStorage.removeItem('conta_na_massa_token');
        localStorage.removeItem('conta_na_massa_user');
        set({ user: null, token: null });
      }
    },

    checkAuth: async () => {
      const token = localStorage.getItem('conta_na_massa_token');
      if (!token) {
        set({ isCheckingAuth: false });
        return;
      }

      if (authPromise) {
        await authPromise;
        return;
      }

      authPromise = (async () => {
        try {
          const response = await apiClient.get('/auth/me');
          set({ user: response.data.user, isCheckingAuth: false });
        } catch (err: any) {
          if (err.response?.status === 401) {
            localStorage.removeItem('conta_na_massa_token');
            localStorage.removeItem('conta_na_massa_user');
            set({ user: null, token: null });
          }
          set({ isCheckingAuth: false });
        }
      })();

      await authPromise;
      authPromise = null;
    },

    clearError: () => set({ error: null }),
  };
});
