import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class AIService {
  // Chatbot query
  async chatbotQuery(query, context = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.AI.CHATBOT, { query, context }),
      'ai-chatbot'
    );
  }

  // Attrition prediction
  async predictAttrition(employeeId = null) {
    const params = employeeId ? { employeeId } : {};
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.AI.ATTRITION}?${queryParams}` 
      : API_ENDPOINTS.AI.ATTRITION;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'ai-attrition'
    );
  }

  // Anomaly detection
  async detectAnomalies(type = 'attendance', params = {}) {
    const requestParams = { type, ...params };
    const queryParams = new URLSearchParams(requestParams).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.AI.ANOMALY}?${queryParams}`),
      'ai-anomaly'
    );
  }

  // Generate smart reports
  async generateSmartReport(reportType, parameters = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.AI.SMART_REPORTS, {
        reportType,
        parameters
      }),
      'ai-smart-reports'
    );
  }

  // Parse resume
  async parseResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.AI.PARSE_RESUME, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      'ai-resume-parser'
    );
  }

  // Generate feedback
  async generateFeedback(employeeId, performanceData = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.AI.FEEDBACK, {
        employeeId,
        performanceData
      }),
      'ai-feedback'
    );
  }

  // Get AI insights for dashboard
  async getDashboardInsights(userId, role) {
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.AI.CHATBOT}/insights`, {
        params: { userId, role }
      }),
      'ai-dashboard-insights'
    );
  }

  // Get AI recommendations
  async getRecommendations(type, context = {}) {
    return apiRequest(
      () => axiosInstance.post(`${API_ENDPOINTS.AI.CHATBOT}/recommendations`, {
        type,
        context
      }),
      'ai-recommendations'
    );
  }
}

export const aiService = new AIService();
export default aiService;
