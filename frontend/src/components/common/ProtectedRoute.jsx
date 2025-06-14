import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Protected Route Component
 * Handles role-based access control for routes
 */
const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  fallbackPath = '/login',
  showAccessDenied = true 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-sm text-gray-500 mb-6">
              You don't have permission to access this page. 
              {requiredRoles.length === 1 
                ? ` This page requires ${requiredRoles[0]} role.`
                : ` This page requires one of the following roles: ${requiredRoles.join(', ')}.`
              }
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                Current role: <span className="font-medium">{user?.role || 'Unknown'}</span>
              </p>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = user?.role ? `/${user.role}/dashboard` : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Render the protected content
  return children;
};

/**
 * Role-based Route Wrapper
 * Simplified wrapper for common role-based routing patterns
 */
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

export const ManagerRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['manager']}>
    {children}
  </ProtectedRoute>
);

export const EmployeeRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['employee']}>
    {children}
  </ProtectedRoute>
);

export const AdminManagerRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin', 'manager']}>
    {children}
  </ProtectedRoute>
);

export const AllRolesRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin', 'manager', 'employee']}>
    {children}
  </ProtectedRoute>
);

/**
 * Higher-order component for role-based access
 */
export const withRoleAccess = (Component, requiredRoles) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

/**
 * Hook for checking role access
 */
export const useRoleAccess = (requiredRoles = []) => {
  const { user, isAuthenticated } = useAuth();
  
  const hasAccess = isAuthenticated && (
    requiredRoles.length === 0 || 
    requiredRoles.includes(user?.role)
  );
  
  const hasRole = (role) => user?.role === role;
  
  const hasAnyRole = (roles) => roles.includes(user?.role);
  
  return {
    hasAccess,
    hasRole,
    hasAnyRole,
    userRole: user?.role,
    isAuthenticated
  };
};

export default ProtectedRoute;
