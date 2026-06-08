import { create } from 'zustand';
import { workspaceApi, inviteApi } from '../api/pro';

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await workspaceApi.list();
      set({ workspaces: data, isLoading: false });
      
      const { activeWorkspaceId } = get();
      if (!activeWorkspaceId && data.length > 0) {
        set({ activeWorkspaceId: data[0].id });
      } else if (data.length === 0) {
        set({ activeWorkspaceId: null });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  setActiveWorkspaceId: (id) => {
    set({ activeWorkspaceId: id });
  },

  createWorkspace: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newWs = await workspaceApi.create(data);
      set(state => ({ 
        workspaces: [...state.workspaces, newWs],
        activeWorkspaceId: newWs.id,
        isLoading: false 
      }));
      return newWs;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  deleteWorkspace: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await workspaceApi.delete(id);
      set(state => {
        const filtered = state.workspaces.filter(w => w.id !== id);
        let nextActive = state.activeWorkspaceId;
        if (state.activeWorkspaceId === id) {
           nextActive = filtered.length > 0 ? filtered[0].id : null;
        }
        return { workspaces: filtered, activeWorkspaceId: nextActive, isLoading: false };
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
