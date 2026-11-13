import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginApi, getCurrentUserApi, registerApi, verifyOtpApi } from '../api/authApi';

const AuthContext = createContext(null);

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const NAME_ID_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

export const ROLES = {
  SHOP: '1',
  CUSTOMER: '2',
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const extractUserFromToken = useCallback((jwt) => {
    const claims = parseJwt(jwt);
    return {
      id: claims[NAME_ID_CLAIM],
      role: claims[ROLE_CLAIM],
      email: claims[EMAIL_CLAIM],
    };
  }, []);

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (userName, password) => {
    setLoading(true);
    try {
      const data = await loginApi(userName, password);
      const jwt = data.token;
      localStorage.setItem('token', jwt);
      setToken(jwt);

      const tokenUser = extractUserFromToken(jwt);
      // Fetch full user profile
      const fullUser = await getCurrentUserApi({
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const merged = { ...fullUser, role: tokenUser.role, id: tokenUser.id };
      localStorage.setItem('user', JSON.stringify(merged));
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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCurrentUserApi();
      const tokenUser = token ? extractUserFromToken(token) : {};
      const merged = { ...data, role: tokenUser.role, id: tokenUser.id };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);
      return merged;
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, extractUserFromToken, logout]);

  const isShop = user?.role === ROLES.SHOP || user?.role === 'Shop';
  const isCustomer = user?.role === ROLES.CUSTOMER || user?.role === 'Customer';

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isShop,
    isCustomer,
    login,
    register,
    verifyOtp,
    logout,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
