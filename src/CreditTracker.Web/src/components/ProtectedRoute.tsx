import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRole?: 'Shop' | 'Customer';
}

export function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'Shop' ? '/shop/dashboard' : '/customer/dashboard'} replace />;
  }
  return <Outlet />;
}
