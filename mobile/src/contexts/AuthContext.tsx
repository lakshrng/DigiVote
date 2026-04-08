import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';

// Type definitions
interface User {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface OTPData {
  user_id: string;
  code: string;
  otp_type: 'email' | 'phone';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; data?: any; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; data?: any; error?: string }>;
  verifyOTP: (otpData: OTPData) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<void>;
  isVerified: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await storage.getItem('user');
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await storage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);

      if (response?.user) {
        await storage.setItem('user', response.user);
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
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid email or password',
      };
    }
  };

  // Register
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (error: any) {
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
  const verifyOTP = async (otpData: OTPData) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyOTP(otpData);
      if (response.user) {
        await storage.setItem('user', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      }
      return { success: true, data: response };
    } catch (error: any) {
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
      await storage.removeItem('user');
      await storage.removeItem('student');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Helpers
  const isVerified = (): boolean => user?.is_verified || false;
  const isAdmin = (): boolean => user?.is_admin || false;

  const value: AuthContextType = {
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

