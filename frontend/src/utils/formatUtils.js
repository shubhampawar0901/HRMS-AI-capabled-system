// Formatting utility functions for HRMS application

/**
 * Format currency (Indian Rupees)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format number with Indian numbering system (lakhs, crores)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatIndianNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format name (capitalize first letter of each word)
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
export const formatName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Format employee ID for display
 * @param {string} empId - Employee ID to format
 * @returns {string} Formatted employee ID
 */
export const formatEmployeeId = (empId) => {
  if (!empId) return '';
  
  // If it's just numbers, add EMP prefix
  if (/^\d+$/.test(empId)) {
    return `EMP${empId.padStart(4, '0')}`;
  }
  
  return empId.toUpperCase();
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
  if (!address || typeof address !== 'object') return '';
  
  const parts = [
    address.street,
    address.area,
    address.city,
    address.state,
    address.pincode
  ].filter(part => part && part.trim());
  
  return parts.join(', ');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format status for display (with proper casing)
 * @param {string} status - Status to format
 * @returns {string} Formatted status
 */
export const formatStatus = (status) => {
  if (!status) return '';
  
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format department name
 * @param {string} department - Department name to format
 * @returns {string} Formatted department name
 */
export const formatDepartment = (department) => {
  if (!department) return '';
  
  // Handle common abbreviations
  const abbreviations = {
    'hr': 'Human Resources',
    'it': 'Information Technology',
    'qa': 'Quality Assurance',
    'ui': 'User Interface',
    'ux': 'User Experience'
  };
  
  const lower = department.toLowerCase();
  if (abbreviations[lower]) {
    return abbreviations[lower];
  }
  
  return formatName(department);
};

/**
 * Format leave type for display
 * @param {string} leaveType - Leave type to format
 * @returns {string} Formatted leave type
 */
export const formatLeaveType = (leaveType) => {
  if (!leaveType) return '';
  
  const typeMap = {
    'sick_leave': 'Sick Leave',
    'casual_leave': 'Casual Leave',
    'earned_leave': 'Earned Leave',
    'maternity_leave': 'Maternity Leave',
    'paternity_leave': 'Paternity Leave',
    'comp_off': 'Compensatory Off',
    'lop': 'Loss of Pay'
  };
  
  return typeMap[leaveType.toLowerCase()] || formatStatus(leaveType);
};

/**
 * Format initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Format array to comma-separated string
 * @param {Array} array - Array to format
 * @param {string} conjunction - Conjunction for last item ('and', 'or')
 * @returns {string} Formatted string
 */
export const formatArrayToString = (array, conjunction = 'and') => {
  if (!Array.isArray(array) || array.length === 0) return '';
  
  if (array.length === 1) return array[0];
  if (array.length === 2) return `${array[0]} ${conjunction} ${array[1]}`;
  
  const lastItem = array[array.length - 1];
  const otherItems = array.slice(0, -1);
  
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
};

export default {
  formatCurrency,
  formatIndianNumber,
  formatPercentage,
  formatName,
  formatPhoneNumber,
  formatEmployeeId,
  formatFileSize,
  formatAddress,
  truncateText,
  formatStatus,
  formatDepartment,
  formatLeaveType,
  getInitials,
  formatArrayToString
};
