import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { Recipe } from '../types';

interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  fetchRecipes: (search?: string) => Promise<void>;
  fetchRecipe: (id: string) => Promise<Recipe | null>;
  createRecipe: (data: any) => Promise<Recipe | null>;
  updateRecipe: (id: string, data: any) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<boolean>;
  setCurrentRecipe: (recipe: Recipe | null) => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  error: null,

  fetchRecipes: async (search) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/recipes', {
        params: search ? { search } : {},
      });
      set({ recipes: response.data.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao carregar receitas.',
        isLoading: false,
      });
    }
  },

  fetchRecipe: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/recipes/${id}`);
      const recipe = response.data.data;
      set({ currentRecipe: recipe, isLoading: false });
      return recipe;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao buscar receita.',
        isLoading: false,
      });
      return null;
    }
  },

  createRecipe: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/recipes', data);
      const newRecipe = response.data.data;
      set({
        recipes: [newRecipe, ...get().recipes],
        currentRecipe: newRecipe,
        isLoading: false,
      });
      return newRecipe;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao criar receita.',
        isLoading: false,
      });
      return null;
    }
  },

  updateRecipe: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/recipes/${id}`, data);
      const updated = response.data.data;
      set({
        recipes: get().recipes.map((r) => (r.id === id ? updated : r)),
        currentRecipe: updated,
        isLoading: false,
      });
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao salvar alterações da receita.',
        isLoading: false,
      });
      return null;
    }
  },

  deleteRecipe: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/recipes/${id}`);
      set({
        recipes: get().recipes.filter((r) => r.id !== id),
        currentRecipe: get().currentRecipe?.id === id ? null : get().currentRecipe,
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao excluir receita.',
        isLoading: false,
      });
      return false;
    }
  },

  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
}));
