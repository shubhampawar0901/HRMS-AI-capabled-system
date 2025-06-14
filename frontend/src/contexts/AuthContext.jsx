import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely parse JSON from localStorage
  const safeParseJSON = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Failed to parse ${key} from localStorage:`, error);
      localStorage.removeItem(key);
      return null;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = safeParseJSON('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Clear any incomplete auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - memoized to prevent re-creation on every render
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      const responseData = response.data.data || response.data;
      const authToken = responseData.accessToken || responseData.token;
      const userData = responseData.user;

      if (!authToken || !userData) {
        throw new Error('Invalid response structure from server');
      }

      // Store in localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      if (responseData.refreshToken) {
        localStorage.setItem('refreshToken', responseData.refreshToken);
      }

      // Update state
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);

      return {
        token: authToken,
        user: userData,
        refreshToken: responseData.refreshToken
      };
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function - memoized to prevent re-creation on every render
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Call logout API (optional, continue even if it fails)
      try {
        await authService.logout();
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');

      // Clear state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user profile (local state only, no API call) - memoized
  const updateUserProfile = useCallback((updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }, [user]);

  // Clear error - memoized
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Role checking functions - memoized to prevent unnecessary re-calculations
  const hasRole = useCallback((roles) => {
    if (!user || !user.role) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role.toLowerCase());
    }
    return user.role.toLowerCase() === roles.toLowerCase();
  }, [user]);

  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  // Computed values - memoized to prevent infinite re-renders
  const isAdmin = useMemo(() => hasRole('admin'), [hasRole]);
  const isManager = useMemo(() => hasRole(['admin', 'manager']), [hasRole]);
  const isEmployee = useMemo(() => hasRole(['admin', 'manager', 'employee']), [hasRole]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Methods
    login,
    logout,
    updateUserProfile,
    clearError,
    hasRole,
    hasPermission,

    // Computed values
    isAdmin,
    isManager,
    isEmployee
  }), [
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUserProfile,
    clearError,
    hasRole,
    hasPermission,
    isAdmin,
    isManager,
    isEmployee
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
