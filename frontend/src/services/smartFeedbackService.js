import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class SmartFeedbackService {
  /**
   * Generate AI-powered smart feedback for an employee
   * @param {Object} feedbackData - Feedback generation data
   * @param {number} feedbackData.employeeId - Employee ID
   * @param {string} feedbackData.feedbackType - Type of feedback (performance, development, career, general)
   * @param {Object} feedbackData.performanceData - Performance data for the employee
   * @returns {Promise} API response with generated feedback
   */
  async generateSmartFeedback(feedbackData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.AI.SMART_FEEDBACK_GENERATE, feedbackData),
      'smart-feedback-generate'
    );
  }

  /**
   * Get smart feedback history for an employee
   * @param {number} employeeId - Employee ID
   * @param {Object} params - Query parameters
   * @param {string} params.feedbackType - Filter by feedback type (optional)
   * @param {number} params.limit - Number of records to return (optional, default: 10)
   * @returns {Promise} API response with feedback history
   */
  async getFeedbackHistory(employeeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.AI.SMART_FEEDBACK_HISTORY(employeeId)}?${queryParams}` 
      : API_ENDPOINTS.AI.SMART_FEEDBACK_HISTORY(employeeId);
    
    return apiRequest(
      () => axiosInstance.get(url),
      `smart-feedback-history-${employeeId}`
    );
  }

  /**
   * Generate smart feedback using Performance API (alternative endpoint)
   * @param {Object} feedbackData - Feedback generation data
   * @param {number} feedbackData.employeeId - Employee ID
   * @returns {Promise} API response with generated feedback
   */
  async generateFeedbackViaPerformance(feedbackData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.PERFORMANCE.GENERATE_FEEDBACK, feedbackData),
      'performance-feedback-generate'
    );
  }

  /**
   * Get feedback history using Performance API (alternative endpoint)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (optional)
   * @param {number} params.limit - Number of records per page (optional)
   * @returns {Promise} API response with feedback history
   */
  async getFeedbackHistoryViaPerformance(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.PERFORMANCE.FEEDBACK_HISTORY}?${queryParams}`
      : API_ENDPOINTS.PERFORMANCE.FEEDBACK_HISTORY;

    return apiRequest(
      () => axiosInstance.get(url),
      'performance-feedback-history'
    );
  }

  /**
   * Update smart feedback (for editing/sending feedback)
   * @param {number} feedbackId - Feedback ID
   * @param {Object} updateData - Updated feedback data
   * @param {string} updateData.generatedFeedback - Updated feedback text
   * @param {Object} updateData.performanceData - Updated performance data (optional)
   * @param {Array} updateData.suggestions - Updated suggestions (optional)
   * @param {number} updateData.confidence - Updated confidence score (optional)
   * @param {boolean} sendEmail - Whether to send email to employee (optional)
   * @returns {Promise} API response with updated feedback
   */
  async updateSmartFeedback(feedbackId, updateData, sendEmail = false) {
    return apiRequest(
      () => axiosInstance.put(`${API_ENDPOINTS.AI.SMART_FEEDBACK_GENERATE}/update/${feedbackId}`, {
        ...updateData,
        sendEmail // ✅ NEW: Include email flag
      }),
      `smart-feedback-update-${feedbackId}`
    );
  }

  /**
   * Get available feedback types
   * @returns {Array} Array of feedback types
   */
  getFeedbackTypes() {
    return [
      { value: 'performance', label: 'Performance Review', description: 'Overall performance assessment and feedback' },
      { value: 'development', label: 'Development', description: 'Skill development and growth opportunities' },
      { value: 'career', label: 'Career Growth', description: 'Career progression and advancement guidance' },
      { value: 'general', label: 'General', description: 'General feedback and observations' }
    ];
  }

  /**
   * Validate feedback data before submission
   * @param {Object} feedbackData - Feedback data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateFeedbackData(feedbackData) {
    const errors = [];
    
    if (!feedbackData.employeeId) {
      errors.push('Employee ID is required');
    }
    
    if (!feedbackData.feedbackType) {
      errors.push('Feedback type is required');
    }
    
    const validTypes = ['performance', 'development', 'career', 'general'];
    if (feedbackData.feedbackType && !validTypes.includes(feedbackData.feedbackType)) {
      errors.push('Invalid feedback type');
    }
    
    if (!feedbackData.performanceData || typeof feedbackData.performanceData !== 'object') {
      errors.push('Performance data is required and must be an object');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format performance data for AI processing
   * @param {Object} rawData - Raw performance data
   * @returns {Object} Formatted performance data
   */
  formatPerformanceData(rawData) {
    return {
      attendance_rate: rawData.attendanceRate || 0,
      goals_completed: rawData.goalsCompleted || 0,
      total_goals: rawData.totalGoals || 0,
      peer_ratings: rawData.peerRatings || 0,
      manager_rating: rawData.managerRating || 0,
      projects_completed: rawData.projectsCompleted || 0,
      training_hours: rawData.trainingHours || 0,
      leave_days_taken: rawData.leaveDaysTaken || 0,
      performance_score: rawData.performanceScore || 0,
      last_review_date: rawData.lastReviewDate || null,
      ...rawData
    };
  }
}

export const smartFeedbackService = new SmartFeedbackService();
export default smartFeedbackService;
