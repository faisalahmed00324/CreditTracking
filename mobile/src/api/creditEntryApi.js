import apiClient from './client';

function normalizeCreditEntries(data) {
  return (
    data?.creditEntries?.data ||
    data?.CreditEntries?.data ||
    data?.items ||
    data?.data ||
    (Array.isArray(data) ? data : [])
  );
}

export async function getCreditEntriesByShopApi(shopId, pageIndex, pageSize) {
  const url = `/creditentry/getbyshopid?ShopId=${shopId}&PageIndex=${pageIndex}&PageSize=${pageSize}`;
  const { data } = await apiClient.get(url);
  return normalizeCreditEntries(data);
}

export async function getCreditEntriesByCustomerApi(customerId, pageIndex, pageSize) {
  const url = `/creditentry/getbycustomerid?CustomerId=${customerId}&PageIndex=${pageIndex}&PageSize=${pageSize}`;
  const { data } = await apiClient.get(url);
  return normalizeCreditEntries(data);
}

export async function createCreditEntryApi(payload) {
  const { data } = await apiClient.post('/creditentry', payload);
  return data;
}

export async function updateCreditEntryPaymentApi(payload) {
  const { data } = await apiClient.put('/creditentry', payload);
  return data;
}

export async function deleteCreditEntryApi(id) {
  const { data } = await apiClient.delete(`/creditentry/${id}`);
  return data;
}
