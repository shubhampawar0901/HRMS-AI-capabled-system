import axiosInstance from '@/api/axiosInstance';
import { apiRequest } from '@/api/interceptors';

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats(role = null) {
    const params = role ? { role } : {};
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`/dashboard/stats${queryParams ? `?${queryParams}` : ''}`),
      'dashboard-stats'
    );
  }

  // Get recent activities
  async getRecentActivities(limit = 10) {
    return apiRequest(
      () => axiosInstance.get(`/dashboard/activities?limit=${limit}`),
      'dashboard-activities'
    );
  }

  // Get quick actions based on role
  async getQuickActions(role) {
    return apiRequest(
      () => axiosInstance.get(`/dashboard/quick-actions?role=${role}`),
      'dashboard-quick-actions'
    );
  }

  // Get attendance widget data
  async getAttendanceWidget(employeeId = null) {
    const params = employeeId ? { employeeId } : {};
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`/dashboard/attendance${queryParams ? `?${queryParams}` : ''}`),
      'dashboard-attendance'
    );
  }

  // Get performance metrics
  async getPerformanceMetrics(employeeId = null, period = 'month') {
    const params = { period };
    if (employeeId) params.employeeId = employeeId;
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`/dashboard/performance?${queryParams}`),
      'dashboard-performance'
    );
  }

  // Get leave summary
  async getLeaveSummary(employeeId = null) {
    const params = employeeId ? { employeeId } : {};
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`/dashboard/leave${queryParams ? `?${queryParams}` : ''}`),
      'dashboard-leave'
    );
  }

  // Get team overview (for managers)
  async getTeamOverview() {
    return apiRequest(
      () => axiosInstance.get('/dashboard/team-overview'),
      'dashboard-team'
    );
  }

  // Get notifications
  async getNotifications(limit = 5) {
    return apiRequest(
      () => axiosInstance.get(`/dashboard/notifications?limit=${limit}`),
      'dashboard-notifications'
    );
  }

  // Mark notification as read
  async markNotificationRead(notificationId) {
    return apiRequest(
      () => axiosInstance.patch(`/dashboard/notifications/${notificationId}/read`),
      `notification-read-${notificationId}`
    );
  }

  // Get upcoming events
  async getUpcomingEvents(limit = 5) {
    return apiRequest(
      () => axiosInstance.get(`/dashboard/events?limit=${limit}`),
      'dashboard-events'
    );
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
