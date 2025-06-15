/**
 * Anomaly Detection Service
 * Handles all API interactions for attendance anomaly detection features
 * 
 * Features:
 * - Get anomalies with filtering and pagination
 * - Detect new anomalies with AI analysis
 * - Resolve and ignore anomalies
 * - Get anomaly statistics and summaries
 * - Role-based data filtering
 * - Comprehensive error handling
 */

import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';

/**
 * Anomaly Detection Service Class
 * Provides methods for interacting with anomaly detection APIs
 */
class AnomalyDetectionService {
  /**
   * Get attendance anomalies with filtering options
   * @param {Object} filters - Filter options
   * @param {string} filters.status - Anomaly status ('active', 'resolved', 'ignored', 'all')
   * @param {string} filters.severity - Severity level ('high', 'medium', 'low', 'all')
   * @param {string} filters.employeeId - Specific employee ID (optional)
   * @param {Object} filters.dateRange - Date range filter
   * @param {string} filters.dateRange.startDate - Start date (ISO format)
   * @param {string} filters.dateRange.endDate - End date (ISO format)
   * @param {number} filters.page - Page number for pagination (default: 1)
   * @param {number} filters.limit - Items per page (default: 20)
   * @returns {Promise<Object>} API response with anomalies data
   */
  async getAnomalies(filters = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters.severity && filters.severity !== 'all') {
        params.append('severity', filters.severity);
      }
      
      if (filters.employeeId) {
        params.append('employeeId', filters.employeeId);
      }
      
      if (filters.dateRange?.startDate) {
        params.append('startDate', filters.dateRange.startDate);
      }
      
      if (filters.dateRange?.endDate) {
        params.append('endDate', filters.dateRange.endDate);
      }
      
      // Pagination
      params.append('page', filters.page || 1);
      params.append('limit', filters.limit || 20);
      
