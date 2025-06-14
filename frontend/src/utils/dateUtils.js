// Date utility functions for HRMS application

/**
 * Format date to display format
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time', 'datetime')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Format date for API requests (ISO format)
 * @param {Date|string} date - Date to format
 * @returns {string} ISO formatted date string
 */
export const formatDateForAPI = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toISOString().split('T')[0];
};

/**
 * Calculate difference between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} unit - Unit of measurement ('days', 'hours', 'minutes')
 * @returns {number} Difference in specified unit
 */
export const getDateDifference = (startDate, endDate, unit = 'days') => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffInMs = end.getTime() - start.getTime();
  
  switch (unit) {
    case 'days':
      return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    case 'hours':
      return Math.ceil(diffInMs / (1000 * 60 * 60));
    case 'minutes':
      return Math.ceil(diffInMs / (1000 * 60));
    default:
      return diffInMs;
  }
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.toDateString() === checkDate.toDateString();
};

/**
 * Check if date is in current week
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in current week
 */
export const isThisWeek = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

/**
 * Get start and end of current month
 * @returns {Object} Object with startDate and endDate
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: formatDateForAPI(startDate),
    endDate: formatDateForAPI(endDate)
  };
};

/**
 * Get working days between two dates (excluding weekends)
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of working days
 */
export const getWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let workingDays = 0;
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

/**
 * Format time duration (e.g., for attendance)
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0h 0m';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
};

/**
 * Format time from backend format (HH:mm:ss) to display format (hh:mm AM/PM)
 * @param {string} timeString - Time string in HH:mm:ss format
 * @returns {string} Formatted time string
 */
export const formatTimeFromBackend = (timeString) => {
  if (!timeString) return 'Invalid Time';

  try {
    // Handle HH:mm:ss format
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }

    return 'Invalid Time';
  } catch (error) {
    console.warn('Time formatting error:', error);
    return 'Invalid Time';
  }
};

/**
 * Calculate work duration from check-in and check-out times
 * @param {string} checkInTime - Check-in time (HH:mm:ss)
 * @param {string} checkOutTime - Check-out time (HH:mm:ss)
 * @returns {string} Duration string (e.g., "8h 30m")
 */
export const calculateWorkDuration = (checkInTime, checkOutTime) => {
  if (!checkInTime) return '0h 0m';

  try {
    const checkIn = new Date();
    const checkInParts = checkInTime.split(':');
    checkIn.setHours(parseInt(checkInParts[0]), parseInt(checkInParts[1]), parseInt(checkInParts[2] || 0), 0);

    let checkOut;
    if (checkOutTime) {
      checkOut = new Date();
      const checkOutParts = checkOutTime.split(':');
      checkOut.setHours(parseInt(checkOutParts[0]), parseInt(checkOutParts[1]), parseInt(checkOutParts[2] || 0), 0);
    } else {
      // If not checked out, use current time
      checkOut = new Date();
    }

    // Handle case where checkout is next day
    if (checkOut < checkIn) {
      checkOut.setDate(checkOut.getDate() + 1);
    }

    const diffInMs = checkOut.getTime() - checkIn.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    return formatDuration(diffInMinutes);
  } catch (error) {
    console.warn('Work duration calculation error:', error);
    return '0h 0m';
  }
};

/**
 * Check if check-in time is late (after 9:00 AM)
 * @param {string} checkInTime - Check-in time (HH:mm:ss)
 * @returns {boolean} True if late
 */
export const isLateCheckIn = (checkInTime) => {
  if (!checkInTime) return false;

  try {
    const timeParts = checkInTime.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    // Late if after 9:00 AM
    return hours > 9 || (hours === 9 && minutes > 0);
  } catch (error) {
    return false;
  }
};

/**
 * Check if check-out time is early (before 5:00 PM)
 * @param {string} checkOutTime - Check-out time (HH:mm:ss)
 * @returns {boolean} True if early
 */
export const isEarlyCheckOut = (checkOutTime) => {
  if (!checkOutTime) return false;

  try {
    const timeParts = checkOutTime.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    // Early if before 5:00 PM (17:00)
    return hours < 17 || (hours === 17 && minutes === 0);
  } catch (error) {
    return false;
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (Math.abs(diffInMinutes) < 1) return 'Just now';
  if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes > 0 ? `In ${diffInMinutes} minutes` : `${Math.abs(diffInMinutes)} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return diffInHours > 0 ? `In ${diffInHours} hours` : `${Math.abs(diffInHours)} hours ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 7) {
    return diffInDays > 0 ? `In ${diffInDays} days` : `${Math.abs(diffInDays)} days ago`;
  }
  
  return formatDate(date);
};

/**
 * Check if date is a weekend
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is weekend
 */
export const isWeekend = (date) => {
  const dayOfWeek = new Date(date).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

/**
 * Get current week range (Monday to Sunday)
 * @returns {Object} Object with startDate and endDate
 */
export const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday

  const startDate = new Date(now.setDate(diff));
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    startDate: formatDateForAPI(startDate),
    endDate: formatDateForAPI(endDate)
  };
};

/**
 * Get time zone offset string
 * @returns {string} Time zone offset (e.g., "+05:30")
 */
export const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-';

  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export default {
  formatDate,
  formatDateForAPI,
  getDateDifference,
  isToday,
  isThisWeek,
  getCurrentMonthRange,
  getCurrentWeekRange,
  getWorkingDays,
  formatDuration,
  formatTimeFromBackend,
  calculateWorkDuration,
  isLateCheckIn,
  isEarlyCheckOut,
  getRelativeTime,
  isWeekend,
  getTimezoneOffset
};
