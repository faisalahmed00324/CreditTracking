import React, {createContext, useContext, useState, useEffect} from 'react';
import {User} from '../types';
import {
  getAuthToken,
  setAuthToken,
  clearAuthData,
  setUserData,
  getUserData,
} from '../api/config';
import {authApi, userApi} from '../api/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userName: string, password: string) => Promise<void>;
  register: (user: User) => Promise<string>;
  verifyOtp: (id: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await getAuthToken();
      const storedUser = await getUserData();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser as User);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userName: string, password: string) => {
    const response = await authApi.login({userName, password});
    await setAuthToken(response.token);
    setToken(response.token);

    // Fetch current user details
    const currentUser = await userApi.getCurrentUser();
    await setUserData(currentUser);
    setUser(currentUser);
  };

  const register = async (userData: User): Promise<string> => {
    const response = await userApi.createUser({user: userData});
    return response.id;
  };

  const verifyOtp = async (id: string, otp: string): Promise<boolean> => {
    const response = await authApi.verifyOtp({id, otp});
    return response.isSuccess;
  };

  const logout = async () => {
    await clearAuthData();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (token) {
      const currentUser = await userApi.getCurrentUser();
      await setUserData(currentUser);
      setUser(currentUser);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    verifyOtp,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
