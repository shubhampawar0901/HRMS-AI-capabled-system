/**
 * Utility functions for role-based access control
 */

/**
 * Check if user can access chatbot functionality
 * Only employees are allowed to access the AI chatbot
 * @param {string} userRole - The user's role ('admin', 'manager', 'employee')
 * @returns {boolean} - True if user can access chatbot
 */
export const canAccessChatbot = (userRole) => {
  return userRole === 'employee';
};

/**
 * Check if user can access smart feedback functionality
 * Only managers are allowed to access smart feedback
 * @param {string} userRole - The user's role ('admin', 'manager', 'employee')
 * @returns {boolean} - True if user can access smart feedback
 */
export const canAccessSmartFeedback = (userRole) => {
  return userRole === 'manager';
};

/**
 * Check if user has any of the specified roles
 * @param {string} userRole - The user's role
 * @param {string|string[]} allowedRoles - Role or array of roles to check against
 * @returns {boolean} - True if user has one of the allowed roles
 */
export const hasRole = (userRole, allowedRoles) => {
  if (!userRole) return false;
  
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(userRole.toLowerCase());
  }
  
  return userRole.toLowerCase() === allowedRoles.toLowerCase();
};

/**
 * Get access denied message for chatbot
 * @returns {object} - Error message object
 */
export const getChatbotAccessDeniedMessage = () => ({
  title: 'Access Denied',
  message: 'AI Chatbot is only available for employees.',
  description: 'Please contact your administrator if you believe this is an error.'
});

/**
 * Get access denied message for smart feedback
 * @returns {object} - Error message object
 */
export const getSmartFeedbackAccessDeniedMessage = () => ({
  title: 'Access Denied',
  message: 'Smart Feedback is only available for managers.',
  description: 'This AI-powered feature helps managers generate constructive feedback for their team members.'
});

/**
 * Filter navigation items based on user role
 * @param {Array} navigationItems - Array of navigation items
 * @param {string} userRole - The user's role
 * @returns {Array} - Filtered navigation items
 */
export const filterNavigationByRole = (navigationItems, userRole) => {
  return navigationItems.filter(item => 
    item.roles && item.roles.includes(userRole)
  );
};
