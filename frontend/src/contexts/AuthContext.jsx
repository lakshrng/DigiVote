import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
const login = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);

    if (response?.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, data: response };
    }

    // If API returns an explicit error field
    if (response?.error) {
      return { success: false, error: response.error };
    }

    // Fallback
    return { success: false, error: 'Invalid email or password' };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Invalid email or password',
    };
  }
};


  // Register
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (otpData) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyOTP(otpData);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
      }
      return { success: true, data: response };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'OTP verification failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Helpers
  const isVerified = () => user?.is_verified || false;
  const isAdmin = () => user?.is_admin || false;

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    verifyOTP,
    logout,
    isVerified,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
