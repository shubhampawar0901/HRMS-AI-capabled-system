import { useState, useEffect, useCallback } from 'react';
import { useAttendance } from './useAttendance';
import { attendanceService } from '@/services/attendanceService';

export const useCheckInOut = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const currentLocation = await attendanceService.getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      setLocationError(error.message);
      console.warn('Location error:', error);
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  // Handle check in
  const handleCheckIn = useCallback(async () => {
    try {
      const result = await performCheckIn(location);
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
  }, [performCheckIn, location, refreshTodayAttendance]);

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
    if (!todayAttendance?.checkInTime) return '00:00:00';

    const checkInTime = new Date(todayAttendance.checkInTime);
    const endTime = todayAttendance.checkOutTime 
      ? new Date(todayAttendance.checkOutTime) 
      : currentTime;

    const diffMs = endTime - checkInTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [todayAttendance, currentTime]);

  // Get total work hours for today
  const getTotalWorkHours = useCallback(() => {
    if (!todayAttendance?.checkInTime || !todayAttendance?.checkOutTime) {
      return 0;
    }
    return calculateWorkHours(todayAttendance.checkInTime, todayAttendance.checkOutTime);
  }, [todayAttendance, calculateWorkHours]);

  // Check if late check-in
  const isLateCheckIn = useCallback(() => {
    if (!todayAttendance?.checkInTime) return false;
    
    const checkInTime = new Date(todayAttendance.checkInTime);
    const expectedTime = new Date(checkInTime);
    expectedTime.setHours(9, 0, 0, 0); // Assuming 9 AM is the expected time
    
    return checkInTime > expectedTime;
  }, [todayAttendance]);

  // Check if early check-out
  const isEarlyCheckOut = useCallback(() => {
    if (!todayAttendance?.checkOutTime) return false;
    
    const checkOutTime = new Date(todayAttendance.checkOutTime);
    const expectedTime = new Date(checkOutTime);
    expectedTime.setHours(17, 0, 0, 0); // Assuming 5 PM is the expected time
    
    return checkOutTime < expectedTime;
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

  // Check if location is required
  const isLocationRequired = useCallback(() => {
    // This could be configurable based on company policy
    return true;
  }, []);

  // Get location status
  const getLocationStatus = useCallback(() => {
    if (isGettingLocation) return 'getting';
    if (locationError) return 'error';
    if (location) return 'available';
    return 'unavailable';
  }, [isGettingLocation, locationError, location]);

  return {
    // Time data
    currentTime,
    formatTime,
    formatDate,
    
    // Location data
    location,
    locationError,
    isGettingLocation,
    getCurrentLocation,
    isLocationRequired,
    getLocationStatus,
    
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
