/**
 * Token management utilities for authentication
 */

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Token storage utilities
 */
export const tokenStorage = {
  /**
   * Get token from localStorage
   * @returns {string|null} Token or null if not found
   */
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Set token in localStorage
   * @param {string} token - Token to store
   */
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  /**
   * Get refresh token from localStorage
   * @returns {string|null} Refresh token or null if not found
   */
  getRefreshToken: () => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Set refresh token in localStorage
   * @param {string} refreshToken - Refresh token to store
   */
  setRefreshToken: (refreshToken) => {
    try {
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  },

  /**
   * Get user data from localStorage
   * @returns {Object|null} User object or null if not found
   */
  getUser: () => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Set user data in localStorage
   * @param {Object} user - User object to store
   */
  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  },

  /**
   * Clear all auth data from localStorage
   */
  clearAll: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  /**
   * Check if auth data exists
   * @returns {boolean} True if token exists
   */
  hasAuthData: () => {
    return !!tokenStorage.getToken();
  }
};

/**
 * JWT token utilities
 */
export const jwtUtils = {
  /**
   * Decode JWT token payload
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded payload or null if invalid
   */
  decodeToken: (token) => {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if token is expired
   */
  isTokenExpired: (token) => {
    const payload = jwtUtils.decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  },

  /**
   * Get token expiration date
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date or null if invalid
   */
  getTokenExpiration: (token) => {
    const payload = jwtUtils.decodeToken(token);
    if (!payload || !payload.exp) return null;
    
    return new Date(payload.exp * 1000);
  },

  /**
   * Get time remaining until token expires
   * @param {string} token - JWT token
   * @returns {number} Seconds remaining, -1 if expired/invalid
   */
  getTimeRemaining: (token) => {
    const payload = jwtUtils.decodeToken(token);
    if (!payload || !payload.exp) return -1;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const remaining = payload.exp - currentTime;
    
    return remaining > 0 ? remaining : -1;
  },

  /**
   * Check if token needs refresh (expires within threshold)
   * @param {string} token - JWT token
   * @param {number} thresholdMinutes - Threshold in minutes (default: 5)
   * @returns {boolean} True if token needs refresh
   */
  needsRefresh: (token, thresholdMinutes = 5) => {
    const remaining = jwtUtils.getTimeRemaining(token);
    if (remaining === -1) return true;
    
    const thresholdSeconds = thresholdMinutes * 60;
    return remaining < thresholdSeconds;
  },

  /**
   * Get user ID from token
   * @param {string} token - JWT token
   * @returns {string|null} User ID or null if not found
   */
  getUserIdFromToken: (token) => {
    const payload = jwtUtils.decodeToken(token);
    return payload?.sub || payload?.userId || payload?.id || null;
  },

  /**
   * Get user role from token
   * @param {string} token - JWT token
   * @returns {string|null} User role or null if not found
   */
  getRoleFromToken: (token) => {
    const payload = jwtUtils.decodeToken(token);
    return payload?.role || null;
  }
};

/**
 * Token refresh manager
 */
export const tokenRefreshManager = {
  refreshPromise: null,

  /**
   * Refresh token with retry logic
   * @param {Function} refreshFunction - Function to call for refresh
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise} Refresh promise
   */
  refreshToken: async (refreshFunction, maxRetries = 3) => {
    // Prevent multiple simultaneous refresh attempts
    if (tokenRefreshManager.refreshPromise) {
      return tokenRefreshManager.refreshPromise;
    }

    tokenRefreshManager.refreshPromise = (async () => {
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await refreshFunction();
          
          if (result && result.token) {
            tokenStorage.setToken(result.token);
            if (result.refreshToken) {
              tokenStorage.setRefreshToken(result.refreshToken);
            }
            if (result.user) {
              tokenStorage.setUser(result.user);
            }
          }
          
          return result;
        } catch (error) {
          lastError = error;
          console.error(`Token refresh attempt ${attempt} failed:`, error);
          
          if (attempt < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }
      
      // All attempts failed, clear tokens
      tokenStorage.clearAll();
      throw lastError;
    })();

    try {
      const result = await tokenRefreshManager.refreshPromise;
      return result;
    } finally {
      tokenRefreshManager.refreshPromise = null;
    }
  },

  /**
   * Cancel ongoing refresh
   */
  cancelRefresh: () => {
    tokenRefreshManager.refreshPromise = null;
  }
};

/**
 * Auto-refresh token setup
 */
export const autoRefreshSetup = {
  intervalId: null,
  
  /**
   * Start auto-refresh timer
   * @param {Function} refreshFunction - Function to call for refresh
   * @param {number} checkIntervalMinutes - Check interval in minutes
   */
  start: (refreshFunction, checkIntervalMinutes = 1) => {
    autoRefreshSetup.stop(); // Clear any existing interval
    
    autoRefreshSetup.intervalId = setInterval(async () => {
      const token = tokenStorage.getToken();
      
      if (token && jwtUtils.needsRefresh(token)) {
        try {
          await tokenRefreshManager.refreshToken(refreshFunction);
        } catch (error) {
          console.error('Auto-refresh failed:', error);
          // Could dispatch logout action here
        }
      }
    }, checkIntervalMinutes * 60 * 1000);
  },

  /**
   * Stop auto-refresh timer
   */
  stop: () => {
    if (autoRefreshSetup.intervalId) {
      clearInterval(autoRefreshSetup.intervalId);
      autoRefreshSetup.intervalId = null;
    }
  }
};

/**
 * Session management
 */
export const sessionManager = {
  /**
   * Initialize session from stored data
   * @returns {Object|null} Session data or null
   */
  initializeSession: () => {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser();
    
    if (!token || jwtUtils.isTokenExpired(token)) {
      sessionManager.clearSession();
      return null;
    }
    
    return {
      token,
      user,
      isAuthenticated: true
    };
  },

  /**
   * Clear session data
   */
  clearSession: () => {
    tokenStorage.clearAll();
    autoRefreshSetup.stop();
    tokenRefreshManager.cancelRefresh();
  },

  /**
   * Check if session is valid
   * @returns {boolean} True if session is valid
   */
  isSessionValid: () => {
    const token = tokenStorage.getToken();
    return token && !jwtUtils.isTokenExpired(token);
  }
};

export default {
  tokenStorage,
  jwtUtils,
  tokenRefreshManager,
  autoRefreshSetup,
  sessionManager
};
