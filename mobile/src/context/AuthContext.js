import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { getCurrentUserApi, loginApi, registerApi, verifyOtpApi } from '../api/authApi';
import { setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const NAME_ID_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

export const ROLES = {
  SHOP: '1',
  CUSTOMER: '2',
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  const extractUserFromToken = useCallback((jwt) => {
    const claims = jwtDecode(jwt);
    return {
      id: claims[NAME_ID_CLAIM],
      role: claims[ROLE_CLAIM],
      email: claims[EMAIL_CLAIM],
    };
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async (existingToken) => {
    setLoading(true);
    try {
      const data = await getCurrentUserApi();
      const tokenUser = existingToken ? extractUserFromToken(existingToken) : {};
      const merged = { ...data, role: tokenUser.role, id: tokenUser.id };
      await AsyncStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);
      return merged;
    } catch {
      await logout();
      return null;
    } finally {
      setLoading(false);
    }
  }, [extractUserFromToken, logout]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet(['token', 'user']);
        const tokenValue = storedToken?.[1] || null;
        const userValue = storedUser?.[1] || null;
        if (tokenValue) {
          setToken(tokenValue);
          if (userValue) {
            setUser(JSON.parse(userValue));
          } else {
            await fetchCurrentUser(tokenValue);
          }
        }
      } finally {
        setHydrating(false);
      }
    };

    hydrate();
  }, [fetchCurrentUser]);

  const login = useCallback(async (userName, password) => {
    setLoading(true);
    try {
      const data = await loginApi(userName, password);
      const jwt = data.token;
      await AsyncStorage.setItem('token', jwt);
      setToken(jwt);

      const tokenUser = extractUserFromToken(jwt);
      const fullUser = await getCurrentUserApi({
        headers: { Authorization: `Bearer ${jwt}` },
      });

      const merged = { ...fullUser, role: tokenUser.role, id: tokenUser.id };
      await AsyncStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);
      return merged;
    } finally {
      setLoading(false);
    }
  }, [extractUserFromToken]);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      return await registerApi(userData);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (id, otp) => {
    setLoading(true);
    try {
      return await verifyOtpApi(id, otp);
    } finally {
      setLoading(false);
    }
  }, []);

  const isShop = user?.role === ROLES.SHOP || user?.role === 'Shop';
  const isCustomer = user?.role === ROLES.CUSTOMER || user?.role === 'Customer';

  const value = useMemo(() => ({
    user,
    token,
    loading,
    hydrating,
    isAuthenticated: !!token,
    isShop,
    isCustomer,
    login,
    register,
    verifyOtp,
    logout,
    fetchCurrentUser,
  }), [
    fetchCurrentUser,
    hydrating,
    isCustomer,
    isShop,
    loading,
    login,
    logout,
    register,
    token,
    user,
    verifyOtp,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
