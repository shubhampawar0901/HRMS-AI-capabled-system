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
  getRelativeTime,
  isWeekend,
  getTimezoneOffset
};