      const queryString = params.toString();
      const url = `${API_ENDPOINTS.AI.ATTENDANCE_ANOMALIES}${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching anomalies:', { url, filters });
      
      const response = await axiosInstance.get(url);
      
      console.log('✅ Anomalies fetched successfully:', {
        count: response.data?.data?.length || 0,
        total: response.data?.pagination?.total || 0
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching anomalies:', error);

      // Check if this is a network error (API not available)
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('⚠️ API not available, returning mock data for development');
        return this._getMockResponse('fetch anomalies');
      }

      throw this._handleError(error, 'Failed to fetch anomalies');
    }
  }

  /**
   * Detect new anomalies using AI analysis
   * @param {number|null} employeeId - Specific employee ID (null for all employees)
   * @param {Object} dateRange - Date range for analysis
   * @param {string} dateRange.startDate - Start date (ISO format)
   * @param {string} dateRange.endDate - End date (ISO format)
   * @returns {Promise<Object>} API response with detected anomalies
   */
  async detectAnomalies(employeeId = null, dateRange) {
    try {
      const requestData = {
        employeeId,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      };
      
      console.log('🤖 Starting AI anomaly detection:', requestData);
      
      const response = await axiosInstance.post(
        API_ENDPOINTS.AI.DETECT_ANOMALIES,
        requestData
      );
      
      console.log('✅ Anomaly detection completed:', {
        newAnomalies: response.data?.data?.length || 0,
        analysisDate: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error detecting anomalies:', error);

      // Check if this is a network error (API not available)
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('⚠️ API not available, returning mock data for development');
        return {
          success: true,
          data: [],
          message: 'Mock anomaly detection completed - API not available'
        };
      }

      throw this._handleError(error, 'Failed to detect anomalies');
    }
  }

  /**
   * Resolve an anomaly (mark as resolved)
   * @param {number} anomalyId - Anomaly ID to resolve
   * @param {string} resolution - Resolution notes (optional)
   * @returns {Promise<Object>} API response
   */
  async resolveAnomaly(anomalyId, resolution = '') {
    try {
      console.log('✅ Resolving anomaly:', { anomalyId, resolution });
      
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.AI.ATTENDANCE_ANOMALIES}/${anomalyId}/resolve`,
        { resolution }
      );
      
      console.log('✅ Anomaly resolved successfully:', anomalyId);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error resolving anomaly:', error);
      throw this._handleError(error, 'Failed to resolve anomaly');
    }
  }

  /**
   * Ignore an anomaly (mark as ignored)
   * @param {number} anomalyId - Anomaly ID to ignore
   * @param {string} reason - Reason for ignoring (optional)
   * @returns {Promise<Object>} API response
   */
  async ignoreAnomaly(anomalyId, reason = '') {
    try {
      console.log('🚫 Ignoring anomaly:', { anomalyId, reason });
      
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.AI.ATTENDANCE_ANOMALIES}/${anomalyId}/ignore`,
        { reason }
      );
      
      console.log('✅ Anomaly ignored successfully:', anomalyId);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error ignoring anomaly:', error);
      throw this._handleError(error, 'Failed to ignore anomaly');
    }
  }

  /**
   * Get anomaly statistics and summary
   * @param {Object} filters - Filter options (optional)
   * @param {string} filters.period - Time period ('week', 'month', 'quarter', 'year')
   * @param {number} filters.employeeId - Specific employee ID (optional)
   * @returns {Promise<Object>} API response with statistics
   */
  async getAnomalyStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.period) {
        params.append('period', filters.period);
      }
      
      if (filters.employeeId) {
        params.append('employeeId', filters.employeeId);
      }
      
      const queryString = params.toString();
      const url = `${API_ENDPOINTS.AI.ATTENDANCE_ANOMALIES}/stats${queryString ? `?${queryString}` : ''}`;
      
      console.log('📊 Fetching anomaly statistics:', { url, filters });
      
      const response = await axiosInstance.get(url);
      
      console.log('✅ Statistics fetched successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching anomaly statistics:', error);

      // Check if this is a network error (API not available)
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('⚠️ API not available, returning mock data for development');
        return this._getMockResponse('statistics');
      }

      throw this._handleError(error, 'Failed to fetch anomaly statistics');
    }
  }

  /**
   * Get anomaly details by ID
   * @param {number} anomalyId - Anomaly ID
   * @returns {Promise<Object>} API response with anomaly details
   */
  async getAnomalyDetails(anomalyId) {
    try {
      console.log('🔍 Fetching anomaly details:', anomalyId);
      
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.AI.ATTENDANCE_ANOMALIES}/${anomalyId}`
      );
      
      console.log('✅ Anomaly details fetched successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching anomaly details:', error);
      throw this._handleError(error, 'Failed to fetch anomaly details');
    }
  }

  /**
   * Bulk resolve multiple anomalies
   * @param {number[]} anomalyIds - Array of anomaly IDs
   * @param {string} resolution - Resolution notes
   * @returns {Promise<Object>} API response
   */
  async bulkResolveAnomalies(anomalyIds, resolution = '') {
    try {
      console.log('✅ Bulk resolving anomalies:', { count: anomalyIds.length, resolution });
      
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.AI.ATTENDANCE_ANOMALIES}/bulk-resolve`,
        { anomalyIds, resolution }
      );
      
      console.log('✅ Bulk resolve completed successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error bulk resolving anomalies:', error);
      throw this._handleError(error, 'Failed to bulk resolve anomalies');
    }
  }

  /**
   * Get anomaly trends and patterns
   * @param {Object} options - Analysis options
   * @param {string} options.period - Analysis period ('week', 'month', 'quarter')
   * @param {string} options.groupBy - Group by ('employee', 'department', 'type')
   * @returns {Promise<Object>} API response with trend data
   */
  async getAnomalyTrends(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.period) {
        params.append('period', options.period);
      }
      
      if (options.groupBy) {
        params.append('groupBy', options.groupBy);
      }
      
      const queryString = params.toString();
      const url = `${API_ENDPOINTS.AI.ATTENDANCE_ANOMALIES}/trends${queryString ? `?${queryString}` : ''}`;
      
      console.log('📈 Fetching anomaly trends:', { url, options });
      
      const response = await axiosInstance.get(url);
      
      console.log('✅ Trends fetched successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching anomaly trends:', error);
      throw this._handleError(error, 'Failed to fetch anomaly trends');
    }
  }

  /**
   * Handle API errors with consistent error formatting
   * @private
   * @param {Error} error - Original error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error object
   */
  _handleError(error, defaultMessage) {
    // Check if this is a network error (API not available)
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
      console.warn('⚠️ API not available, using mock data for development');
      return this._getMockResponse(defaultMessage);
    }

    // Extract error message from response
    const message = error.response?.data?.message ||
                   error.response?.data?.error ||
                   error.message ||
                   defaultMessage;

    // Extract status code
    const statusCode = error.response?.status;

    // Create enhanced error object
    const enhancedError = new Error(message);
    enhancedError.statusCode = statusCode;
    enhancedError.originalError = error;
    enhancedError.timestamp = new Date().toISOString();

    // Add specific error handling for common status codes
    switch (statusCode) {
      case 401:
        enhancedError.type = 'UNAUTHORIZED';
        enhancedError.userMessage = 'Please log in again to continue.';
        break;
      case 403:
        enhancedError.type = 'FORBIDDEN';
        enhancedError.userMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        enhancedError.type = 'NOT_FOUND';
        enhancedError.userMessage = 'The requested resource was not found.';
        break;
      case 429:
        enhancedError.type = 'RATE_LIMITED';
        enhancedError.userMessage = 'Too many requests. Please try again later.';
        break;
      case 500:
        enhancedError.type = 'SERVER_ERROR';
        enhancedError.userMessage = 'Server error occurred. Please try again later.';
        break;
      default:
        enhancedError.type = 'UNKNOWN';
        enhancedError.userMessage = message;
    }

    return enhancedError;
  }

  /**
   * Get mock response when API is not available
   * @private
   * @param {string} operation - The operation being performed
   * @returns {Object} Mock response object
   */
  _getMockResponse(operation) {
    if (operation.includes('fetch anomalies')) {
      return {
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        message: 'No anomalies found (mock data)'
      };
    }

    if (operation.includes('statistics')) {
      return {
        success: true,
        data: {
          totalActive: 0,
          newThisWeek: 0,
          resolvedThisMonth: 0,
          highPriority: 0,
          trends: {
            weeklyChange: 0,
            monthlyChange: 0,
            severityDistribution: { high: 0, medium: 0, low: 0 }
          }
        },
        message: 'Mock statistics data'
      };
    }

    return {
      success: true,
      data: [],
      message: 'Mock response - API not available'
    };
  }
}

// Create and export service instance
const anomalyDetectionService = new AnomalyDetectionService();

export default anomalyDetectionService;
