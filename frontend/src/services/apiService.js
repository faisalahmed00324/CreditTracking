import api from './api';

// Authentication Services
export const authService = {
  // Register new user (Customer)
  register: async (userData) => {
    const response = await api.post('/user', { user: userData });
    return response.data;
  },

  // Login
  login: async (userName, password) => {
    const response = await api.post('/login', { userName, password });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (id, otp) => {
    const response = await api.post('/users/verifyotp', { id, otp });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/user/getcurrentuser');
    return response.data;
  },
};

// User Services
export const userService = {
  // Get user by ID (Shop only)
  getUserById: async (id) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },

  // Search customers (Shop only)
  searchCustomers: async (searchText) => {
    const response = await api.get(`/user/${searchText}`);
    return response.data;
  },
};

// Credit Entry Services
export const creditEntryService = {
  // Create credit entry (Shop only)
  createCreditEntry: async (entryData) => {
    const response = await api.post('/creditentry', entryData);
    return response.data;
  },

  // Update credit entry (Shop only)
  updateCreditEntry: async (id, isPaid, paymentDate) => {
    const response = await api.put('/creditentry', { id, isPaid, paymentDate });
    return response.data;
  },

  // Delete credit entry (Shop only)
  deleteCreditEntry: async (id) => {
    const response = await api.delete(`/creditentry/${id}`);
    return response.data;
  },

  // Get credit entry by ID
  getCreditEntry: async (id) => {
    const response = await api.get(`/creditentry/${id}`);
    return response.data;
  },

  // Get credit entries by shop (Shop only)
  getCreditEntriesByShop: async (shopId, pageNumber = 1, pageSize = 10) => {
    const response = await api.get('/creditentry/getbyshopid', {
      params: { ShopId: shopId, PageNumber: pageNumber, PageSize: pageSize },
    });
    return response.data;
  },

  // Get credit entries by customer (Customer only)
  getCreditEntriesByCustomer: async (customerId, pageNumber = 1, pageSize = 10) => {
    const response = await api.get('/creditentry/getbycustomerid', {
      params: { CustomerId: customerId, PageNumber: pageNumber, PageSize: pageSize },
    });
    return response.data;
  },
};
