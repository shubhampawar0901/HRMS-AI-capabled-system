import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

// Dashboard Components
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';

// Loading Component
const DashboardLoading = () => (
  <div className="space-y-6">
    <div className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
      ))}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user, isLoading, isAuthenticated, logout } = useAuthContext();

  // Debug logging
  console.log('Dashboard Debug:', {
    user,
    isLoading,
    isAuthenticated,
    localStorage_token: localStorage.getItem('token') ? 'exists' : 'null',
    localStorage_user: localStorage.getItem('user')
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <DashboardLoading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to HRMS Dashboard
          </h1>
          <p className="text-gray-600">
            Please log in to access your dashboard.
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold">Debug Info:</h3>
            <p>User: {user ? 'exists' : 'null'}</p>
            <p>IsAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
            <p>LocalStorage Token: {localStorage.getItem('token') ? 'exists' : 'null'}</p>
            <p>LocalStorage User: {localStorage.getItem('user') || 'null'}</p>
            <p>API Base URL: {process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  console.log('Testing API connection...');
                  fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/auth/health`)
                    .then(res => res.json())
                    .then(data => console.log('API Health:', data))
                    .catch(err => console.error('API Error:', err));
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Test API Connection
              </button>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Clear Auth & Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;
