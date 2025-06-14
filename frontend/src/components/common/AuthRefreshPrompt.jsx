import React from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Component to prompt users to refresh their authentication
 * when they have old localStorage data without employeeId
 */
const AuthRefreshPrompt = ({ message, onRefresh }) => {
  const { logout } = useAuth();

  const handleRefresh = async () => {
    try {
      await logout();
      if (onRefresh) {
        onRefresh();
      } else {
        // Redirect to login page
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force refresh if logout fails
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Authentication Update Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {message || 'Your session data needs to be updated. Please logout and login again to access all features.'}
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleRefresh}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Logout and Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRefreshPrompt;
