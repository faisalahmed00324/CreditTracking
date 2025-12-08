import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole !== undefined && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard if wrong role
    if (user?.role === 0) {
      return <Navigate to="/shop/dashboard" replace />;
    } else {
      return <Navigate to="/customer/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
