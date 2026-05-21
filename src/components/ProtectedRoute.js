import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    // Members go back to their dashboard, others see unauthorized
    return <Navigate to={user?.role === 'Member' ? '/dashboard' : '/unauthorized'} replace />;
  }

  return children;
};

export default ProtectedRoute;
