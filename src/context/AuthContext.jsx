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

  // Firebase OTP Login
  const loginWithOTP = {
    sendOTP: async (phone) => {
      return await authService.sendOTP(phone);
    },
    verifyOTP: async (confirmationResult, otp, name, phone) => {
      const result = await authService.verifyOTP(
        confirmationResult,
        otp,
        name,
        phone
      );
      if (result.success) {
        setUser(result.user);
      }
      return result;
    }
  };

  // Test Login (development)
  const testLogin = async (phone, name) => {
    try {
      const result = await authService.testLogin(phone, name);

      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
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
    loginWithOTP,
    testLogin,
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