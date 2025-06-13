import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class PerformanceService {
  // Get performance reviews
  async getPerformanceReviews(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.PERFORMANCE.REVIEWS}?${queryParams}` : API_ENDPOINTS.PERFORMANCE.REVIEWS;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'performance-reviews'
    );
  }

  // Get performance review by ID
  async getPerformanceReviewById(id) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.PERFORMANCE.BY_ID(id)),
      `performance-review-${id}`
    );
  }

  // Create performance review
  async createPerformanceReview(reviewData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.PERFORMANCE.CREATE_REVIEW, reviewData),
      'performance-review-create'
    );
  }

  // Update performance review
  async updatePerformanceReview(id, reviewData) {
    return apiRequest(
      () => axiosInstance.put(API_ENDPOINTS.PERFORMANCE.UPDATE_REVIEW(id), reviewData),
      `performance-review-update-${id}`
    );
  }

  // Get goals
  async getGoals(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.PERFORMANCE.GOALS}?${queryParams}` : API_ENDPOINTS.PERFORMANCE.GOALS;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'performance-goals'
    );
  }

  // Create goal
  async createGoal(goalData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.PERFORMANCE.CREATE_GOAL, goalData),
      'performance-goal-create'
    );
  }

  // Update goal
  async updateGoal(id, goalData) {
    return apiRequest(
      () => axiosInstance.put(API_ENDPOINTS.PERFORMANCE.UPDATE_GOAL(id), goalData),
      `performance-goal-update-${id}`
    );
  }

  // Submit feedback
  async submitFeedback(feedbackData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.PERFORMANCE.FEEDBACK, feedbackData),
      'performance-feedback'
    );
  }

  // Get performance analytics
  async getPerformanceAnalytics(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.PERFORMANCE.ANALYTICS}?${queryParams}` : API_ENDPOINTS.PERFORMANCE.ANALYTICS;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'performance-analytics'
    );
  }

  // Get employee performance
  async getEmployeePerformance(employeeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.PERFORMANCE.EMPLOYEE_PERFORMANCE(employeeId)}?${queryParams}` 
      : API_ENDPOINTS.PERFORMANCE.EMPLOYEE_PERFORMANCE(employeeId);
    
    return apiRequest(
      () => axiosInstance.get(url),
      `employee-performance-${employeeId}`
    );
  }

  // Get performance trends
  async getPerformanceTrends(employeeId, period = '12months') {
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.PERFORMANCE.EMPLOYEE_PERFORMANCE(employeeId)}/trends`, {
        params: { period }
      }),
      `performance-trends-${employeeId}`
    );
  }

  // Get team performance (for managers)
  async getTeamPerformance(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.PERFORMANCE.BASE}/team${queryParams ? `?${queryParams}` : ''}`),
      'team-performance'
    );
  }

  // Generate performance report
  async generatePerformanceReport(employeeId, period) {
    return apiRequest(
      () => axiosInstance.post(`${API_ENDPOINTS.PERFORMANCE.BASE}/report`, {
        employeeId,
        period
      }),
      'performance-report'
    );
  }

  // Get performance metrics
  async getPerformanceMetrics(employeeId = null, period = 'month') {
    const params = { period };
    if (employeeId) params.employeeId = employeeId;
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.PERFORMANCE.BASE}/metrics?${queryParams}`),
      'performance-metrics'
    );
  }
}

export const performanceService = new PerformanceService();
export default performanceService;
