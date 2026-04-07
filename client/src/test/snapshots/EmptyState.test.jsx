import React from 'react';
import { describe, it, expect } from 'vitest';
import EmptyState from '../../components/EmptyState';
import { renderWithProviders } from '../testUtils';

describe('EmptyState - Visual Regression', () => {
  it('renders default empty state', () => {
    const { container } = renderWithProviders(
      <EmptyState title="No items found" description="Try adjusting your search." />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with action button', () => {
    const { container } = renderWithProviders(
      <EmptyState
        title="No credit entries"
        description="Create your first entry."
        actionLabel="Create Entry"
        onAction={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders without description', () => {
    const { container } = renderWithProviders(
      <EmptyState title="Nothing here" />
    );
    expect(container).toMatchSnapshot();
  });
});
