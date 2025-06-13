import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkIn,
  checkOut,
  fetchTodayAttendance,
  fetchAttendanceHistory,
  fetchTeamAttendance,
  fetchAttendanceStats,
  updateAttendance,
  setFilters,
  clearTodayAttendance,
  clearError,
  clearSuccess,
  resetAttendanceState,
  updateTodayAttendance
} from '@/store/slices/attendanceSlice';
import { attendanceService } from '@/services/attendanceService';

export const useAttendance = () => {
  const dispatch = useDispatch();
  const {
    todayAttendance,
    attendanceHistory,
    teamAttendance,
    attendanceStats,
    pagination,
    filters,
    isLoading,
    isCheckingIn,
    isCheckingOut,
    isUpdating,
    error,
    success
  } = useSelector(state => state.attendance);

  // Load today's attendance on mount
  useEffect(() => {
    dispatch(fetchTodayAttendance());
  }, [dispatch]);

  // Check in function
  const performCheckIn = useCallback(async (location = null) => {
    try {
      let checkInData = {
        timestamp: new Date().toISOString()
      };

      // Add location if provided or get current location
      if (location) {
        checkInData.location = location;
      } else {
        try {
          const currentLocation = await attendanceService.getCurrentLocation();
          checkInData.location = currentLocation;
        } catch (locationError) {
          console.warn('Could not get location:', locationError);
          // Continue without location
        }
      }

      await dispatch(checkIn(checkInData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Check out function
  const performCheckOut = useCallback(async () => {
    try {
      const checkOutData = {
        timestamp: new Date().toISOString()
      };

      await dispatch(checkOut(checkOutData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Load attendance history
  const loadAttendanceHistory = useCallback((params = {}) => {
    const searchParams = { ...filters, ...params };
    dispatch(fetchAttendanceHistory(searchParams));
  }, [dispatch, filters]);

  // Load team attendance (for managers)
  const loadTeamAttendance = useCallback((params = {}) => {
    const searchParams = { ...filters, ...params };
    dispatch(fetchTeamAttendance(searchParams));
  }, [dispatch, filters]);

  // Load attendance statistics
  const loadAttendanceStats = useCallback((params = {}) => {
    dispatch(fetchAttendanceStats(params));
  }, [dispatch]);

  // Update attendance record
  const editAttendance = useCallback(async (id, data) => {
    try {
      await dispatch(updateAttendance({ id, data })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  // Filter by date range
  const filterByDateRange = useCallback((startDate, endDate) => {
    dispatch(setFilters({ startDate, endDate, page: 1 }));
  }, [dispatch]);

  // Filter by employee
  const filterByEmployee = useCallback((employeeId) => {
    dispatch(setFilters({ employeeId, page: 1 }));
  }, [dispatch]);

  // Filter by status
  const filterByStatus = useCallback((status) => {
    dispatch(setFilters({ status, page: 1 }));
  }, [dispatch]);

  // Pagination
  const goToPage = useCallback((page) => {
    dispatch(setFilters({ page }));
  }, [dispatch]);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.pages) {
      dispatch(setFilters({ page: pagination.page + 1 }));
    }
  }, [dispatch, pagination.page, pagination.pages]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      dispatch(setFilters({ page: pagination.page - 1 }));
    }
  }, [dispatch, pagination.page]);

  // Clear functions
  const clearTodayData = useCallback(() => {
    dispatch(clearTodayAttendance());
  }, [dispatch]);

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSuccessMessage = useCallback(() => {
    dispatch(clearSuccess());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetAttendanceState());
  }, [dispatch]);

  // Refresh today's attendance
  const refreshTodayAttendance = useCallback(() => {
    dispatch(fetchTodayAttendance());
  }, [dispatch]);

  // Refresh attendance history
  const refreshAttendanceHistory = useCallback(() => {
    loadAttendanceHistory();
  }, [loadAttendanceHistory]);

  // Check if user can check in/out
  const canCheckIn = useCallback(() => {
    return !todayAttendance?.checkInTime;
  }, [todayAttendance]);

  const canCheckOut = useCallback(() => {
    return todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;
  }, [todayAttendance]);

  // Calculate work hours
  const calculateWorkHours = useCallback((checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  }, []);

  // Get attendance status for a date
  const getAttendanceStatus = useCallback((attendance) => {
    if (!attendance) return 'absent';
    if (attendance.checkInTime && attendance.checkOutTime) return 'present';
    if (attendance.checkInTime && !attendance.checkOutTime) return 'incomplete';
    return 'absent';
  }, []);

  // Update today's attendance locally (for real-time updates)
  const updateTodayData = useCallback((data) => {
    dispatch(updateTodayAttendance(data));
  }, [dispatch]);

  return {
    // Data
    todayAttendance,
    attendanceHistory,
    teamAttendance,
    attendanceStats,
    pagination,
    filters,
    
    // Loading states
    isLoading,
    isCheckingIn,
    isCheckingOut,
    isUpdating,
    
    // Messages
    error,
    success,
    
    // Actions
    performCheckIn,
    performCheckOut,
    loadAttendanceHistory,
    loadTeamAttendance,
    loadAttendanceStats,
    editAttendance,
    
    // Filters
    updateFilters,
    filterByDateRange,
    filterByEmployee,
    filterByStatus,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    
    // Utilities
    clearTodayData,
    clearErrorMessage,
    clearSuccessMessage,
    resetState,
    refreshTodayAttendance,
    refreshAttendanceHistory,
    canCheckIn,
    canCheckOut,
    calculateWorkHours,
    getAttendanceStatus,
    updateTodayData
  };
};

export default useAttendance;
