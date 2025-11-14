import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const userData = authService.getUser();
        setUser(userData);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (phone, name) => {
    try {
      const result = await authService.login(phone, name);

      if (result.success) {
        setUser(result.user);
        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return { success: false };
    }
  };

  // Logout function
  const logout = async () => {
    await authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Refresh user data
  const refreshUser = async () => {
    const userData = await authService.fetchCurrentUser();
    setUser(userData);
  };

  const value = {
    user,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;