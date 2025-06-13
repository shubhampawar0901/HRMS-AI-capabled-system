import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class ReportService {
  // Get reports
  async getReports(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.REPORTS.BASE}?${queryParams}` : API_ENDPOINTS.REPORTS.BASE;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'reports-list'
    );
  }

  // Generate report
  async generateReport(reportConfig) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.GENERATE, reportConfig),
      'report-generate'
    );
  }

  // Create custom report
  async createCustomReport(reportData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.CUSTOM, reportData),
      'report-custom-create'
    );
  }

  // Get report templates
  async getReportTemplates() {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.REPORTS.TEMPLATES),
      'report-templates'
    );
  }

  // Export report
  async exportReport(reportId, format = 'pdf', options = {}) {
    const params = { format, ...options };
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.REPORTS.EXPORT}/${reportId}?${queryParams}`, {
        responseType: 'blob'
      }),
      `report-export-${reportId}`
    );
  }

  // Schedule report
  async scheduleReport(scheduleData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.SCHEDULE, scheduleData),
      'report-schedule'
    );
  }

  // Get report history
  async getReportHistory(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.REPORTS.HISTORY}?${queryParams}` : API_ENDPOINTS.REPORTS.HISTORY;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'report-history'
    );
  }

  // Get attendance report
  async getAttendanceReport(params = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.GENERATE, {
        type: 'attendance',
        parameters: params
      }),
      'attendance-report'
    );
  }

  // Get leave report
  async getLeaveReport(params = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.GENERATE, {
        type: 'leave',
        parameters: params
      }),
      'leave-report'
    );
  }

  // Get payroll report
  async getPayrollReport(params = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.GENERATE, {
        type: 'payroll',
        parameters: params
      }),
      'payroll-report'
    );
  }

  // Get performance report
  async getPerformanceReport(params = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.GENERATE, {
        type: 'performance',
        parameters: params
      }),
      'performance-report'
    );
  }

  // Get employee report
  async getEmployeeReport(params = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.GENERATE, {
        type: 'employee',
        parameters: params
      }),
      'employee-report'
    );
  }

  // Get dashboard report
  async getDashboardReport(params = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.GENERATE, {
        type: 'dashboard',
        parameters: params
      }),
      'dashboard-report'
    );
  }

  // Delete report
  async deleteReport(reportId) {
    return apiRequest(
      () => axiosInstance.delete(`${API_ENDPOINTS.REPORTS.BASE}/${reportId}`),
      `report-delete-${reportId}`
    );
  }

  // Share report
  async shareReport(reportId, shareData) {
    return apiRequest(
      () => axiosInstance.post(`${API_ENDPOINTS.REPORTS.BASE}/${reportId}/share`, shareData),
      `report-share-${reportId}`
    );
  }
}

export const reportService = new ReportService();
export default reportService;
