export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount || 0);
}

export function formatDate(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

export function toInputDate(dateValue = new Date()) {
  const date = new Date(dateValue);
  return date.toISOString().split('T')[0];
}
