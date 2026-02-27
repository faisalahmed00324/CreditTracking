import api from './api';
import {
  CreditEntry,
  CreateCreditEntryRequest,
  UpdateCreditEntryRequest,
  PaginationRequest,
  PaginatedResult,
} from '../types';

export const creditEntryService = {
  create: async (data: CreateCreditEntryRequest): Promise<{ id: string }> => {
    const res = await api.post('/creditentry', data);
    return res.data;
  },

  getById: async (id: string): Promise<CreditEntry> => {
    const res = await api.get(`/creditentry/${id}`);
    return res.data?.creditEntry ?? res.data;
  },

  getByShopId: async (
    shopId: string,
    pagination: PaginationRequest
  ): Promise<PaginatedResult<CreditEntry>> => {
    const res = await api.get('/creditentry/getbyshopid', {
      params: { shopId, ...pagination },
    });
    return res.data;
  },

  getByCustomerId: async (
    customerId: string,
    pagination: PaginationRequest
  ): Promise<PaginatedResult<CreditEntry>> => {
    const res = await api.get('/creditentry/getbycustomerid', {
      params: { customerId, ...pagination },
    });
    return res.data;
  },

  update: async (data: UpdateCreditEntryRequest): Promise<{ isSuccess: boolean }> => {
    const res = await api.put('/creditentry', data);
    return res.data;
  },

  delete: async (id: string): Promise<{ isSuccess: boolean }> => {
    const res = await api.delete(`/creditentry/${id}`);
    return res.data;
  },
};
