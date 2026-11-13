import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import LoginPage from '../../pages/LoginPage';
import { renderWithProviders, mockUnauthenticated } from '../testUtils';

describe('LoginPage - Visual Regression', () => {
  it('renders login form in default state', () => {
    const { container } = renderWithProviders(<LoginPage />, {
      authValue: mockUnauthenticated,
      route: '/login',
    });
    expect(container).toMatchSnapshot();
  });

  it('displays form fields correctly', () => {
    renderWithProviders(<LoginPage />, {
      authValue: mockUnauthenticated,
      route: '/login',
    });
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });
});
