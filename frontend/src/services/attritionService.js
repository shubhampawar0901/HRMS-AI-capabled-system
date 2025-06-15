import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

/**
 * Attrition Prediction Service
 * Handles all API calls related to employee attrition prediction
 */
class AttritionService {
  /**
   * Get attrition predictions with filtering
   * @param {Object} filters - Filter parameters
   * @param {number} filters.riskThreshold - Risk threshold (0.0-1.0)
   * @param {string} filters.sortBy - Sort field
   * @param {string} filters.sortOrder - Sort order (asc/desc)
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise<Object>} API response with predictions
   */
  async getPredictions(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Add filter parameters
      if (filters.riskThreshold && filters.riskThreshold !== 'all') {
        params.append('riskThreshold', parseFloat(filters.riskThreshold));
      }
      
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }
      
      if (filters.page) {
        params.append('page', parseInt(filters.page));
      }
      
      if (filters.limit) {
        params.append('limit', parseInt(filters.limit));
      }

      const url = params.toString() 
        ? `${API_ENDPOINTS.AI.ATTRITION_PREDICTIONS}?${params.toString()}`
        : API_ENDPOINTS.AI.ATTRITION_PREDICTIONS;

      const response = await apiRequest(
        () => axiosInstance.get(url),
        'attrition-predictions'
      );

      return this.transformPredictionsResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch attrition predictions');
    }
  }

  /**
   * Generate attrition prediction for a specific employee
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Object>} Generated prediction
   */
  async generatePrediction(employeeId) {
    try {
      if (!employeeId || !Number.isInteger(employeeId)) {
        throw new Error('Valid employee ID is required');
      }

      const response = await apiRequest(
        () => axiosInstance.post(API_ENDPOINTS.AI.ATTRITION_PREDICTIONS, {
          employeeId: employeeId
        }),
        'generate-attrition-prediction'
      );

      return this.transformSinglePrediction(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to generate attrition prediction');
    }
  }

  /**
   * Get employee details for prediction context
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Object>} Employee details
   */
  async getEmployeeContext(employeeId) {
    try {
      const response = await apiRequest(
        () => axiosInstance.get(`/employees/${employeeId}`),
        'employee-context'
      );

      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch employee context');
    }
  }

  /**
   * Transform API response for predictions list
   * @param {Object} response - Raw API response
   * @returns {Object} Transformed response
   */
  transformPredictionsResponse(response) {
    if (!response.success || !response.data?.predictions) {
      throw new Error(response.message || 'Invalid response format');
    }

    return {
      ...response,
      data: {
        ...response.data,
        predictions: response.data.predictions.map(prediction => 
          this.transformPredictionData(prediction)
        )
      }
    };
  }

  /**
   * Transform single prediction response
   * @param {Object} response - Raw API response
   * @returns {Object} Transformed response
   */
  transformSinglePrediction(response) {
    if (!response.success || !response.data?.prediction) {
      throw new Error(response.message || 'Invalid prediction response');
    }

    return {
      ...response,
      data: {
        ...response.data,
        prediction: this.transformPredictionData(response.data.prediction)
      }
    };
  }

  /**
   * Transform individual prediction data for UI consumption
   * @param {Object} prediction - Raw prediction data
   * @returns {Object} Transformed prediction data
   */
  transformPredictionData(prediction) {
    return {
      // Core data from API
      employeeId: prediction.employeeId,
      employeeName: prediction.employeeName || 'Unknown Employee',
      riskScore: prediction.riskScore || 0,
      riskLevel: prediction.riskLevel || 'low',
      factors: prediction.factors || [],
      recommendations: prediction.recommendations || [],

      // Computed fields for UI
      riskPercentage: Math.round((prediction.riskScore || 0) * 100),
      riskColor: this.getRiskColor(prediction.riskLevel),
      riskVariant: this.getRiskVariant(prediction.riskLevel),
      factorCount: (prediction.factors || []).length,
      recommendationCount: (prediction.recommendations || []).length,

      // Default values for missing fields
      department: prediction.department || 'N/A',
      position: prediction.position || 'N/A',
      predictionDate: prediction.predictionDate || new Date().toISOString(),
      modelVersion: prediction.modelVersion || '1.0',
      confidence: prediction.confidence || 0.85,

      // UI state
      isExpanded: false,
      isSelected: false
    };
  }

  /**
   * Get risk level color
   * @param {string} riskLevel - Risk level
   * @returns {string} Color code
   */
  getRiskColor(riskLevel) {
    const colors = {
      low: '#10b981',     // green-500
      medium: '#f59e0b',  // amber-500
      high: '#ef4444',    // red-500
      critical: '#dc2626' // red-600
    };
    return colors[riskLevel] || '#6b7280';
  }

  /**
   * Get risk level variant for UI components
   * @param {string} riskLevel - Risk level
   * @returns {string} Variant name
   */
  getRiskVariant(riskLevel) {
    const variants = {
      low: 'success',
      medium: 'warning',
      high: 'destructive',
      critical: 'destructive'
    };
    return variants[riskLevel] || 'secondary';
  }

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - Original error
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Enhanced error
   */
  handleApiError(error, defaultMessage) {
    let message = defaultMessage;
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      
      switch (statusCode) {
        case 401:
          message = 'Authentication required. Please log in again.';
          break;
        case 403:
          message = 'Access denied. Admin privileges required for attrition predictions.';
          break;
        case 404:
          message = 'Employee not found or prediction data unavailable.';
          break;
        case 429:
          message = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        default:
          message = error.response.data?.message || defaultMessage;
      }
    } else if (error.request) {
      message = 'Network error. Please check your connection and try again.';
    }

    const enhancedError = new Error(message);
    enhancedError.statusCode = statusCode;
    enhancedError.originalError = error;
    
    return enhancedError;
  }

  /**
   * Format factor labels for display
   * @param {string} factor - Raw factor string
   * @returns {string} Formatted factor label
   */
  formatFactorLabel(factor) {
    return factor
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format recommendation titles for display
   * @param {string} recommendation - Raw recommendation string
   * @returns {string} Formatted recommendation title
   */
  formatRecommendationTitle(recommendation) {
    return recommendation
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get recommendation description
   * @param {string} recommendation - Recommendation key
   * @returns {string} Description text
   */
  getRecommendationDescription(recommendation) {
    const descriptions = {
      schedule_one_on_one: 'Schedule a private meeting to discuss career goals and concerns',
      review_workload: 'Assess current workload and redistribute tasks if necessary',
      career_development: 'Provide opportunities for skill development and career advancement',
      workload_adjustment: 'Reduce or redistribute workload to prevent burnout',
      performance_improvement: 'Implement a structured performance improvement plan',
      team_integration: 'Improve team dynamics and collaboration opportunities'
    };
    
    return descriptions[recommendation] || 'Take appropriate action based on risk factors';
  }
}

// Export singleton instance
export default new AttritionService();
