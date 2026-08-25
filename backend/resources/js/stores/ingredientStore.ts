import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { Ingredient } from '../types';

interface IngredientState {
  ingredients: Ingredient[];
  isLoading: boolean;
  error: string | null;
  fetchIngredients: (search?: string) => Promise<void>;
  createIngredient: (data: Partial<Ingredient>) => Promise<Ingredient | null>;
  updateIngredient: (id: string, data: Partial<Ingredient>) => Promise<boolean>;
  deleteIngredient: (id: string) => Promise<boolean>;
}

export const useIngredientStore = create<IngredientState>((set, get) => ({
  ingredients: [],
  isLoading: false,
  error: null,

  fetchIngredients: async (search) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/ingredients', {
        params: search ? { search } : {},
      });
      set({ ingredients: response.data.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao carregar ingredientes.',
        isLoading: false,
      });
    }
  },

  createIngredient: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/ingredients', data);
      const newIng = response.data.data;
      set({
        ingredients: [newIng, ...get().ingredients],
        isLoading: false,
      });
      return newIng;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao salvar ingrediente.',
        isLoading: false,
      });
      return null;
    }
  },

  updateIngredient: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/ingredients/${id}`, data);
      const updated = response.data.data;
      set({
        ingredients: get().ingredients.map((ing) => (ing.id === id ? updated : ing)),
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao atualizar ingrediente.',
        isLoading: false,
      });
      return false;
    }
  },

  deleteIngredient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/ingredients/${id}`);
      set({
        ingredients: get().ingredients.filter((ing) => ing.id !== id),
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao excluir ingrediente.',
        isLoading: false,
      });
      return false;
    }
  },
}));
