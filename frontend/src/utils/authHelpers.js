/**
 * Authentication helper utilities
 */

/**
 * Check if user has specific role
 * @param {Object} user - User object
 * @param {string|Array} roles - Role(s) to check
 * @returns {boolean} True if user has role
 */
export const hasRole = (user, roles) => {
  if (!user || !user.role) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
};

/**
 * Check if user has specific permission
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  
  return user.permissions.includes(permission);
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

/**
 * Check if user is manager
 * @param {Object} user - User object
 * @returns {boolean} True if user is manager or admin
 */
export const isManager = (user) => {
  return hasRole(user, ['admin', 'manager']);
};

/**
 * Check if user is employee (any role)
 * @param {Object} user - User object
 * @returns {boolean} True if user has any employee role
 */
export const isEmployee = (user) => {
  return hasRole(user, ['admin', 'manager', 'employee']);
};

/**
 * Get user's display name
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export const getDisplayName = (user) => {
  if (!user) return 'Guest';
  
  return user.name || user.email || 'Unknown User';
};

/**
 * Get user's avatar URL or initials
 * @param {Object} user - User object
 * @returns {Object} Avatar info
 */
export const getAvatarInfo = (user) => {
  const name = getDisplayName(user);
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
  
  return {
    url: user?.avatar || null,
    initials,
    name
  };
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Get time until token expires
 * @param {string} token - JWT token
 * @returns {number} Minutes until expiration, -1 if expired/invalid
 */
export const getTokenTimeRemaining = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return -1;
  
  const now = new Date();
  const diffMs = expiration.getTime() - now.getTime();
  
  if (diffMs <= 0) return -1;
  
  return Math.floor(diffMs / (1000 * 60)); // Convert to minutes
};

/**
 * Format role for display
 * @param {string} role - User role
 * @returns {string} Formatted role
 */
export const formatRole = (role) => {
  if (!role) return 'Employee';
  
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get role-based dashboard route
 * @param {Object} user - User object
 * @returns {string} Dashboard route
 */
export const getDashboardRoute = (user) => {
  if (!user) return '/login';
  
  switch (user.role) {
    case 'admin':
      return '/dashboard';
    case 'manager':
      return '/dashboard';
    case 'employee':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

/**
 * Get allowed routes for user role
 * @param {Object} user - User object
 * @returns {Array} Array of allowed route patterns
 */
export const getAllowedRoutes = (user) => {
  if (!user) return ['/login'];
  
  const baseRoutes = ['/dashboard', '/profile', '/attendance'];
  
  switch (user.role) {
    case 'admin':
      return [
        ...baseRoutes,
        '/employees',
        '/leave/approvals',
        '/payroll',
        '/performance',
        '/ai-features',
        '/reports'
      ];
    case 'manager':
      return [
        ...baseRoutes,
        '/employees',
        '/leave/approvals',
        '/performance',
        '/reports'
      ];
    case 'employee':
      return [
        ...baseRoutes,
        '/leave',
        '/payroll',
        '/performance'
      ];
    default:
      return baseRoutes;
  }
};

/**
 * Check if user can access route
 * @param {Object} user - User object
 * @param {string} route - Route to check
 * @returns {boolean} True if user can access route
 */
export const canAccessRoute = (user, route) => {
  const allowedRoutes = getAllowedRoutes(user);
  
  return allowedRoutes.some(allowedRoute => {
    if (allowedRoute === route) return true;
    if (route.startsWith(allowedRoute + '/')) return true;
    return false;
  });
};

/**
 * Generate secure password requirements
 * @returns {Object} Password requirements
 */
export const getPasswordRequirements = () => {
  return {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxLength: 128
  };
};

/**
 * Validate password against requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  const requirements = getPasswordRequirements();
  const errors = [];
  
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }
  
  if (password.length > requirements.maxLength) {
    errors.push(`Password must be no more than ${requirements.maxLength} characters long`);
  }
  
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calculate password strength
 * @param {string} password - Password to analyze
 * @returns {Object} Strength analysis
 */
export const calculatePasswordStrength = (password) => {
  let score = 0;
  let feedback = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  // Complexity patterns
  if (password.length >= 16) score += 1;
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) score += 1;
  
  let strength = 'weak';
  if (score >= 6) strength = 'strong';
  else if (score >= 4) strength = 'medium';
  
  return {
    score,
    strength,
    feedback
  };
};

export default {
  hasRole,
  hasPermission,
  isAdmin,
  isManager,
  isEmployee,
  getDisplayName,
  getAvatarInfo,
  isTokenExpired,
  getTokenExpiration,
  getTokenTimeRemaining,
  formatRole,
  getDashboardRoute,
  getAllowedRoutes,
  canAccessRoute,
  getPasswordRequirements,
  validatePassword,
  calculatePasswordStrength
};
