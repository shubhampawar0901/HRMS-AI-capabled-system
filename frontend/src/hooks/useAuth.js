import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  loginUser,
  logoutUser,
  updateUserProfile,
  refreshUserData,
  clearError
} from '@/store/slices/authSlice';
import { authService } from '@/services/authService';

/**
 * Custom hook for authentication management
 * @returns {Object} Auth state and methods
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(state => state.auth);

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise} Login promise
   */
  const login = useCallback(async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [dispatch]);

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Update promise
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      const result = await dispatch(updateUserProfile(profileData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  /**
   * Check if user has specific role
   * @param {string|Array} roles - Role(s) to check
   * @returns {boolean} True if user has role
   */
  const hasRole = useCallback((roles) => {
    if (!user || !user.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }, [user]);

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} True if user has permission
   */
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    
    return user.permissions.includes(permission);
  }, [user]);

  /**
   * Refresh authentication state
   */
  const refreshAuth = useCallback(async () => {
    try {
      if (!authService.isAuthenticated()) return;

      const result = await dispatch(refreshUserData()).unwrap();
      return result;
    } catch (error) {
      console.error('Auth refresh error:', error);
      // If refresh fails, logout user
      logout();
    }
  }, [dispatch, logout]);

  /**
   * Clear auth error
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getStoredUser();
      
      if (storedToken && storedUser) {
        dispatch({
          type: 'auth/setAuthenticated',
          payload: {
            user: storedUser,
            token: storedToken,
            isAuthenticated: true
          }
        });
        
        // Refresh user data
        refreshAuth();
      }
    };
    
    initializeAuth();
  }, [dispatch, refreshAuth]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Methods
    login,
    logout,
    updateProfile,
    hasRole,
    hasPermission,
    refreshAuth,
    clearError: clearAuthError,
    
    // Computed values
    isAdmin: hasRole('admin'),
    isManager: hasRole(['admin', 'manager']),
    isEmployee: hasRole(['admin', 'manager', 'employee'])
  };
};

export default useAuth;
