import axiosInstance from './axiosInstance';

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          type: 'VALIDATION_ERROR',
          message: data.message || 'Invalid request data',
          errors: data.errors || []
        };
      case 401:
        return {
          type: 'UNAUTHORIZED',
          message: data.error?.message || data.message || 'Invalid credentials',
          shouldRedirect: !window.location.pathname.includes('/login')
        };
      case 403:
        return {
          type: 'FORBIDDEN',
          message: 'Access denied'
        };
      case 404:
        return {
          type: 'NOT_FOUND',
          message: 'Resource not found'
        };
      case 409:
        return {
          type: 'CONFLICT',
          message: data.message || 'Resource conflict'
        };
      case 422:
        return {
          type: 'VALIDATION_ERROR',
          message: data.message || 'Validation failed',
          errors: data.errors || []
        };
      case 429:
        return {
          type: 'RATE_LIMIT',
          message: 'Too many requests. Please try again later.'
        };
      case 500:
        return {
          type: 'SERVER_ERROR',
          message: 'Internal server error. Please try again later.'
        };
      default:
        return {
          type: 'UNKNOWN_ERROR',
          message: data.message || 'An unexpected error occurred'
        };
    }
  } else if (error.request) {
    // Network error
    return {
      type: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.'
    };
  } else {
    // Request setup error
    return {
      type: 'REQUEST_ERROR',
      message: error.message || 'Request failed'
    };
  }
};

// Success response handler
export const handleApiSuccess = (response) => {
  return {
    data: response.data,
    status: response.status,
    message: response.data.message || 'Success'
  };
};

// Loading state manager
export class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
  }

  setLoading(key, isLoading) {
    this.loadingStates.set(key, isLoading);
  }

  isLoading(key) {
    return this.loadingStates.get(key) || false;
  }

  clearLoading(key) {
    this.loadingStates.delete(key);
  }

  clearAllLoading() {
    this.loadingStates.clear();
  }
}

export const loadingManager = new LoadingManager();

// Request wrapper with loading and error handling
export const apiRequest = async (requestFn, loadingKey = null) => {
  try {
    if (loadingKey) {
      loadingManager.setLoading(loadingKey, true);
    }

    const response = await requestFn();
    return handleApiSuccess(response);
  } catch (error) {
    const errorInfo = handleApiError(error);
    
    // Handle redirect for unauthorized errors
    if (errorInfo.shouldRedirect) {
      window.location.href = '/login';
    }
    
    throw errorInfo;
  } finally {
    if (loadingKey) {
      loadingManager.setLoading(loadingKey, false);
    }
  }
};

export default {
  handleApiError,
  handleApiSuccess,
  LoadingManager,
  loadingManager,
  apiRequest
};
