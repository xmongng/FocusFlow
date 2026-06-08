import { create } from 'zustand';
import { authApi } from '../api';

const getSafeUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || storedUser === 'undefined') return null;
    return JSON.parse(storedUser);
  } catch (err) {
    console.error('Lỗi phân tích dữ liệu người dùng từ localStorage:', err);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getSafeUser(),
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token') && !!localStorage.getItem('user'),
  isLoading: false,
  error: null,
  isPro: () => {
    const user = getSafeUser();
    return user?.plan === 'pro' || user?.plan === 'enterprise';
  },

  // Hành động Đăng nhập
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.login({ email, password });

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ 
        token, 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Hành động Đăng nhập bằng Google
  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.googleLogin(idToken);

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ 
        token, 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập bằng Google thất bại';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Hành động Đăng ký
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(userData);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
