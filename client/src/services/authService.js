import apiClient from './api';

export const authService = {
  // Login
  login: async (username, password) => {
    const response = await apiClient.post('/login', {
      userName: username,
      password: password,
    });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await apiClient.post('/user', {
      user: userData,
    });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (userId, otp) => {
    const response = await apiClient.post('/verifyotp', {
      userId,
      otp,
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/user/current');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },

  // Search customers
  searchCustomers: async (searchTerm) => {
    const response = await apiClient.get('/user/search', {
      params: { searchTerm },
    });
    return response.data;
  },
};
