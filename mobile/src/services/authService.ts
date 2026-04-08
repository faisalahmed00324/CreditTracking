import api from './api';
import {
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  CreateUserResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  UserDto,
} from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/login', data);
    return res.data;
  },

  register: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    const res = await api.post<CreateUserResponse>('/user', data);
    return res.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const res = await api.post<VerifyOtpResponse>('/users/verifyotp', data);
    return res.data;
  },

  getCurrentUser: async (): Promise<UserDto> => {
    const res = await api.get('/user/getcurrentuser');
    return res.data?.user ?? res.data;
  },

  getUserById: async (id: string): Promise<UserDto> => {
    const res = await api.get(`/user/${id}`);
    return res.data?.user ?? res.data;
  },

  searchCustomers: async (searchText: string): Promise<UserDto[]> => {
    const res = await api.get(`/user/${searchText}`);
    return res.data?.users ?? res.data ?? [];
  },
};
