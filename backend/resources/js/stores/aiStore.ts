import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { AiMessage, AiUserProfile } from '../types';
import { useIngredientStore } from './ingredientStore';
import { useRecipeStore } from './recipeStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface AiState {
  messages: AiMessage[];
  sessions: { session_id: string; title: string; updated_at: string }[];
  sessionId: string;
  userProfile: AiUserProfile | null;
  activeProvider: string;
  isHistoryLoading: boolean;
  isSendingMessage: boolean;
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  startNewSession: () => void;
  clearHistory: () => Promise<void>;
  stats: any | null;
  fetchStats: () => Promise<void>;
}

export const useAiStore = create<AiState>((set, get) => ({
  messages: [],
  sessions: [],
  sessionId: crypto.randomUUID(),
  userProfile: null,
  activeProvider: 'gemini',
  isHistoryLoading: false,
  isSendingMessage: false,
  isLoading: false,
  error: null,
  stats: null,

  fetchStats: async () => {
    try {
      const response = await apiClient.get('/ai/usage/stats');
      set({ stats: response.data });
    } catch (err) {
      console.error('Failed to fetch AI usage stats', err);
    }
  },

  fetchHistory: async () => {
    set({ isHistoryLoading: true, error: null });
    try {
      const response = await apiClient.get('/ai/history', {
        params: { session_id: get().sessionId },
      });
      set({
        messages: response.data.messages || [],
        userProfile: response.data.user_profile || null,
        activeProvider: response.data.active_provider || 'gemini',
        isHistoryLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Erro ao carregar histórico.',
        isHistoryLoading: false,
      });
    }
  },

  fetchSessions: async () => {
    try {
      const response = await apiClient.get('/ai/sessions');
      set({ sessions: response.data.sessions || [] });
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  },

  loadSession: async (sessionId: string) => {
    localStorage.setItem('vibe_chat_session_id', sessionId);
    set({ sessionId, messages: [] });
    await get().fetchHistory();
  },

  startNewSession: () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('vibe_chat_session_id', newSessionId);
    set({ sessionId: newSessionId, messages: [] });
  },

  sendMessage: async (message) => {
    set({ isSendingMessage: true, isLoading: true, error: null });

    const userMsg: AiMessage = {
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    const initialAssistantMsg: AiMessage = {
      role: 'assistant',
      content: '',
      actions_executed: [],
      created_at: new Date().toISOString(),
    };

    set({ messages: [...get().messages, userMsg, initialAssistantMsg] });

    try {
      const token = localStorage.getItem('conta_na_massa_token');
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          session_id: get().sessionId,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.message || `Erro HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Streaming não suportado pelo navegador.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || '';

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          let eventName = 'message';
          let eventData = '';

          const lines = rawEvent.split(/\r?\n/);
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('event:')) {
              eventName = trimmed.substring(6).trim();
            } else if (trimmed.startsWith('data:')) {
              const val = trimmed.substring(5).trim();
              eventData = eventData ? eventData + '\n' + val : val;
            }
          }

          if (!eventData) continue;

          try {
            const parsedData = JSON.parse(eventData);

            if (eventName === 'chunk') {
              const incomingText = parsedData.text || '';
              set((state) => {
                const updated = [...state.messages];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: updated[lastIdx].content + incomingText,
                  };
                }
                return { messages: updated };
              });
            } else if (eventName === 'action') {
              const action = parsedData.action;
              set((state) => {
                const updated = [...state.messages];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  const existingActions = updated[lastIdx].actions_executed || [];
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    actions_executed: [...existingActions, action],
                  };
                }
                return { messages: updated };
              });

              // Refresh stores when database changes occur
              useIngredientStore.getState().fetchIngredients();
              useRecipeStore.getState().fetchRecipes();
            } else if (eventName === 'done') {
              if (parsedData.session_id) {
                localStorage.setItem('vibe_chat_session_id', parsedData.session_id);
                set({ sessionId: parsedData.session_id });
              }
              if (parsedData.user_profile) {
                set({ userProfile: parsedData.user_profile });
              }
              // Refresh sessions list after a message is completed
              get().fetchSessions();
            }
          } catch (e) {
            // Ignore malformed JSON in partial SSE chunks
          }
        }
      }

      set({ isSendingMessage: false, isLoading: false });
    } catch (err: any) {
      const errorText = '⚠️ ' + (err.message || 'Falha ao processar mensagem.');
      set((state) => {
        const updated = [...state.messages];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: updated[lastIdx].content ? updated[lastIdx].content + '\n\n' + errorText : errorText,
          };
        }
        return {
          messages: updated,
          isSendingMessage: false,
          isLoading: false,
          error: err.message || 'Falha na comunicação com o Modo Vibe',
        };
      });
    }
  },

  clearHistory: async () => {
    try {
      await apiClient.delete('/ai/history', {
        params: { session_id: get().sessionId },
      });
      get().startNewSession();
      get().fetchSessions();
    } catch (e) {
      // ignore
    }
  },
}));
