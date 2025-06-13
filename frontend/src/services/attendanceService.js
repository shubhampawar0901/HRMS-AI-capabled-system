import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class AttendanceService {
  // Check in
  async checkIn(data) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, data),
      'attendance-check-in'
    );
  }

  // Check out
  async checkOut(data) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, data),
      'attendance-check-out'
    );
  }

  // Get attendance records
  async getAttendance(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.ATTENDANCE.BASE}?${queryParams}` : API_ENDPOINTS.ATTENDANCE.BASE;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'attendance-list'
    );
  }

  // Get employee attendance
  async getEmployeeAttendance(employeeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.ATTENDANCE.BY_EMPLOYEE(employeeId)}?${queryParams}` 
      : API_ENDPOINTS.ATTENDANCE.BY_EMPLOYEE(employeeId);
    
    return apiRequest(
      () => axiosInstance.get(url),
      `attendance-employee-${employeeId}`
    );
  }

  // Get attendance by date range
  async getAttendanceByDateRange(startDate, endDate, employeeId = null) {
    const params = { startDate, endDate };
    if (employeeId) params.employeeId = employeeId;
    
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.ATTENDANCE.BY_DATE_RANGE}?${queryParams}`),
      'attendance-date-range'
    );
  }

  // Get attendance statistics
  async getStatistics(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.ATTENDANCE.STATISTICS}?${queryParams}` 
      : API_ENDPOINTS.ATTENDANCE.STATISTICS;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'attendance-statistics'
    );
  }

  // Get team attendance
  async getTeamAttendance(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.ATTENDANCE.TEAM}?${queryParams}` 
      : API_ENDPOINTS.ATTENDANCE.TEAM;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'attendance-team'
    );
  }

  // Export attendance
  async exportAttendance(format = 'excel', params = {}) {
    const exportParams = { format, ...params };
    const queryParams = new URLSearchParams(exportParams).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.ATTENDANCE.EXPORT}?${queryParams}`, {
        responseType: 'blob'
      }),
      'attendance-export'
    );
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
