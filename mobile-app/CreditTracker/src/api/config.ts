import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the API - Update this based on your environment
// For local development with Android emulator, use 10.0.2.2:PORT
// For local development with iOS simulator, use localhost:PORT
// For production, use your actual server URL
export const API_BASE_URL = 'http://10.0.2.2:5289';

// Storage keys
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

// Helper function to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

// Helper function to set auth token
export const setAuthToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
};

// Helper function to remove auth token
export const removeAuthToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
};

// Helper function to store user data
export const setUserData = async (user: object): Promise<void> => {
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

// Helper function to get user data
export const getUserData = async (): Promise<object | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Helper function to remove user data
export const removeUserData = async (): Promise<void> => {
  await AsyncStorage.removeItem(USER_DATA_KEY);
};

// Clear all auth data
export const clearAuthData = async (): Promise<void> => {
  await removeAuthToken();
  await removeUserData();
};
