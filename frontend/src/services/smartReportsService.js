import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

/**
 * Smart Reports Service
 * Handles all API calls related to AI-powered smart reports
 * Supports employee and team performance reports with natural language summaries
 */
class SmartReportsService {
  
  /**
   * Generate new smart report
   * @param {Object} reportData - Report generation data
   * @param {string} reportData.reportType - "employee" or "team"
   * @param {number} reportData.targetId - employee_id for employee reports, manager_id for team reports
   * @param {string} reportData.reportName - Optional custom report name
   * @param {Object} reportData.dateRange - Optional date range
   * @param {string} reportData.dateRange.startDate - Start date (ISO format)
   * @param {string} reportData.dateRange.endDate - End date (ISO format)
   * @returns {Promise} API response with generated report data
   */
  async generateReport(reportData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.SMART_REPORTS.GENERATE, reportData),
      'smart-reports-generate'
    );
  }

  /**
   * List smart reports with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 20)
   * @param {string} params.reportType - Filter by report type ("employee", "team")
   * @param {string} params.status - Filter by status ("generating", "completed", "failed")
   * @returns {Promise} API response with reports list and pagination
   */
  async getReports(params = {}) {
    const queryParams = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const url = queryParams 
      ? `${API_ENDPOINTS.SMART_REPORTS.LIST}?${queryParams}` 
      : API_ENDPOINTS.SMART_REPORTS.LIST;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'smart-reports-list'
    );
  }

  /**
   * Get specific report by ID
   * @param {number} id - Report ID
   * @returns {Promise} API response with complete report data
   */
  async getReportById(id) {
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.SMART_REPORTS.GET}/${id}`),
      'smart-reports-get'
    );
  }

  /**
   * Get report generation status
   * @param {number} id - Report ID
   * @returns {Promise} API response with report status
   */
  async getReportStatus(id) {
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.SMART_REPORTS.STATUS}/${id}/status`),
      'smart-reports-status'
    );
  }

  /**
   * Delete report
   * @param {number} id - Report ID
   * @returns {Promise} API response confirming deletion
   */
  async deleteReport(id) {
    return apiRequest(
      () => axiosInstance.delete(`${API_ENDPOINTS.SMART_REPORTS.DELETE}/${id}`),
      'smart-reports-delete'
    );
  }

  /**
   * Generate report using AI service endpoint (alternative)
   * @param {Object} reportData - Report generation data
   * @returns {Promise} API response with generated report data
   */
  async generateReportViaAI(reportData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.AI.SMART_REPORTS, reportData),
      'ai-smart-reports-generate'
    );
  }

  /**
   * Get reports for current user based on role
   * @param {string} role - User role ("admin", "manager", "employee")
   * @param {Object} params - Additional query parameters
   * @returns {Promise} API response with role-filtered reports
   */
  async getMyReports(role, params = {}) {
    // Add role-specific filtering if needed
    const roleParams = { ...params };
    
    if (role === 'employee') {
      // Employees can only see reports about themselves
      roleParams.reportType = 'employee';
    }
    
    return this.getReports(roleParams);
  }

  /**
   * Check if user can generate specific report type
   * @param {string} role - User role
   * @param {string} reportType - Report type to check
   * @returns {boolean} Whether user can generate this report type
   */
  canGenerateReportType(role, reportType) {
    if (role === 'admin') {
      return ['employee', 'team'].includes(reportType);
    }
    
    if (role === 'manager') {
      return ['employee', 'team'].includes(reportType);
    }
    
    if (role === 'employee') {
      return false; // Employees cannot generate reports
    }
    
    return false;
  }

  /**
   * Get available report types for user role
   * @param {string} role - User role
   * @returns {Array} Available report types
   */
  getAvailableReportTypes(role) {
    if (role === 'admin') {
      return [
        { value: 'employee', label: 'Employee Performance Report' },
        { value: 'team', label: 'Team Performance Report' }
      ];
    }
    
    if (role === 'manager') {
      return [
        { value: 'employee', label: 'Employee Performance Report' },
        { value: 'team', label: 'Team Performance Report' }
      ];
    }
    
    return []; // Employees cannot generate reports
  }

  /**
   * Format report data for display
   * @param {Object} report - Raw report data from API
   * @returns {Object} Formatted report data
   */
  formatReportForDisplay(report) {
    return {
      ...report,
      formattedCreatedAt: new Date(report.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      statusColor: this.getStatusColor(report.status),
      statusIcon: this.getStatusIcon(report.status),
      insights: Array.isArray(report.insights) ? report.insights : [],
      recommendations: Array.isArray(report.recommendations) ? report.recommendations : []
    };
  }

  /**
   * Get status color for UI display
   * @param {string} status - Report status
   * @returns {string} CSS color class
   */
  getStatusColor(status) {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'generating':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get status icon for UI display
   * @param {string} status - Report status
   * @returns {string} Icon name or component
   */
  getStatusIcon(status) {
    switch (status) {
      case 'completed':
        return 'CheckCircleIcon';
      case 'generating':
        return 'ClockIcon';
      case 'failed':
        return 'XCircleIcon';
      default:
        return 'QuestionMarkCircleIcon';
    }
  }

  /**
   * Validate report generation data
   * @param {Object} reportData - Report data to validate
   * @returns {Object} Validation result with errors if any
   */
  validateReportData(reportData) {
    const errors = {};

    if (!reportData.reportType) {
      errors.reportType = 'Report type is required';
    } else if (!['employee', 'team'].includes(reportData.reportType)) {
      errors.reportType = 'Invalid report type';
    }

    if (!reportData.targetId) {
      errors.targetId = 'Target selection is required';
    } else if (isNaN(reportData.targetId) || reportData.targetId <= 0) {
      errors.targetId = 'Invalid target selection';
    }

    if (reportData.reportName && reportData.reportName.length > 200) {
      errors.reportName = 'Report name must be less than 200 characters';
    }

    if (reportData.dateRange) {
      if (reportData.dateRange.startDate && reportData.dateRange.endDate) {
        const startDate = new Date(reportData.dateRange.startDate);
        const endDate = new Date(reportData.dateRange.endDate);
        
        if (startDate >= endDate) {
          errors.dateRange = 'End date must be after start date';
        }
        
        if (endDate > new Date()) {
          errors.dateRange = 'End date cannot be in the future';
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Create and export singleton instance
export const smartReportsService = new SmartReportsService();
export default smartReportsService;
