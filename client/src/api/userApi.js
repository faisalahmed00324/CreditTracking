import apiClient from './client';

export async function searchCustomersApi(searchText) {
  const { data } = await apiClient.get(`/user/search/${encodeURIComponent(searchText)}`);
  const users = data?.users ?? data?.Users ?? data;
  return Array.isArray(users) ? users : [];
}
