import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import RegisterPage from '../../pages/RegisterPage';
import { renderWithProviders, mockUnauthenticated } from '../testUtils';

describe('RegisterPage - Visual Regression', () => {
  it('renders registration form step 1', () => {
    const { container } = renderWithProviders(<RegisterPage />, {
      authValue: mockUnauthenticated,
      route: '/register',
    });
    expect(container).toMatchSnapshot();
  });

  it('displays all registration fields', () => {
    renderWithProviders(<RegisterPage />, {
      authValue: mockUnauthenticated,
      route: '/register',
    });
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });
});
