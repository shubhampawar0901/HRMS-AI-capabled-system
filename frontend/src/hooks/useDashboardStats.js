import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { 
  fetchDashboardStats, 
  fetchRecentActivities, 
  fetchQuickActions,
  fetchAttendanceWidget,
  fetchPerformanceMetrics,
  fetchLeaveSummary,
  fetchTeamOverview,
  fetchNotifications,
  clearDashboardData,
  setRefreshing
} from '@/store/slices/dashboardSlice';

/**
 * Custom hook for dashboard statistics and data management
 * @param {string} userRole - User role (admin, manager, employee)
 * @param {string} userId - User ID for personalized data
 * @returns {Object} Dashboard state and methods
 */
export const useDashboardStats = (userRole = 'employee', userId = null) => {
  const dispatch = useDispatch();
  const dashboardState = useSelector(state => state.dashboard);

  /**
   * Fetch all dashboard data based on user role
   */
  const fetchAllData = useCallback(async () => {
    try {
      dispatch(setRefreshing(true));

      // Common data for all roles
      const promises = [
        dispatch(fetchDashboardStats(userRole)),
        dispatch(fetchRecentActivities(userRole === 'admin' ? 10 : 8)),
        dispatch(fetchQuickActions(userRole)),
        dispatch(fetchNotifications(5))
      ];

      // Role-specific data
      if (userRole === 'admin' || userRole === 'manager') {
        promises.push(dispatch(fetchTeamOverview()));
      }

      if (userId) {
        promises.push(
          dispatch(fetchAttendanceWidget(userId)),
          dispatch(fetchLeaveSummary(userId)),
          dispatch(fetchPerformanceMetrics({ employeeId: userId, period: 'month' }))
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      dispatch(setRefreshing(false));
    }
  }, [dispatch, userRole, userId]);

  /**
   * Refresh specific dashboard section
   */
  const refreshSection = useCallback(async (section, params = {}) => {
    try {
      switch (section) {
        case 'stats':
          await dispatch(fetchDashboardStats(userRole)).unwrap();
          break;
        case 'activities':
          await dispatch(fetchRecentActivities(params.limit || 8)).unwrap();
          break;
        case 'attendance':
          if (userId) {
            await dispatch(fetchAttendanceWidget(userId)).unwrap();
          }
          break;
        case 'performance':
          if (userId) {
            await dispatch(fetchPerformanceMetrics({ 
              employeeId: userId, 
              period: params.period || 'month' 
            })).unwrap();
          }
          break;
        case 'leave':
          if (userId) {
            await dispatch(fetchLeaveSummary(userId)).unwrap();
          }
          break;
        case 'team':
          if (userRole === 'admin' || userRole === 'manager') {
            await dispatch(fetchTeamOverview()).unwrap();
          }
          break;
        case 'notifications':
          await dispatch(fetchNotifications(params.limit || 5)).unwrap();
          break;
        default:
          console.warn(`Unknown section: ${section}`);
      }
    } catch (error) {
      console.error(`Error refreshing ${section}:`, error);
      throw error;
    }
  }, [dispatch, userRole, userId]);

  /**
   * Clear all dashboard data
   */
  const clearData = useCallback(() => {
    dispatch(clearDashboardData());
  }, [dispatch]);

  /**
   * Get dashboard summary for the user
   */
  const getDashboardSummary = useCallback(() => {
    const { stats, attendanceWidget, leaveSummary, performanceMetrics } = dashboardState;
    
    if (!stats.data) return null;

    const summary = {
      role: userRole,
      lastUpdated: stats.lastFetch,
      isLoading: stats.isLoading || attendanceWidget.isLoading,
      hasErrors: !!(stats.error || attendanceWidget.error)
    };

    // Role-specific summary data
    switch (userRole) {
      case 'admin':
        summary.totalEmployees = stats.data.totalEmployees || 0;
        summary.presentToday = stats.data.presentToday || 0;
        summary.pendingApprovals = stats.data.pendingApprovals || 0;
        summary.systemHealth = 'healthy'; // This would come from actual system monitoring
        break;
        
      case 'manager':
        summary.teamSize = stats.data.teamSize || 0;
        summary.teamPresent = stats.data.presentToday || 0;
        summary.pendingApprovals = stats.data.pendingApprovals || 0;
        summary.teamPerformance = stats.data.avgPerformance || 0;
        break;
        
      case 'employee':
        summary.attendanceRate = stats.data.attendanceRate || 0;
        summary.leaveBalance = leaveSummary.data?.totalBalance || 0;
        summary.performanceScore = performanceMetrics.data?.score || 0;
        summary.isCheckedIn = attendanceWidget.data?.checkedIn || false;
        break;
    }

    return summary;
  }, [dashboardState, userRole]);

  /**
   * Get pending actions count
   */
  const getPendingActionsCount = useCallback(() => {
    const { stats, notifications } = dashboardState;
    
    let count = 0;
    
    // Add pending approvals
    if (stats.data?.pendingApprovals) {
      count += stats.data.pendingApprovals;
    }
    
    // Add unread notifications
    if (notifications.unreadCount) {
      count += notifications.unreadCount;
    }
    
    return count;
  }, [dashboardState]);

  /**
   * Check if data needs refresh (older than 5 minutes)
   */
  const needsRefresh = useCallback(() => {
    const { stats } = dashboardState;
    
    if (!stats.lastFetch) return true;
    
    const lastFetch = new Date(stats.lastFetch);
    const now = new Date();
    const diffMinutes = (now - lastFetch) / (1000 * 60);
    
    return diffMinutes > 5;
  }, [dashboardState]);

  /**
   * Auto-refresh data on mount and when user role or userId changes
   */
  useEffect(() => {
    fetchAllData();
  }, [userRole, userId]); // Only depend on userRole and userId, not fetchAllData

  /**
   * Set up auto-refresh interval (every 5 minutes)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if data needs refresh directly in the interval
      const { stats } = dashboardState;
      const shouldRefresh = !stats.lastFetch ||
        (new Date() - new Date(stats.lastFetch)) / (1000 * 60) > 5;

      if (shouldRefresh) {
        fetchAllData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [userRole, userId]); // Only depend on userRole and userId

  return {
    // State
    ...dashboardState,
    
    // Methods
    fetchAllData,
    refreshSection,
    clearData,
    
    // Computed values
    summary: getDashboardSummary(),
    pendingActionsCount: getPendingActionsCount(),
    needsRefresh: needsRefresh(),
    
    // Convenience flags
    isLoading: dashboardState.refreshing || dashboardState.stats.isLoading,
    hasError: !!(dashboardState.stats.error || dashboardState.recentActivities.error),
    isEmpty: !dashboardState.stats.data && !dashboardState.stats.isLoading
  };
};

export default useDashboardStats;
