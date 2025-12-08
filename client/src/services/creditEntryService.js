import apiClient from './api';

export const creditEntryService = {
  // Create credit entry
  createCreditEntry: async (entryData) => {
    const response = await apiClient.post('/creditentry', entryData);
    return response.data;
  },

  // Get credit entry by ID
  getCreditEntry: async (id) => {
    const response = await apiClient.get(`/creditentry/${id}`);
    return response.data;
  },

  // Update credit entry
  updateCreditEntry: async (id, entryData) => {
    const response = await apiClient.put(`/creditentry/${id}`, entryData);
    return response.data;
  },

  // Delete credit entry
  deleteCreditEntry: async (id) => {
    const response = await apiClient.delete(`/creditentry/${id}`);
    return response.data;
  },

  // Get credit entries by shop
  getCreditEntriesByShop: async (shopId, page = 1, pageSize = 10) => {
    const response = await apiClient.get(`/creditentry/shop/${shopId}`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  // Get credit entries by customer
  getCreditEntriesByCustomer: async (customerId, page = 1, pageSize = 10) => {
    const response = await apiClient.get(`/creditentry/customer/${customerId}`, {
      params: { page, pageSize },
    });
    return response.data;
  },
};
