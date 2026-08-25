import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { CostSetting } from '../types';

interface CostState {
  settings: CostSetting;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<CostSetting>) => Promise<boolean>;
}

export const useCostStore = create<CostState>((set) => ({
  settings: {
    overhead_pct: 20,
    profit_margin_pct: 35,
    labor_cost_per_hour_brl: 20,
  },
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/cost-settings');
      set({ settings: response.data.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao carregar configurações de custo.',
        isLoading: false,
      });
    }
  },

  updateSettings: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put('/cost-settings', data);
      set({ settings: response.data.data, isLoading: false });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao atualizar margens de custo.',
        isLoading: false,
      });
      return false;
    }
  },
}));
