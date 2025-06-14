import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class ReportService {
  // ==========================================
  // STANDARD REPORTS (Match Backend APIs)
  // ==========================================

  // Get attendance report
  async getAttendanceReport(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.REPORTS.ATTENDANCE}?${queryParams}` : API_ENDPOINTS.REPORTS.ATTENDANCE;

    return apiRequest(
      () => axiosInstance.get(url),
      'attendance-report'
    );
  }

  // Get leave report
  async getLeaveReport(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.REPORTS.LEAVE}?${queryParams}` : API_ENDPOINTS.REPORTS.LEAVE;

    return apiRequest(
      () => axiosInstance.get(url),
      'leave-report'
    );
  }

  // Get payroll report (Admin only)
  async getPayrollReport(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.REPORTS.PAYROLL}?${queryParams}` : API_ENDPOINTS.REPORTS.PAYROLL;

    return apiRequest(
      () => axiosInstance.get(url),
      'payroll-report'
    );
  }

  // Get performance report
  async getPerformanceReport(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.REPORTS.PERFORMANCE}?${queryParams}` : API_ENDPOINTS.REPORTS.PERFORMANCE;

    return apiRequest(
      () => axiosInstance.get(url),
      'performance-report'
    );
  }

  // ==========================================
  // AI SMART REPORTS
  // ==========================================

  // Generate AI smart report (Admin/Manager only)
  async generateSmartReport(reportType, parameters = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.REPORTS.SMART, {
        reportType,
        parameters
      }),
      'smart-report'
    );
  }

  // ==========================================
  // DASHBOARD ANALYTICS
  // ==========================================

  // Get dashboard analytics
  async getDashboardAnalytics() {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.REPORTS.ANALYTICS),
      'dashboard-analytics'
    );
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  // Get all available report types based on user role
  getAvailableReports(userRole) {
    const baseReports = [
      {
        id: 'attendance',
        name: 'Attendance Report',
        description: 'Employee attendance tracking and statistics',
        icon: '📊',
        roles: ['admin', 'manager', 'employee']
      },
      {
        id: 'leave',
        name: 'Leave Report',
        description: 'Leave applications and balance tracking',
        icon: '🏖️',
        roles: ['admin', 'manager', 'employee']
      },
      {
        id: 'performance',
        name: 'Performance Report',
        description: 'Employee performance reviews and goals',
        icon: '🎯',
        roles: ['admin', 'manager', 'employee']
      }
    ];

    const adminReports = [
      {
        id: 'payroll',
        name: 'Payroll Report',
        description: 'Salary and payroll processing data',
        icon: '💰',
        roles: ['admin']
      }
    ];

    const smartReports = [
      {
        id: 'smart',
        name: 'AI Smart Reports',
        description: 'AI-powered insights and recommendations',
        icon: '🤖',
        roles: ['admin', 'manager']
      }
    ];

    let availableReports = [...baseReports];

    if (userRole === 'admin') {
      availableReports = [...availableReports, ...adminReports, ...smartReports];
    } else if (userRole === 'manager') {
      availableReports = [...availableReports, ...smartReports];
    }

    return availableReports.filter(report => report.roles.includes(userRole));
  }

  // Format report parameters for API calls
  formatReportParams(reportType, filters = {}) {
    const baseParams = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      departmentId: filters.departmentId,
      employeeId: filters.employeeId
    };

    // Remove undefined values
    return Object.fromEntries(
      Object.entries(baseParams).filter(([_, value]) => value !== undefined)
    );
  }
}

export const reportService = new ReportService();
export default reportService;
