import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      selectedStore: 'acharu',
      isSidebarOpen: true,
      user: null,
      isAuthenticated: false,
      settings: null,
      
      // Actions
      setSelectedStore: (store) => set({ selectedStore: store }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('admin_token');
        set({ user: null, isAuthenticated: false, settings: null });
      },
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: 'admin-app-state',
    }
  )
);
