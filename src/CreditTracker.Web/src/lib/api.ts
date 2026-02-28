import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// --- Auth ---
export const loginApi = (userName: string, password: string) =>
  apiClient.post<{ token: string }>('/login', { userName, password });

export const verifyOtpApi = (id: string, otp: string) =>
  apiClient.post<{ isSuccess: boolean }>('/users/verifyotp', { id, otp });

// --- Users ---
export interface UserDto {
  id: string;
  userName: string;
  password: string;
  name: string;
  iCNoOrPassport: string;
  role: number;
  email: string;
  address: string;
  latitude: string;
  longitude: string;
}

export const createUserApi = (user: Partial<UserDto>) =>
  apiClient.post<{ id: string }>('/user', { user });

export const getCurrentUserApi = () =>
  apiClient.get<{ user: UserDto }>('/user/getcurrentuser');

export const getUserByIdApi = (id: string) =>
  apiClient.get<{ user: UserDto }>(`/user/${id}`);

export const searchCustomersApi = (searchText: string) =>
  apiClient.get<{ users: UserDto[] }>(`/user/${searchText}`);

// --- Credit Entries ---
export interface CreditEntryDto {
  id: string;
  shopId: string;
  shopName: string;
  customerId: string;
  customerName: string;
  item: string;
  amount: number;
  date: string;
  isPaid: boolean;
  paymentDate: string | null;
}

export interface PaginationResult<T> {
  data: T[];
  pageIndex: number;
  pageSize: number;
  count: number;
}

export const createCreditEntryApi = (data: {
  shopId: string;
  customerId: string;
  item: string;
  amount: number;
  date: string;
  isPaid: boolean;
  paymentDate?: string | null;
}) => apiClient.post<{ id: string }>('/creditentry', data);

export const deleteCreditEntryApi = (id: string) =>
  apiClient.delete<{ isSuccess: boolean }>(`/creditentry/${id}`);

export const getCreditEntriesByCustomerApi = (customerId: string, pageIndex = 0, pageSize = 10) =>
  apiClient.get<{ creditEntries: PaginationResult<CreditEntryDto> }>(
    `/creditentry/getbycustomerid?CustomerId=${customerId}&pageIndex=${pageIndex + 1}&pageSize=${pageSize}`
  );

export const getCreditEntriesByShopApi = (shopId: string, pageIndex = 0, pageSize = 10) =>
  apiClient.get<{ creditEntries: PaginationResult<CreditEntryDto> }>(
    `/creditentry/getbyshopid?ShopId=${shopId}&pageIndex=${pageIndex + 1}&pageSize=${pageSize}`
  );

export const getCreditEntryApi = (id: string) =>
  apiClient.get<{ creditEntry: CreditEntryDto }>(`/creditentry/${id}`);

export const updateCreditEntryApi = (id: string, isPaid: boolean, paymentDate: string) =>
  apiClient.put<{ isSuccess: boolean }>('/creditentry', { id, isPaid, paymentDate });
