import { STORAGE_KEYS } from '../utils/constants';
import apiService from './api';

const authService = {
  // Get auth token from localStorage
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Set auth token
  setToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  // Get user data
  getUser: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  // Set user data
  setUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getToken();
  },

  // Login (test version - no Firebase yet)
  login: async (phone, name) => {
    try {
      const response = await apiService.testRegister({
        phone,
        name,
        user_type: 'customer'
      });

      const { token, user } = response.data;
      authService.setToken(token);
      authService.setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.CART);
    }
  },

  // Get current user from API
  fetchCurrentUser: async () => {
    try {
      const response = await apiService.getCurrentUser();
      const user = response.data;
      authService.setUser(user);
      return user;
    } catch (error) {
      authService.logout();
      return null;
    }
  }
};

export default authService;