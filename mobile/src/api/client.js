import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://10.0.2.2:5034';

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
      if (typeof unauthorizedHandler === 'function') {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
