import { useState, useEffect, useCallback } from 'react';
import { useAttendance } from './useAttendance';
import { calculateWorkDuration, formatTimeFromBackend } from '@/utils/dateUtils';

export const useCheckInOut = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    todayAttendance,
    isCheckingIn,
    isCheckingOut,
    performCheckIn,
    performCheckOut,
    canCheckIn,
    canCheckOut,
    calculateWorkHours,
    refreshTodayAttendance
  } = useAttendance();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);





  // Handle check in
  const handleCheckIn = useCallback(async () => {
    try {
      const result = await performCheckIn();
      if (result.success) {
        // Refresh today's attendance to get updated data
        setTimeout(() => {
          refreshTodayAttendance();
        }, 1000);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [performCheckIn, refreshTodayAttendance]);

  // Handle check out
  const handleCheckOut = useCallback(async () => {
    try {
      const result = await performCheckOut();
      if (result.success) {
        // Refresh today's attendance to get updated data
        setTimeout(() => {
          refreshTodayAttendance();
        }, 1000);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [performCheckOut, refreshTodayAttendance]);

  // Format time for display
  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, []);

  // Format date for display
  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Get work status
  const getWorkStatus = useCallback(() => {
    if (!todayAttendance) return 'not-started';
    if (todayAttendance.checkInTime && !todayAttendance.checkOutTime) return 'working';
    if (todayAttendance.checkInTime && todayAttendance.checkOutTime) return 'completed';
    return 'not-started';
  }, [todayAttendance]);

  // Get work duration
  const getWorkDuration = useCallback(() => {
    if (!todayAttendance?.checkInTime) return '0h 0m';

    // Use the utility function to calculate work duration
    return calculateWorkDuration(todayAttendance.checkInTime, todayAttendance.checkOutTime);
  }, [todayAttendance]);

  // Get total work hours for today
  const getTotalWorkHours = useCallback(() => {
    if (!todayAttendance?.checkInTime || !todayAttendance?.checkOutTime) {
      return 0;
    }
    return calculateWorkHours(todayAttendance.checkInTime, todayAttendance.checkOutTime);
  }, [todayAttendance, calculateWorkHours]);

  // Check if late check-in (using utility function)
  const isLateCheckIn = useCallback(() => {
    if (!todayAttendance?.checkInTime) return false;

    // Import and use the utility function
    const { isLateCheckIn: checkIsLate } = require('@/utils/dateUtils');
    return checkIsLate(todayAttendance.checkInTime);
  }, [todayAttendance]);

  // Check if early check-out (using utility function)
  const isEarlyCheckOut = useCallback(() => {
    if (!todayAttendance?.checkOutTime) return false;

    // Import and use the utility function
    const { isEarlyCheckOut: checkIsEarly } = require('@/utils/dateUtils');
    return checkIsEarly(todayAttendance.checkOutTime);
  }, [todayAttendance]);

  // Get attendance summary for today
  const getTodaySummary = useCallback(() => {
    const status = getWorkStatus();
    const duration = getWorkDuration();
    const totalHours = getTotalWorkHours();
    const isLate = isLateCheckIn();
    const isEarly = isEarlyCheckOut();

    return {
      status,
      duration,
      totalHours,
      isLate,
      isEarly,
      checkInTime: todayAttendance?.checkInTime,
      checkOutTime: todayAttendance?.checkOutTime
    };
  }, [
    getWorkStatus,
    getWorkDuration,
    getTotalWorkHours,
    isLateCheckIn,
    isEarlyCheckOut,
    todayAttendance
  ]);



  return {
    // Time data
    currentTime,
    formatTime,
    formatDate,

    // Attendance data
    todayAttendance,
    getWorkStatus,
    getWorkDuration,
    getTotalWorkHours,
    getTodaySummary,

    // Status checks
    canCheckIn,
    canCheckOut,
    isLateCheckIn,
    isEarlyCheckOut,

    // Actions
    handleCheckIn,
    handleCheckOut,

    // Loading states
    isCheckingIn,
    isCheckingOut
  };
};

export default useCheckInOut;
