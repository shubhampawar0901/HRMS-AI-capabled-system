import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { 
  fetchRecentActivities, 
  addNotification,
  clearError 
} from '@/store/slices/dashboardSlice';

/**
 * Custom hook for managing recent activities and real-time updates
 * @param {Object} options - Hook options
 * @returns {Object} Recent activities state and methods
 */
export const useRecentActivity = (options = {}) => {
  const {
    limit = 10,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTime = false
  } = options;

  const dispatch = useDispatch();
  const { recentActivities, notifications } = useSelector(state => state.dashboard);
  const { user } = useSelector(state => state.auth);

  /**
   * Fetch recent activities
   */
  const fetchActivities = useCallback(async (activityLimit = limit) => {
    try {
      await dispatch(fetchRecentActivities(activityLimit)).unwrap();
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }, [dispatch, limit]);

  /**
   * Add new activity (for real-time updates)
   */
  const addActivity = useCallback((activity) => {
    // Add as notification first
    dispatch(addNotification({
      id: Date.now(),
      type: activity.type || 'system',
      title: activity.title,
      message: activity.description || activity.title,
      timestamp: new Date().toISOString(),
      read: false,
      user: activity.user || user?.name || 'System'
    }));

    // Refresh activities to include the new one
    fetchActivities();
  }, [dispatch, fetchActivities, user]);

  /**
   * Filter activities by type
   */
  const filterActivitiesByType = useCallback((type) => {
    if (!recentActivities.data) return [];
    
    return recentActivities.data.filter(activity => activity.type === type);
  }, [recentActivities.data]);

  /**
   * Filter activities by user
   */
  const filterActivitiesByUser = useCallback((userId) => {
    if (!recentActivities.data) return [];
    
    return recentActivities.data.filter(activity => 
      activity.userId === userId || activity.user === userId
    );
  }, [recentActivities.data]);

  /**
   * Get activities from last N hours
   */
  const getRecentActivities = useCallback((hours = 24) => {
    if (!recentActivities.data) return [];
    
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return recentActivities.data.filter(activity => 
      new Date(activity.timestamp) > cutoffTime
    );
  }, [recentActivities.data]);

  /**
   * Get activity statistics
   */
  const getActivityStats = useCallback(() => {
    if (!recentActivities.data) return {};
    
    const stats = {
      total: recentActivities.data.length,
      byType: {},
      byStatus: {},
      last24Hours: 0,
      lastWeek: 0
    };

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    recentActivities.data.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      
      // Count by type
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      
      // Count by status
      if (activity.status) {
        stats.byStatus[activity.status] = (stats.byStatus[activity.status] || 0) + 1;
      }
      
      // Count by time period
      if (activityDate > last24Hours) {
        stats.last24Hours++;
      }
      if (activityDate > lastWeek) {
        stats.lastWeek++;
      }
    });

    return stats;
  }, [recentActivities.data]);

  /**
   * Clear activities error
   */
  const clearActivitiesError = useCallback(() => {
    dispatch(clearError('recentActivities'));
  }, [dispatch]);

  /**
   * Mark activity as read/seen
   */
  const markActivityAsSeen = useCallback((activityId) => {
    // This would typically update the activity status on the server
    console.log('Marking activity as seen:', activityId);
  }, []);

  /**
   * Get activity type icon and color
   */
  const getActivityTypeInfo = useCallback((type) => {
    const typeInfo = {
      attendance: { icon: 'Clock', color: 'blue', label: 'Attendance' },
      leave: { icon: 'Calendar', color: 'green', label: 'Leave' },
      payroll: { icon: 'DollarSign', color: 'purple', label: 'Payroll' },
      performance: { icon: 'TrendingUp', color: 'orange', label: 'Performance' },
      employee: { icon: 'User', color: 'indigo', label: 'Employee' },
      system: { icon: 'Settings', color: 'gray', label: 'System' },
      notification: { icon: 'Bell', color: 'red', label: 'Notification' }
    };

    return typeInfo[type] || typeInfo.system;
  }, []);

  /**
   * Format activity for display
   */
  const formatActivity = useCallback((activity) => {
    const typeInfo = getActivityTypeInfo(activity.type);
    
    return {
      ...activity,
      typeInfo,
      formattedTime: new Date(activity.timestamp).toLocaleString(),
      relativeTime: getRelativeTime(activity.timestamp),
      isRecent: new Date(activity.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    };
  }, [getActivityTypeInfo]);

  /**
   * Get relative time string
   */
  const getRelativeTime = useCallback((timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return activityTime.toLocaleDateString();
  }, []);

  /**
   * Auto-refresh activities
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchActivities();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchActivities]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  /**
   * Real-time updates setup (WebSocket would go here)
   */
  useEffect(() => {
    if (!enableRealTime) return;

    // This is where you would set up WebSocket connection
    // for real-time activity updates
    console.log('Real-time activity updates enabled');

    return () => {
      // Cleanup WebSocket connection
      console.log('Real-time activity updates disabled');
    };
  }, [enableRealTime]);

  return {
    // State
    activities: recentActivities.data || [],
    isLoading: recentActivities.isLoading,
    error: recentActivities.error,
    lastFetch: recentActivities.lastFetch,
    
    // Methods
    fetchActivities,
    addActivity,
    filterActivitiesByType,
    filterActivitiesByUser,
    getRecentActivities,
    markActivityAsSeen,
    clearError: clearActivitiesError,
    
    // Utility methods
    formatActivity,
    getActivityTypeInfo,
    getRelativeTime,
    
    // Computed values
    stats: getActivityStats(),
    hasActivities: (recentActivities.data || []).length > 0,
    recentCount: getRecentActivities(1).length, // Last hour
    todayCount: getRecentActivities(24).length, // Last 24 hours
    
    // Formatted activities
    formattedActivities: (recentActivities.data || []).map(formatActivity)
  };
};

export default useRecentActivity;
