import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, studentAPI } from '../services/api';

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
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        const studentData = localStorage.getItem('student');

        if (userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          
          if (studentData) {
            setStudent(JSON.parse(studentData));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('student');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.user) {
        // Store user data without token (since we're not using JWT)
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        // If student data is included, store it
        if (response.student) {
          localStorage.setItem('student', JSON.stringify(response.student));
          setStudent(response.student);
        }
        
        return { success: true, data: response };
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Registration failed' 
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
        error: error.response?.data?.error || error.message || 'OTP verification failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Create student profile
  const createStudentProfile = async (studentData) => {
    try {
      setLoading(true);
      // Add user_id to the request
      const requestData = {
        ...studentData,
        user_id: user?.id
      };
      const response = await studentAPI.createProfile(requestData);
      
      if (response.student) {
        localStorage.setItem('student', JSON.stringify(response.student));
        setStudent(response.student);
      }
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Student profile creation error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Student profile creation failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if needed
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('user');
      localStorage.removeItem('student');
      
      setUser(null);
      setStudent(null);
      setIsAuthenticated(false);
    }
  };

  // Check if user is verified
  const isVerified = () => {
    return user?.is_verified || false;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.is_admin || false;
  };

  // Check if user has student profile
  const hasStudentProfile = () => {
    return student !== null;
  };

  const value = {
    user,
    student,
    isAuthenticated,
    loading,
    login,
    register,
    verifyOTP,
    createStudentProfile,
    logout,
    isVerified,
    isAdmin,
    hasStudentProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
