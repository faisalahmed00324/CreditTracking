import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import CreditEntriesPage from '../../pages/CreditEntriesPage';
import { renderWithProviders, mockShopUser, mockCustomerUser } from '../testUtils';

// Mock apiClient
vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        creditEntries: {
          data: [
            {
              id: 'e1',
              shopId: 'shop123',
              shopName: 'ABC Shop',
              customerId: 'cust123',
              customerName: 'John Doe',
              item: 'Widget',
              amount: 50.0,
              date: '2024-06-15T10:00:00Z',
              isPaid: false,
              paymentDate: null,
            },
          ],
          count: 1,
          pageIndex: 1,
          pageSize: 10,
        },
      },
    }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('CreditEntriesPage - Visual Regression', () => {
  it('renders loading state for shop', () => {
    const { container } = renderWithProviders(<CreditEntriesPage />, {
      authValue: mockShopUser,
      route: '/credit-entries',
    });
    expect(container).toMatchSnapshot();
  });

  it('renders loading state for customer', () => {
    const { container } = renderWithProviders(<CreditEntriesPage />, {
      authValue: mockCustomerUser,
      route: '/credit-entries',
    });
    expect(container).toMatchSnapshot();
  });
});
