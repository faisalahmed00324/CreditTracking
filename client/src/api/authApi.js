import apiClient from './client';

export async function loginApi(userName, password) {
  const { data } = await apiClient.post('/login', { userName, password });
  return data;
}

export async function getCurrentUserApi(config) {
  const { data } = await apiClient.get('/user/getcurrentuser', config);
  return data;
}

export async function registerApi(userData) {
  const { data } = await apiClient.post('/user', {
    user: {
      id: '',
      userName: userData.userName,
      password: userData.password,
      name: userData.name,
      ICNoOrPassport: userData.iCNoOrPassport || userData.icNoOrPassport || '',
      role: 2,
      email: userData.email,
      address: userData.address,
      latitude: userData.latitude || '',
      longitude: userData.longitude || '',
    },
  });
  return data;
}

export async function verifyOtpApi(id, otp) {
  const { data } = await apiClient.post('/users/verifyotp', { id, otp });
  return data;
}
