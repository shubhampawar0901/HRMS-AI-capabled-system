import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <LoadingSpinner
        fullScreen={true}
        size="xl"
        text="Checking authentication..."
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Required roles: {requiredRoles.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
