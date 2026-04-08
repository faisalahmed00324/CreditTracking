// ─── User Types ───────────────────────────────────────────────────────────────

export enum UserRole {
  Shop = 1,
  Customer = 2,
}

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  name: string;
  role: UserRole;
  icNoOrPassport: string;
  address: string;
  latitude: string;
  longitude: string;
  isVerified: boolean;
  isActive: boolean;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface VerifyOtpRequest {
  id: string;
  otp: string;
}

export interface VerifyOtpResponse {
  isSuccess: boolean;
}

export interface CreateUserRequest {
  name: string;
  userName: string;
  email: string;
  password: string;
  icNoOrPassport: string;
  address: string;
  latitude?: string;
  longitude?: string;
  role: UserRole;
}

export interface CreateUserResponse {
  id: string;
}

// ─── Credit Entry Types ───────────────────────────────────────────────────────

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
  paymentDate: string | null;
  isActive: boolean;
}

export interface CreateCreditEntryRequest {
  shopId: string;
  customerId: string;
  item: string;
  amount: number;
  date: string;
}

export interface UpdateCreditEntryRequest {
  id: string;
  item: string;
  amount: number;
  date: string;
  isPaid: boolean;
  paymentDate?: string | null;
}

export interface PaginationRequest {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyOtp: { userId: string };
  ShopTabs: undefined;
  CustomerTabs: undefined;
};

export type ShopTabParamList = {
  ShopDashboard: undefined;
  CreditEntries: undefined;
  CustomerSearch: undefined;
  Profile: undefined;
};

export type CustomerTabParamList = {
  CustomerDashboard: undefined;
  MyCreditEntries: undefined;
  Profile: undefined;
};

export type ShopStackParamList = {
  CreditEntryList: undefined;
  CreditEntryDetail: { id: string };
  CreateCreditEntry: undefined;
  EditCreditEntry: { entry: CreditEntry };
};
