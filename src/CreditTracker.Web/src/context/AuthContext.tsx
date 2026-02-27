import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  exp: number;
}

interface AuthUser {
  id: string;
  role: 'Shop' | 'Customer';
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isShop: boolean;
  isCustomer: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(null);

  function parseToken(t: string): AuthUser | null {
    try {
      const decoded = jwtDecode<JwtPayload>(t);
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as 'Shop' | 'Customer';
      return { id: decoded.sub, role };
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (token) {
      setUser(parseToken(token));
    } else {
      setUser(null);
    }
  }, [token]);

  function login(newToken: string) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isShop: user?.role === 'Shop',
        isCustomer: user?.role === 'Customer',
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
