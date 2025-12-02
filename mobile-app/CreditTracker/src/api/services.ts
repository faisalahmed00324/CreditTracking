import {API_BASE_URL, getAuthToken} from './config';
import {
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  CreateUserResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  User,
  CreditEntry,
  CreateCreditEntryRequest,
  CreateCreditEntryResponse,
  UpdateCreditEntryRequest,
  UpdateCreditEntryResponse,
  DeleteCreditEntryResponse,
  PaginationRequest,
  PaginationResult,
} from '../types';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || 'An error occurred', response.status);
  }
  return response.json();
};

const getHeaders = async (
  includeAuth: boolean = false,
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Authentication API
export const authApi = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<LoginResponse>(response);
  },

  verifyOtp: async (request: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/verifyotp`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<VerifyOtpResponse>(response);
  },
};

// User API
export const userApi = {
  createUser: async (
    request: CreateUserRequest,
  ): Promise<CreateUserResponse> => {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<CreateUserResponse>(response);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/user/getcurrentuser`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return handleResponse<User>(response);
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return handleResponse<User>(response);
  },

  searchCustomers: async (searchText: string): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/user/${searchText}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return handleResponse<User[]>(response);
  },
};

// Credit Entry API
export const creditEntryApi = {
  create: async (
    request: CreateCreditEntryRequest,
  ): Promise<CreateCreditEntryResponse> => {
    const response = await fetch(`${API_BASE_URL}/creditentry`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify(request),
    });
    return handleResponse<CreateCreditEntryResponse>(response);
  },

  getById: async (id: string): Promise<CreditEntry> => {
    const response = await fetch(`${API_BASE_URL}/creditentry/${id}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return handleResponse<CreditEntry>(response);
  },

  getByCustomerId: async (
    customerId: string,
    pagination?: PaginationRequest,
  ): Promise<PaginationResult<CreditEntry>> => {
    const params = new URLSearchParams({
      CustomerId: customerId,
      ...(pagination?.pageIndex && {
        PageIndex: pagination.pageIndex.toString(),
      }),
      ...(pagination?.pageSize && {PageSize: pagination.pageSize.toString()}),
    });

    const response = await fetch(
      `${API_BASE_URL}/creditentry/getbycustomerid?${params}`,
      {
        method: 'GET',
        headers: await getHeaders(true),
      },
    );
    return handleResponse<PaginationResult<CreditEntry>>(response);
  },

  getByShopId: async (
    shopId: string,
    pagination?: PaginationRequest,
  ): Promise<PaginationResult<CreditEntry>> => {
    const params = new URLSearchParams({
      ShopId: shopId,
      ...(pagination?.pageIndex && {
        PageIndex: pagination.pageIndex.toString(),
      }),
      ...(pagination?.pageSize && {PageSize: pagination.pageSize.toString()}),
    });

    const response = await fetch(
      `${API_BASE_URL}/creditentry/getbyshopid?${params}`,
      {
        method: 'GET',
        headers: await getHeaders(true),
      },
    );
    return handleResponse<PaginationResult<CreditEntry>>(response);
  },

  update: async (
    request: UpdateCreditEntryRequest,
  ): Promise<UpdateCreditEntryResponse> => {
    const response = await fetch(`${API_BASE_URL}/creditentry`, {
      method: 'PUT',
      headers: await getHeaders(true),
      body: JSON.stringify(request),
    });
    return handleResponse<UpdateCreditEntryResponse>(response);
  },

  delete: async (id: string): Promise<DeleteCreditEntryResponse> => {
    const response = await fetch(`${API_BASE_URL}/creditentry/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(true),
    });
    return handleResponse<DeleteCreditEntryResponse>(response);
  },
};

export {ApiError};
