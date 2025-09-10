import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  loadingMessage: string;
  
  error: string | null;
  errorType: 'network' | 'validation' | 'auth' | 'general' | null;
  
  successMessage: string | null;
  
  showModal: boolean;
  modalType: 'ticket' | 'confirm' | 'error' | null;
  modalData: unknown;
  
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null, type?: 'network' | 'validation' | 'auth' | 'general') => void;
  setSuccess: (message: string | null) => void;
  setModal: (show: boolean, type?: 'ticket' | 'confirm' | 'error', data?: unknown) => void;
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  clearAll: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isLoading: false,
  loadingMessage: '',
  error: null,
  errorType: null,
  successMessage: null,
  showModal: false,
  modalType: null,
  modalData: null,
  notifications: [],
  
  setLoading: (loading: boolean, message: string = '') => {
    set({ isLoading: loading, loadingMessage: message });
  },
  
  setError: (error: string | null, type: 'network' | 'validation' | 'auth' | 'general' = 'general') => {
    set({ error, errorType: error ? type : null });
    
    if (error) {
      get().addNotification('error', error);
    }
  },
  
  setSuccess: (message: string | null) => {
    set({ successMessage: message });
    
    if (message) {
      get().addNotification('success', message);
    }
  },
  
  setModal: (show: boolean, type: 'ticket' | 'confirm' | 'error' = 'confirm', data: unknown = null) => {
    set({ showModal: show, modalType: show ? type : null, modalData: show ? data : null });
  },
  
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    
    set((state) => ({
      notifications: [...state.notifications, { id, type, message, timestamp }]
    }));
    
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },
  
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
  
  clearAll: () => {
    set({
      isLoading: false,
      loadingMessage: '',
      error: null,
      errorType: null,
      successMessage: null,
      showModal: false,
      modalType: null,
      modalData: null,
      notifications: [],
    });
  },
}));
