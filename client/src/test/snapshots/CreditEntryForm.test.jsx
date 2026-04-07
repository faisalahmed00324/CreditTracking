import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import CreditEntryForm from '../../components/CreditEntryForm';
import { renderWithProviders, mockShopUser } from '../testUtils';

// Mock apiClient for CustomerSearch
vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { users: [] } }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('CreditEntryForm - Visual Regression', () => {
  it('renders empty form', () => {
    const { container } = renderWithProviders(
      <CreditEntryForm shopId="shop123" onSubmit={() => {}} loading={false} />,
      { authValue: mockShopUser }
    );
    expect(container).toMatchSnapshot();
  });

  it('renders form in loading state', () => {
    const { container } = renderWithProviders(
      <CreditEntryForm shopId="shop123" onSubmit={() => {}} loading={true} />,
      { authValue: mockShopUser }
    );
    expect(container).toMatchSnapshot();
  });
});
