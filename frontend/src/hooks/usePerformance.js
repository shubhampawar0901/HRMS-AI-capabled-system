import { useState, useEffect, useCallback, useMemo } from 'react';
import { performanceService } from '@/services/performanceService';
import { useAuth } from '@/hooks/useAuth';

/**
 * Custom hook for performance management
 * Provides performance data and operations with role-based access
 */
export const usePerformance = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();

  // Debug user data and get employeeId safely
  const employeeId = useMemo(() => {
    console.log('🔍 usePerformance - User object:', user);

    if (!user) {
      console.log('❌ No user object');
      return null;
    }

    // Try multiple ways to get employeeId for backward compatibility
    const id = user.employeeId || user.employee?.id || null;
    console.log('🔍 usePerformance - Employee ID:', id);

    if (!id && (user.role === 'employee' || user.role === 'manager')) {
      console.warn('⚠️ Employee ID is missing for employee/manager user. User may need to logout and login again.');
    }

    return id;
  }, [user]);
  
  // State management
  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [performanceAnalytics, setPerformanceAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filters state
  const [filters, setFilters] = useState({
    period: 'current',
    status: null,
    employeeId: null,
    departmentId: null
  });

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch performance reviews (role-based)
  const fetchPerformanceReviews = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        ...params,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await performanceService.getPerformanceReviews(queryParams);
      
      if (response.success) {
        setPerformanceReviews(response.data.reviews || []);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        throw new Error(response.message || 'Failed to fetch performance reviews');
      }
    } catch (err) {
      console.error('Fetch performance reviews error:', err);
      setError(err.message || 'Failed to fetch performance reviews');
      setPerformanceReviews([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch specific performance review
  const fetchPerformanceReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await performanceService.getPerformanceReviewById(reviewId);

      if (response.success) {
        setCurrentReview(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch performance review');
      }
    } catch (err) {
      console.error('Fetch performance review error:', err);
      setError(err.message || 'Failed to fetch performance review');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create performance review (manager/admin only)
  const createPerformanceReview = useCallback(async (reviewData) => {
    if (!isManager && !isAdmin) {
      setError('Access denied: Manager or Admin privileges required');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await performanceService.createPerformanceReview(reviewData);
      
      if (response.success) {
        // Refresh performance reviews
        await fetchPerformanceReviews();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create performance review');
      }
    } catch (err) {
      console.error('Create performance review error:', err);
      setError(err.message || 'Failed to create performance review');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isManager, isAdmin, fetchPerformanceReviews]);

  // Update performance review
  const updatePerformanceReview = useCallback(async (reviewId, reviewData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await performanceService.updatePerformanceReview(reviewId, reviewData);
      
      if (response.success) {
        // Refresh performance reviews
        await fetchPerformanceReviews();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update performance review');
      }
    } catch (err) {
      console.error('Update performance review error:', err);
      setError(err.message || 'Failed to update performance review');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPerformanceReviews]);

  // Fetch goals
  const fetchGoals = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        ...params,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await performanceService.getGoals(queryParams);
      
      if (response.success) {
        setGoals(response.data.goals || []);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        throw new Error(response.message || 'Failed to fetch goals');
      }
    } catch (err) {
      console.error('Fetch goals error:', err);
      setError(err.message || 'Failed to fetch goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Create goal
  const createGoal = useCallback(async (goalData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await performanceService.createGoal(goalData);
      
      if (response.success) {
        // Refresh goals
        await fetchGoals();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create goal');
      }
    } catch (err) {
      console.error('Create goal error:', err);
      setError(err.message || 'Failed to create goal');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchGoals]);

  // Update goal
  const updateGoal = useCallback(async (goalId, goalData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await performanceService.updateGoal(goalId, goalData);
      
      if (response.success) {
        // Refresh goals
        await fetchGoals();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update goal');
      }
    } catch (err) {
      console.error('Update goal error:', err);
      setError(err.message || 'Failed to update goal');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchGoals]);

  // Fetch team performance (manager/admin only)
  const fetchTeamPerformance = useCallback(async (params = {}) => {
    if (!isManager && !isAdmin) {
      setError('Access denied: Manager or Admin privileges required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await performanceService.getTeamPerformance(params);
      
      if (response.success) {
        setTeamPerformance(response.data.teamPerformance || []);
      } else {
        throw new Error(response.message || 'Failed to fetch team performance');
      }
    } catch (err) {
      console.error('Fetch team performance error:', err);
      setError(err.message || 'Failed to fetch team performance');
      setTeamPerformance([]);
    } finally {
      setLoading(false);
    }
  }, [isManager, isAdmin]);

  // Fetch performance analytics
  const fetchPerformanceAnalytics = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await performanceService.getPerformanceAnalytics(params);
      
      if (response.success) {
        setPerformanceAnalytics(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch performance analytics');
      }
    } catch (err) {
      console.error('Fetch performance analytics error:', err);
      setError(err.message || 'Failed to fetch performance analytics');
      setPerformanceAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }));
  }, []);

  // Computed values
  const hasPerformanceAccess = useMemo(() => {
    return isAdmin || isManager || isEmployee;
  }, [isAdmin, isManager, isEmployee]);

  const canManagePerformance = useMemo(() => {
    return isAdmin || isManager;
  }, [isAdmin, isManager]);

  const canViewTeamPerformance = useMemo(() => {
    return isAdmin || isManager;
  }, [isAdmin, isManager]);

  // Auto-fetch data based on role
  useEffect(() => {
    if (!user || !hasPerformanceAccess) return;

    if (isEmployee) {
      fetchPerformanceReviews();
      fetchGoals();
    } else if (isManager || isAdmin) {
      fetchPerformanceReviews();
      fetchGoals();
      fetchTeamPerformance();
      fetchPerformanceAnalytics();
    }
  }, [user, hasPerformanceAccess, isEmployee, isManager, isAdmin]);

  return {
    // State
    performanceReviews,
    currentReview,
    goals,
    currentGoal,
    teamPerformance,
    performanceAnalytics,
    loading,
    error,
    pagination,
    filters,

    // Actions
    fetchPerformanceReviews,
    fetchPerformanceReview,
    createPerformanceReview,
    updatePerformanceReview,
    fetchGoals,
    createGoal,
    updateGoal,
    fetchTeamPerformance,
    fetchPerformanceAnalytics,
    updateFilters,
    updatePagination,
    clearError,

    // Computed values
    hasPerformanceAccess,
    canManagePerformance,
    canViewTeamPerformance,

    // Role checks
    isAdmin,
    isManager,
    isEmployee
  };
};

export default usePerformance;
