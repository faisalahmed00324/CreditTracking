import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/apiService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userName, password) => {
    try {
      const response = await authService.login(userName, password);
      const { token } = response;
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      
      // Fetch user details
      const userResponse = await authService.getCurrentUser();
      const userData = userResponse;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const verifyOtp = async (id, otp) => {
    try {
      const response = await authService.verifyOtp(id, otp);
      return { success: true, data: response };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'OTP verification failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isShop = () => user?.role === 1;
  const isCustomer = () => user?.role === 2;

  const value = {
    user,
    token,
    loading,
    login,
    register,
    verifyOtp,
    logout,
    isAuthenticated: !!token,
    isShop,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
