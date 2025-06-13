// Validation utility functions for HRMS application

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Phone number validation (supports various formats)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
};

/**
 * Password strength validation
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength and requirements
 */
export const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  let strength = 'weak';
  if (metRequirements >= 4) strength = 'strong';
  else if (metRequirements >= 3) strength = 'medium';

  return {
    isValid: metRequirements >= 3,
    strength,
    requirements,
    score: metRequirements
  };
};

/**
 * Employee ID validation
 * @param {string} employeeId - Employee ID to validate
 * @returns {boolean} True if employee ID is valid
 */
export const isValidEmployeeId = (employeeId) => {
  // Assuming format: EMP followed by 4-6 digits
  const empIdRegex = /^EMP\d{4,6}$/;
  return empIdRegex.test(employeeId);
};

/**
 * Salary validation
 * @param {number|string} salary - Salary to validate
 * @returns {boolean} True if salary is valid
 */
export const isValidSalary = (salary) => {
  const numSalary = parseFloat(salary);
  return !isNaN(numSalary) && numSalary > 0 && numSalary <= 10000000; // Max 1 crore
};

/**
 * Date range validation
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Validation result
 */
export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  return {
    isValid: start <= end,
    isStartDateValid: !isNaN(start.getTime()),
    isEndDateValid: !isNaN(end.getTime()),
    isStartInFuture: start > today,
    isEndInPast: end < today,
    daysDifference: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  };
};

/**
 * Required field validation
 * @param {any} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * File validation for uploads
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    maxFiles = 1
  } = options;

  const errors = [];

  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type
    }
  };
};

/**
 * Form validation helper
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    const fieldErrors = [];

    if (fieldRules.required && !isRequired(value)) {
      fieldErrors.push(`${field} is required`);
    }

    if (value && fieldRules.email && !isValidEmail(value)) {
      fieldErrors.push(`${field} must be a valid email`);
    }

    if (value && fieldRules.phone && !isValidPhone(value)) {
      fieldErrors.push(`${field} must be a valid phone number`);
    }

    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      fieldErrors.push(`${field} must be at least ${fieldRules.minLength} characters`);
    }

    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      fieldErrors.push(`${field} must be no more than ${fieldRules.maxLength} characters`);
    }

    if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      fieldErrors.push(fieldRules.patternMessage || `${field} format is invalid`);
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate Indian PAN number
 * @param {string} pan - PAN number to validate
 * @returns {boolean} True if PAN is valid
 */
export const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

/**
 * Validate Indian Aadhaar number
 * @param {string} aadhaar - Aadhaar number to validate
 * @returns {boolean} True if Aadhaar is valid
 */
export const isValidAadhaar = (aadhaar) => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
};

export default {
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidEmployeeId,
  isValidSalary,
  validateDateRange,
  isRequired,
  validateFile,
  validateForm,
  sanitizeInput,
  isValidPAN,
  isValidAadhaar
};
