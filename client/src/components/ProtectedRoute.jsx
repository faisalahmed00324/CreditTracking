import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import { useAuth, ROLES } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user) {
    const userRole = user.role;
    const hasRole = allowedRoles.some(
      (r) => r === userRole || (r === 'Shop' && userRole === ROLES.SHOP) || (r === 'Customer' && userRole === ROLES.CUSTOMER)
    );
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
