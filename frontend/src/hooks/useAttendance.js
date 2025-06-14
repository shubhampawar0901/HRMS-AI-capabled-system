import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '@/services/attendanceService';
import { useAuth } from './useAuth';

/**
 * Custom hook for attendance management
 * Provides attendance data and operations
 */
export const useAttendance = () => {
  const { user } = useAuth();
  
  // State management
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination and filters
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    employeeId: ''
  });

  // Load today's attendance
  const loadTodayAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await attendanceService.getTodayAttendance();
      setTodayAttendance(response.data.data);
    } catch (error) {
      setError(error.message || 'Failed to load today\'s attendance');
      console.error('Error loading today\'s attendance:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load attendance history
  const loadAttendanceHistory = useCallback(async (page = 1, customFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: pagination.limit,
        ...filters,
        ...customFilters
      };
      
      const response = await attendanceService.getAttendanceHistory(params);
      const data = response.data.data;
      
      setAttendanceHistory(data.records || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalRecords: data.totalRecords || 0,
        limit: data.limit || 10
      });
    } catch (error) {
      setError(error.message || 'Failed to load attendance history');
      console.error('Error loading attendance history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.limit]);

  // Load team attendance (for managers)
  const loadTeamAttendance = useCallback(async (date = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = date ? { date } : {};
      const response = await attendanceService.getTeamAttendance(params);
      setTeamAttendance(response.data.data || []);
    } catch (error) {
      setError(error.message || 'Failed to load team attendance');
      console.error('Error loading team attendance:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load attendance statistics
  const loadAttendanceStats = useCallback(async (period = 'month') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await attendanceService.getAttendanceStats({ period });
      setAttendanceStats(response.data.data);
    } catch (error) {
      setError(error.message || 'Failed to load attendance statistics');
      console.error('Error loading attendance stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check in
  const performCheckIn = useCallback(async (data = {}) => {
    try {
      setIsCheckingIn(true);
      setError(null);
      
      const response = await attendanceService.checkIn(data);
      
      // Refresh today's attendance after successful check-in
      await loadTodayAttendance();
      
      return response.data;
    } catch (error) {
      setError(error.message || 'Check-in failed');
      throw error;
    } finally {
      setIsCheckingIn(false);
    }
  }, [loadTodayAttendance]);

  // Check out
  const performCheckOut = useCallback(async (data = {}) => {
    try {
      setIsCheckingOut(true);
      setError(null);
      
      const response = await attendanceService.checkOut(data);
      
      // Refresh today's attendance after successful check-out
      await loadTodayAttendance();
      
      return response.data;
    } catch (error) {
      setError(error.message || 'Check-out failed');
      throw error;
    } finally {
      setIsCheckingOut(false);
    }
  }, [loadTodayAttendance]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Filter by date range
  const filterByDateRange = useCallback((startDate, endDate) => {
    const newFilters = { startDate, endDate };
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadAttendanceHistory(1, newFilters);
  }, [loadAttendanceHistory]);

  // Pagination methods
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadAttendanceHistory(page);
    }
  }, [loadAttendanceHistory, pagination.totalPages]);

  const nextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1);
    }
  }, [pagination.currentPage, pagination.totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1);
    }
  }, [pagination.currentPage, goToPage]);

  // Utility functions
  const calculateWorkHours = useCallback((checkInTime, checkOutTime) => {
    if (!checkInTime || !checkOutTime) return 0;
    
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    const diffMs = checkOut - checkIn;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.max(0, diffHours);
  }, []);

  const getAttendanceStatus = useCallback((record) => {
    if (!record) return 'absent';
    
    if (record.checkInTime && record.checkOutTime) {
      return 'present';
    } else if (record.checkInTime) {
      return 'checked-in';
    } else {
      return 'absent';
    }
  }, []);

  // Check if user can check in
  const canCheckIn = useCallback(() => {
    if (!todayAttendance) return true;
    return !todayAttendance.checkInTime;
  }, [todayAttendance]);

  // Check if user can check out
  const canCheckOut = useCallback(() => {
    if (!todayAttendance) return false;
    return todayAttendance.checkInTime && !todayAttendance.checkOutTime;
  }, [todayAttendance]);

  // Refresh today's attendance
  const refreshTodayAttendance = useCallback(() => {
    loadTodayAttendance();
  }, [loadTodayAttendance]);

  // Clear error message
  const clearErrorMessage = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data on mount
  useEffect(() => {
    if (user) {
      loadTodayAttendance();
    }
  }, [user, loadTodayAttendance]);

  return {
    // Data
    attendanceHistory,
    todayAttendance,
    teamAttendance,
    attendanceStats,
    pagination,
    filters,
    
    // Loading states
    isLoading,
    isCheckingIn,
    isCheckingOut,
    error,
    
    // Actions
    loadAttendanceHistory,
    loadTeamAttendance,
    loadAttendanceStats,
    performCheckIn,
    performCheckOut,
    updateFilters,
    filterByDateRange,
    refreshTodayAttendance,
    clearErrorMessage,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    
    // Utilities
    calculateWorkHours,
    getAttendanceStatus,
    canCheckIn,
    canCheckOut
  };
};

export default useAttendance;
