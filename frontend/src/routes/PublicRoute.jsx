import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the public route
  return children;
};

export default PublicRoute;
