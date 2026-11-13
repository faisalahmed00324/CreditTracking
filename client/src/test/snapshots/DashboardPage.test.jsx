import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import DashboardPage from '../../pages/DashboardPage';
import { renderWithProviders, mockShopUser, mockCustomerUser } from '../testUtils';

// Mock apiClient to prevent actual API calls
vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        creditEntries: { data: [], count: 0, pageIndex: 1, pageSize: 100 },
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

describe('DashboardPage - Visual Regression', () => {
  it('renders shop dashboard loading state', () => {
    const { container } = renderWithProviders(<DashboardPage />, {
      authValue: mockShopUser,
      route: '/dashboard',
    });
    expect(container).toMatchSnapshot();
  });

  it('renders customer dashboard loading state', () => {
    const { container } = renderWithProviders(<DashboardPage />, {
      authValue: mockCustomerUser,
      route: '/dashboard',
    });
    expect(container).toMatchSnapshot();
  });

  it('displays loading indicator initially for shop', () => {
    renderWithProviders(<DashboardPage />, {
      authValue: mockShopUser,
      route: '/dashboard',
    });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders dashboard content after loading for shop', async () => {
    const { container } = renderWithProviders(<DashboardPage />, {
      authValue: mockShopUser,
      route: '/dashboard',
    });
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('renders dashboard content after loading for customer', async () => {
    const { container } = renderWithProviders(<DashboardPage />, {
      authValue: mockCustomerUser,
      route: '/dashboard',
    });
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
