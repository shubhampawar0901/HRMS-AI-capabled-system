import { useCallback } from 'react';
import { useLeaveState, useLeaveDispatch, LEAVE_ACTIONS } from '@/contexts/LeaveContext';
import { useAuth } from '@/hooks/useAuth';
import { leaveService } from '@/services/leaveService';

/**
 * Custom hook for leave management
 * Provides all leave-related functionality with proper error handling and loading states
 */
export function useLeave() {
  const state = useLeaveState();
  const dispatch = useLeaveDispatch();
  const { user } = useAuth();

  // Helper function to handle API errors
  const handleApiError = useCallback((error, defaultMessage = 'An error occurred') => {
    const errorMessage = error?.response?.data?.message || error?.message || defaultMessage;
    dispatch({
      type: LEAVE_ACTIONS.SET_ERROR,
      payload: errorMessage
    });
    console.error('Leave API Error:', error);
  }, [dispatch]);

  // Clear error messages
  const clearError = useCallback(() => {
    dispatch({ type: LEAVE_ACTIONS.CLEAR_ERROR });
  }, [dispatch]);

  // ==========================================
  // LEAVE APPLICATIONS
  // ==========================================

  // Load leave applications (role-based)
  const loadApplications = useCallback(async (params = {}) => {
    try {
      dispatch({
        type: LEAVE_ACTIONS.SET_LOADING,
        payload: { isLoading: true }
      });

      // Ensure proper default values and clean parameters
      const cleanParams = {
        status: params.status || 'all',
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.leaveType && params.leaveType !== 'all' && { leaveType: params.leaveType }),
        ...(params.dateRange && params.dateRange !== null && { dateRange: params.dateRange }),
        ...(params.employeeId && params.employeeId !== null && { employeeId: params.employeeId }),
        ...(params.search && params.search !== '' && { search: params.search })
      };

      const response = await leaveService.getLeaveRequests(cleanParams);

      if (response && response.success) {
        dispatch({
          type: LEAVE_ACTIONS.SET_APPLICATIONS,
          payload: {
            applications: response.data.applications || [],
            pagination: response.data.pagination || state.pagination
          }
        });
      } else {
        throw new Error(response.message || 'Failed to load applications');
      }
    } catch (error) {
      handleApiError(error, 'Failed to load leave applications');
    } finally {
      dispatch({
        type: LEAVE_ACTIONS.SET_LOADING,
        payload: { isLoading: false }
      });
    }
  }, [dispatch, handleApiError]);

  // Apply for leave
  const applyLeave = useCallback(async (leaveData) => {
    try {
      dispatch({ 
        type: LEAVE_ACTIONS.SET_LOADING, 
        payload: { isSubmitting: true } 
      });

      const response = await leaveService.applyLeave(leaveData);

      if (response && response.success) {
        dispatch({
          type: LEAVE_ACTIONS.ADD_APPLICATION,
          payload: response.data.application
        });

        // Refresh applications list
        await loadApplications();

        return response.data.application;
      } else {
        throw new Error(response.message || 'Failed to submit leave application');
      }
    } catch (error) {
      handleApiError(error, 'Failed to submit leave application');
      throw error;
    }
  }, [dispatch, handleApiError, loadApplications]);

  // Cancel leave application
  const cancelApplication = useCallback(async (applicationId) => {
    try {
      dispatch({ 
        type: LEAVE_ACTIONS.SET_LOADING, 
        payload: { isSubmitting: true } 
      });

      const response = await leaveService.cancelLeave(applicationId);

      if (response && response.success) {
        dispatch({
          type: LEAVE_ACTIONS.UPDATE_APPLICATION,
          payload: response.data.application
        });

        return response.data.application;
      } else {
        throw new Error(response.message || 'Failed to cancel leave application');
      }
    } catch (error) {
      handleApiError(error, 'Failed to cancel leave application');
      throw error;
    }
  }, [dispatch, handleApiError]);

  // ==========================================
  // LEAVE BALANCE
  // ==========================================

  // Load leave balance
  const loadBalance = useCallback(async (year = new Date().getFullYear()) => {
    try {
      // Clear any previous errors
      dispatch({ type: LEAVE_ACTIONS.CLEAR_ERROR });

      dispatch({
        type: LEAVE_ACTIONS.SET_LOADING,
        payload: { isLoading: true }
      });

      const response = await leaveService.getLeaveBalance(year);

      // The apiRequest wrapper transforms the response structure
      // response contains the full backend response
      if (response && response.success) {
        dispatch({
          type: LEAVE_ACTIONS.SET_BALANCE,
          payload: response.data || []
        });
      } else {
        throw new Error(response.message || 'Failed to load leave balance');
      }
    } catch (error) {
      handleApiError(error, 'Failed to load leave balance');
    } finally {
      dispatch({
        type: LEAVE_ACTIONS.SET_LOADING,
        payload: { isLoading: false }
      });
    }
  }, [dispatch, handleApiError]);

  // ==========================================
  // LEAVE TYPES
  // ==========================================

  // Load leave types
  const loadLeaveTypes = useCallback(async () => {
    try {
      dispatch({ 
        type: LEAVE_ACTIONS.SET_LOADING, 
        payload: { isLoading: true } 
      });

      const response = await leaveService.getLeaveTypes();

      if (response && response.success) {
        dispatch({
          type: LEAVE_ACTIONS.SET_LEAVE_TYPES,
          payload: response.data || []
        });
      } else {
        throw new Error(response.message || 'Failed to load leave types');
      }
    } catch (error) {
      handleApiError(error, 'Failed to load leave types');
    }
  }, [dispatch, handleApiError]);

  // ==========================================
  // LEAVE CALENDAR
  // ==========================================

  // Load leave calendar
  const loadCalendar = useCallback(async (params = {}) => {
    try {
      dispatch({ 
        type: LEAVE_ACTIONS.SET_LOADING, 
        payload: { isLoading: true } 
      });

      const response = await leaveService.getLeaveCalendar(params);

      if (response && response.success) {
        dispatch({
          type: LEAVE_ACTIONS.SET_CALENDAR,
          payload: response.data || []
        });
      } else {
        throw new Error(response.message || 'Failed to load leave calendar');
      }
    } catch (error) {
      handleApiError(error, 'Failed to load leave calendar');
    }
  }, [dispatch, handleApiError]);

  // ==========================================
  // TEAM MANAGEMENT (MANAGERS/ADMIN)
  // ==========================================

  // Load team leave applications (managers only)
  const loadTeamApplications = useCallback(async (params = {}) => {
    if (!['manager', 'admin'].includes(user?.role)) {
      return;
    }

    try {
      dispatch({
        type: LEAVE_ACTIONS.SET_LOADING,
        payload: { isLoading: true }
      });

      // Ensure proper default values and clean parameters
      const cleanParams = {
        status: params.status || 'all',
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.leaveType && params.leaveType !== 'all' && { leaveType: params.leaveType }),
        ...(params.dateRange && params.dateRange !== null && { dateRange: params.dateRange }),
        ...(params.employeeId && params.employeeId !== null && { employeeId: params.employeeId }),
        ...(params.search && params.search !== '' && { search: params.search })
      };

      const response = await leaveService.getTeamLeaveRequests(cleanParams);

      if (response && response.success) {
        dispatch({
          type: LEAVE_ACTIONS.SET_TEAM_APPLICATIONS,
          payload: {
            applications: response.data.applications || [],
            pagination: response.data.pagination || state.pagination
          }
        });
      } else {
        throw new Error(response.message || 'Failed to load team applications');
      }
    } catch (error) {
      handleApiError(error, 'Failed to load team leave applications');
    } finally {
      dispatch({
        type: LEAVE_ACTIONS.SET_LOADING,
        payload: { isLoading: false }
      });
    }
  }, [dispatch, handleApiError, user?.role]);

  // Process leave application (approve/reject)
  const processApplication = useCallback(async (applicationId, action, comments = '') => {
    if (!['manager', 'admin'].includes(user?.role)) {
      return;
    }

    try {
      dispatch({
        type: LEAVE_ACTIONS.SET_LOADING,
        payload: { isSubmitting: true }
      });

      const response = await leaveService.processLeaveApplication(applicationId, {
        status: action, // API expects 'status' field, not 'action'
        comments
      });

      if (response && response.success) {
        dispatch({
          type: LEAVE_ACTIONS.UPDATE_TEAM_APPLICATION,
          payload: response.data.application
        });

        return response.data.application;
      } else {
        throw new Error(response.message || `Failed to ${action} leave application`);
      }
    } catch (error) {
      handleApiError(error, `Failed to ${action} leave application`);
      throw error;
    }
  }, [dispatch, handleApiError, user?.role]);

  // ==========================================
  // FILTERS AND PAGINATION
  // ==========================================

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    dispatch({
      type: LEAVE_ACTIONS.SET_FILTERS,
      payload: newFilters
    });
  }, [dispatch]);

  // Reset filters
  const resetFilters = useCallback(() => {
    dispatch({ type: LEAVE_ACTIONS.RESET_FILTERS });
  }, [dispatch]);

  // Update pagination
  const updatePagination = useCallback((paginationData) => {
    dispatch({
      type: LEAVE_ACTIONS.SET_PAGINATION,
      payload: paginationData
    });
  }, [dispatch]);

  // Go to specific page
  const goToPage = useCallback((page) => {
    updatePagination({ currentPage: page });
  }, [updatePagination]);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  // Get leave status color
  const getStatusColor = useCallback((status) => {
    const statusColors = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      approved: 'text-green-600 bg-green-50 border-green-200',
      rejected: 'text-red-600 bg-red-50 border-red-200',
      cancelled: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return statusColors[status] || statusColors.pending;
  }, []);

  // Calculate leave days
  const calculateLeaveDays = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, []);

  // Check if user can cancel application
  const canCancelApplication = useCallback((application) => {
    return application.status === 'pending' && 
           (user?.role === 'admin' || application.employeeId === user?.employeeId);
  }, [user]);

  // Check if user can process application
  const canProcessApplication = useCallback((application) => {
    return ['manager', 'admin'].includes(user?.role) && 
           application.status === 'pending';
  }, [user?.role]);

  return {
    // State
    ...state,
    
    // Actions
    loadApplications,
    applyLeave,
    cancelApplication,
    loadBalance,
    loadLeaveTypes,
    loadCalendar,
    loadTeamApplications,
    processApplication,
    
    // Filters and pagination
    updateFilters,
    resetFilters,
    updatePagination,
    goToPage,
    
    // Utilities
    clearError,
    getStatusColor,
    calculateLeaveDays,
    canCancelApplication,
    canProcessApplication
  };
}

export default useLeave;
