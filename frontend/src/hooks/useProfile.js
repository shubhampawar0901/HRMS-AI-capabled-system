import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { updateUserProfile, refreshUserData } from '@/store/slices/authSlice';

/**
 * Custom hook for user profile management
 * @returns {Object} Profile state and methods
 */
export const useProfile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector(state => state.auth);

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
   * Refresh user profile data
   * @returns {Promise} Refresh promise
   */
  const refreshProfile = useCallback(async () => {
    try {
      const result = await dispatch(refreshUserData()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  /**
   * Get user's full name
   * @returns {string} Formatted full name
   */
  const getFullName = useCallback(() => {
    if (!user) return '';
    return user.name || 'Unknown User';
  }, [user]);

  /**
   * Get user's initials
   * @returns {string} User initials
   */
  const getInitials = useCallback(() => {
    if (!user || !user.name) return 'U';
    
    return user.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }, [user]);

  /**
   * Check if profile is complete
   * @returns {boolean} True if profile has required fields
   */
  const isProfileComplete = useCallback(() => {
    if (!user) return false;
    
    const requiredFields = ['name', 'email'];
    return requiredFields.every(field => user[field] && user[field].trim());
  }, [user]);

  /**
   * Get profile completion percentage
   * @returns {number} Completion percentage (0-100)
   */
  const getProfileCompletionPercentage = useCallback(() => {
    if (!user) return 0;
    
    const allFields = ['name', 'email', 'phone', 'address', 'dateOfBirth', 'bio'];
    const completedFields = allFields.filter(field => user[field] && user[field].toString().trim());
    
    return Math.round((completedFields.length / allFields.length) * 100);
  }, [user]);

  /**
   * Get missing profile fields
   * @returns {Array} Array of missing field names
   */
  const getMissingFields = useCallback(() => {
    if (!user) return [];
    
    const allFields = [
      { key: 'name', label: 'Full Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'address', label: 'Address' },
      { key: 'dateOfBirth', label: 'Date of Birth' },
      { key: 'bio', label: 'Bio' }
    ];
    
    return allFields
      .filter(field => !user[field.key] || !user[field.key].toString().trim())
      .map(field => field.label);
  }, [user]);

  /**
   * Format user's role for display
   * @returns {string} Formatted role
   */
  const getFormattedRole = useCallback(() => {
    if (!user || !user.role) return 'Employee';
    
    return user.role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, [user]);

  /**
   * Get user's department
   * @returns {string} Department name
   */
  const getDepartment = useCallback(() => {
    return user?.department || 'Not Assigned';
  }, [user]);

  /**
   * Get user's employee ID
   * @returns {string} Employee ID
   */
  const getEmployeeId = useCallback(() => {
    return user?.employeeId || user?.id || 'N/A';
  }, [user]);

  return {
    // State
    user,
    isLoading,
    error,
    
    // Methods
    updateProfile,
    refreshProfile,
    
    // Computed values
    fullName: getFullName(),
    initials: getInitials(),
    isProfileComplete: isProfileComplete(),
    profileCompletionPercentage: getProfileCompletionPercentage(),
    missingFields: getMissingFields(),
    formattedRole: getFormattedRole(),
    department: getDepartment(),
    employeeId: getEmployeeId()
  };
};

export default useProfile;
