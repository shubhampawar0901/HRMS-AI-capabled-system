import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

/**
 * Data Service
 * Handles all API calls for data aggregation supporting Smart Reports
 * Provides comprehensive performance, attendance, and goal metrics
 */
class DataService {
  
  /**
   * Get comprehensive employee performance summary
   * @param {number} employeeId - Employee ID
   * @param {Object} dateRange - Optional date range filter
   * @param {string} dateRange.startDate - Start date (ISO format)
   * @param {string} dateRange.endDate - End date (ISO format)
   * @returns {Promise} API response with employee performance data
   */
  async getEmployeeSummary(employeeId, dateRange = {}) {
    const params = new URLSearchParams(
      Object.entries(dateRange).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const url = params 
      ? `${API_ENDPOINTS.DATA.EMPLOYEE_SUMMARY}/${employeeId}?${params}`
      : `${API_ENDPOINTS.DATA.EMPLOYEE_SUMMARY}/${employeeId}`;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'data-employee-summary'
    );
  }

  /**
   * Get comprehensive team performance summary
   * @param {number} managerId - Manager ID
   * @param {Object} dateRange - Optional date range filter
   * @param {string} dateRange.startDate - Start date (ISO format)
   * @param {string} dateRange.endDate - End date (ISO format)
   * @returns {Promise} API response with team performance data
   */
  async getTeamSummary(managerId, dateRange = {}) {
    const params = new URLSearchParams(
      Object.entries(dateRange).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const url = params 
      ? `${API_ENDPOINTS.DATA.TEAM_SUMMARY}/${managerId}?${params}`
      : `${API_ENDPOINTS.DATA.TEAM_SUMMARY}/${managerId}`;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'data-team-summary'
    );
  }

  /**
   * Get department-wide performance summary (Admin only)
   * @param {number} departmentId - Department ID
   * @param {Object} dateRange - Optional date range filter
   * @returns {Promise} API response with department performance data
   */
  async getDepartmentSummary(departmentId, dateRange = {}) {
    const params = new URLSearchParams(
      Object.entries(dateRange).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const url = params 
      ? `${API_ENDPOINTS.DATA.DEPARTMENT_SUMMARY}/${departmentId}?${params}`
      : `${API_ENDPOINTS.DATA.DEPARTMENT_SUMMARY}/${departmentId}`;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'data-department-summary'
    );
  }

  /**
   * Get performance metrics only for an employee
   * @param {number} employeeId - Employee ID
   * @param {Object} dateRange - Optional date range filter
   * @returns {Promise} API response with performance metrics
   */
  async getPerformanceMetrics(employeeId, dateRange = {}) {
    const params = new URLSearchParams(
      Object.entries(dateRange).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const url = params 
      ? `${API_ENDPOINTS.DATA.PERFORMANCE_METRICS}/${employeeId}?${params}`
      : `${API_ENDPOINTS.DATA.PERFORMANCE_METRICS}/${employeeId}`;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'data-performance-metrics'
    );
  }

  /**
   * Get attendance metrics only for an employee
   * @param {number} employeeId - Employee ID
   * @param {Object} dateRange - Optional date range filter
   * @returns {Promise} API response with attendance metrics
   */
  async getAttendanceMetrics(employeeId, dateRange = {}) {
    const params = new URLSearchParams(
      Object.entries(dateRange).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const url = params 
      ? `${API_ENDPOINTS.DATA.ATTENDANCE_METRICS}/${employeeId}?${params}`
      : `${API_ENDPOINTS.DATA.ATTENDANCE_METRICS}/${employeeId}`;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'data-attendance-metrics'
    );
  }

