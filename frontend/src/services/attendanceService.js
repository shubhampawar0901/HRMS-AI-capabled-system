import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';

class AttendanceService {
  // Check in
  async checkIn(data) {
    return await axiosInstance.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, data);
  }

  // Check out
  async checkOut(data) {
    return await axiosInstance.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, data);
  }

  // Get today's attendance
  async getTodayAttendance() {
    return await axiosInstance.get(API_ENDPOINTS.ATTENDANCE.TODAY);
  }

  // Get attendance history
  async getAttendanceHistory(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params.status) queryParams.append('status', params.status);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.ATTENDANCE.HISTORY}?${queryParams.toString()}`
      : API_ENDPOINTS.ATTENDANCE.HISTORY;

    return await axiosInstance.get(url);
  }

  // Get team attendance (for managers)
  async getTeamAttendance(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.date) queryParams.append('date', params.date);
    if (params.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params.status) queryParams.append('status', params.status);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.ATTENDANCE.TEAM}?${queryParams.toString()}`
      : API_ENDPOINTS.ATTENDANCE.TEAM;

    return await axiosInstance.get(url);
  }

  // Get attendance statistics
  async getAttendanceStats(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append('period', params.period);
    if (params.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.ATTENDANCE.STATS}?${queryParams.toString()}`
      : API_ENDPOINTS.ATTENDANCE.STATS;

    return await axiosInstance.get(url);
  }

  // Update attendance record
  async updateAttendance(id, data) {
    return await axiosInstance.put(`${API_ENDPOINTS.ATTENDANCE.BASE}/${id}`, data);
  }




}

export const attendanceService = new AttendanceService();
export default attendanceService;
