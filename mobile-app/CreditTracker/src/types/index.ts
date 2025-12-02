// User and Authentication Types
export enum Role {
  Shop = 1,
  Customer = 2,
}

export interface User {
  id: string;
  userName: string;
  password?: string;
  name: string;
  icNoOrPassport: string;
  role: Role;
  email: string;
  address: string;
  latitude: string;
  longitude: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CreateUserRequest {
  user: User;
}

export interface CreateUserResponse {
  id: string;
}

export interface VerifyOtpRequest {
  id: string;
  otp: string;
}

export interface VerifyOtpResponse {
  isSuccess: boolean;
}

// Credit Entry Types
export interface CreditEntry {
  id: string;
  shopId: string;
  shopName: string;
  customerId: string;
  customerName: string;
  item: string;
  amount: number;
  date: string;
  isPaid: boolean;
  paymentDate?: string;
}

export interface CreateCreditEntryRequest {
  shopId: string;
  customerId: string;
  item: string;
  amount: number;
  date: string;
  isPaid: boolean;
  paymentDate?: string;
}

export interface CreateCreditEntryResponse {
  id: string;
}

export interface UpdateCreditEntryRequest {
  id: string;
  isPaid: boolean;
  paymentDate: string;
}

export interface UpdateCreditEntryResponse {
  isSuccess: boolean;
}

export interface DeleteCreditEntryResponse {
  isSuccess: boolean;
}

// Pagination Types
export interface PaginationRequest {
  pageIndex?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

// API Response Types
export interface GetCreditEntriesResponse {
  creditEntries: PaginationResult<CreditEntry>;
}

export interface GetCreditEntryResponse {
  creditEntry: CreditEntry;
}

export interface GetUserResponse {
  user: User;
}

export interface SearchCustomerResponse {
  users: User[];
}
