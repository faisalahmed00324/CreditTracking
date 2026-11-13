import React from 'react';
import { describe, it, expect } from 'vitest';
import CreditEntryCard from '../../components/CreditEntryCard';
import { renderWithProviders } from '../testUtils';

const unpaidEntry = {
  id: 'entry1',
  shopId: 'shop1',
  shopName: 'ABC Shop',
  customerId: 'cust1',
  customerName: 'John Doe',
  item: 'Widget Pro',
  amount: 150.5,
  date: '2024-06-15T10:00:00Z',
  isPaid: false,
  paymentDate: null,
};

const paidEntry = {
  ...unpaidEntry,
  id: 'entry2',
  isPaid: true,
  paymentDate: '2024-07-01T14:00:00Z',
};

describe('CreditEntryCard - Visual Regression', () => {
  it('renders unpaid entry as shop owner', () => {
    const { container } = renderWithProviders(
      <CreditEntryCard
        entry={unpaidEntry}
        isShop={true}
        onUpdate={() => {}}
        onDelete={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders paid entry as shop owner', () => {
    const { container } = renderWithProviders(
      <CreditEntryCard
        entry={paidEntry}
        isShop={true}
        onUpdate={() => {}}
        onDelete={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders unpaid entry as customer', () => {
    const { container } = renderWithProviders(
      <CreditEntryCard entry={unpaidEntry} isShop={false} />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders paid entry as customer', () => {
    const { container } = renderWithProviders(
      <CreditEntryCard entry={paidEntry} isShop={false} />
    );
    expect(container).toMatchSnapshot();
  });
});