  /**
   * Get default date range for reports (last 6 months)
   * @returns {Object} Date range object with startDate and endDate
   */
  getDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  /**
   * Get quarter date ranges for quick selection
   * @returns {Array} Array of quarter date range options
   */
  getQuarterDateRanges() {
    const currentYear = new Date().getFullYear();
    const quarters = [];
    
    for (let q = 1; q <= 4; q++) {
      const startMonth = (q - 1) * 3;
      const endMonth = startMonth + 2;
      
      const startDate = new Date(currentYear, startMonth, 1);
      const endDate = new Date(currentYear, endMonth + 1, 0);
      
      quarters.push({
        label: `Q${q} ${currentYear}`,
        value: `q${q}-${currentYear}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
    }
    
    return quarters;
  }

  /**
   * Get predefined date range options
   * @returns {Array} Array of date range options
   */
  getDateRangeOptions() {
    const today = new Date();
    const options = [];

    // Last 30 days
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    options.push({
      label: 'Last 30 Days',
      value: 'last-30-days',
      startDate: last30Days.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });

    // Last 3 months
    const last3Months = new Date(today);
    last3Months.setMonth(last3Months.getMonth() - 3);
    options.push({
      label: 'Last 3 Months',
      value: 'last-3-months',
      startDate: last3Months.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });

    // Last 6 months (default)
    const last6Months = new Date(today);
    last6Months.setMonth(last6Months.getMonth() - 6);
    options.push({
      label: 'Last 6 Months',
      value: 'last-6-months',
      startDate: last6Months.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });

    // Last year
    const lastYear = new Date(today);
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    options.push({
      label: 'Last Year',
      value: 'last-year',
      startDate: lastYear.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });

    // Current year
    const currentYearStart = new Date(today.getFullYear(), 0, 1);
    options.push({
      label: 'Current Year',
      value: 'current-year',
      startDate: currentYearStart.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });

    return options;
  }

  /**
   * Format performance data for display
   * @param {Object} data - Raw performance data from API
   * @returns {Object} Formatted performance data
   */
  formatPerformanceData(data) {
    if (!data) return null;

    return {
      ...data,
      performance: {
        ...data.performance,
        averageRating: parseFloat(data.performance?.averageRating || 0).toFixed(1),
        ratingTrendIcon: this.getRatingTrendIcon(data.performance?.ratingTrend),
        ratingTrendColor: this.getRatingTrendColor(data.performance?.ratingTrend)
      },
      attendance: {
        ...data.attendance,
        attendanceRate: parseFloat(data.attendance?.attendanceRate || 0).toFixed(1),
        punctualityRate: parseFloat(data.attendance?.punctualityRate || 0).toFixed(1),
        averageDailyHours: parseFloat(data.attendance?.averageDailyHours || 0).toFixed(1)
      },
      goals: {
        ...data.goals,
        completionRate: parseFloat(data.goals?.completionRate || 0).toFixed(1),
        averageAchievement: parseFloat(data.goals?.averageAchievement || 0).toFixed(1)
      },
      leave: {
        ...data.leave,
        utilizationRate: parseFloat(data.leave?.utilizationRate || 0).toFixed(1)
      }
    };
  }

  /**
   * Get rating trend icon
   * @param {string} trend - Rating trend ("improving", "declining", "stable")
   * @returns {string} Icon name
   */
  getRatingTrendIcon(trend) {
    switch (trend) {
      case 'improving':
        return 'TrendingUpIcon';
      case 'declining':
        return 'TrendingDownIcon';
      case 'stable':
        return 'MinusIcon';
      default:
        return 'MinusIcon';
    }
  }

  /**
   * Get rating trend color
   * @param {string} trend - Rating trend
   * @returns {string} CSS color class
   */
  getRatingTrendColor(trend) {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Calculate performance score based on multiple metrics
   * @param {Object} data - Performance data
   * @returns {number} Overall performance score (0-100)
   */
  calculatePerformanceScore(data) {
    if (!data) return 0;

    const weights = {
      performance: 0.4,  // 40% weight
      attendance: 0.3,   // 30% weight
      goals: 0.3         // 30% weight
    };

    const performanceScore = (parseFloat(data.performance?.averageRating || 0) / 5) * 100;
    const attendanceScore = parseFloat(data.attendance?.attendanceRate || 0);
    const goalsScore = parseFloat(data.goals?.completionRate || 0);

    const overallScore = (
      performanceScore * weights.performance +
      attendanceScore * weights.attendance +
      goalsScore * weights.goals
    );

    return Math.round(overallScore);
  }

  /**
   * Get performance score color
   * @param {number} score - Performance score (0-100)
   * @returns {string} CSS color class
   */
  getPerformanceScoreColor(score) {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  }
}

// Create and export singleton instance
export const dataService = new DataService();
export default dataService;
