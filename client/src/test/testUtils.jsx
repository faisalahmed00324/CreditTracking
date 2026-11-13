import React from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * Renders a component wrapped in all required providers for testing.
 */
export function renderWithProviders(
  ui,
  {
    authValue = {
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      isShop: false,
      isCustomer: false,
      login: vi.fn(),
      register: vi.fn(),
      verifyOtp: vi.fn(),
      logout: vi.fn(),
      fetchCurrentUser: vi.fn(),
    },
    route = '/',
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <ChakraProvider>
        <MemoryRouter initialEntries={[route]}>
          <AuthContext.Provider value={authValue}>
            {children}
          </AuthContext.Provider>
        </MemoryRouter>
      </ChakraProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export const mockShopUser = {
  user: {
    id: 'shop123',
    userName: 'shopowner',
    name: 'Shop Owner',
    email: 'shop@email.com',
    role: '1',
  },
  token: 'mock-token',
  loading: false,
  isAuthenticated: true,
  isShop: true,
  isCustomer: false,
  login: vi.fn(),
  register: vi.fn(),
  verifyOtp: vi.fn(),
  logout: vi.fn(),
  fetchCurrentUser: vi.fn(),
};

export const mockCustomerUser = {
  user: {
    id: 'cust123',
    userName: 'customer1',
    name: 'Test Customer',
    email: 'customer@email.com',
    role: '2',
  },
  token: 'mock-token',
  loading: false,
  isAuthenticated: true,
  isShop: false,
  isCustomer: true,
  login: vi.fn(),
  register: vi.fn(),
  verifyOtp: vi.fn(),
  logout: vi.fn(),
  fetchCurrentUser: vi.fn(),
};

export const mockUnauthenticated = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  isShop: false,
  isCustomer: false,
  login: vi.fn(),
  register: vi.fn(),
  verifyOtp: vi.fn(),
  logout: vi.fn(),
  fetchCurrentUser: vi.fn(),
};
