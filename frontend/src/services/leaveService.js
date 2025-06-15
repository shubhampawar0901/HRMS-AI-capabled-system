import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class LeaveService {
  // Apply for leave
  async applyLeave(leaveData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.LEAVE.APPLY, leaveData),
      'leave-apply'
    );
  }

  // Get leave requests
  async getLeaveRequests(params = {}) {
    // Clean up parameters - remove null, undefined, and empty values
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '' && value !== 'null' && value !== 'undefined') {
        cleanParams[key] = value;
      }
    });

    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = queryParams ? `${API_ENDPOINTS.LEAVE.APPLICATIONS}?${queryParams}` : API_ENDPOINTS.LEAVE.APPLICATIONS;

    return apiRequest(
      () => axiosInstance.get(url),
      'leave-requests'
    );
  }

  // Get leave by ID
  async getLeaveById(id) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.LEAVE.BY_ID(id)),
      `leave-${id}`
    );
  }

  // Approve leave
  async approveLeave(id, comments = '') {
    return apiRequest(
      () => axiosInstance.patch(API_ENDPOINTS.LEAVE.APPROVE(id), { comments }),
      `leave-approve-${id}`
    );
  }

  // Reject leave
  async rejectLeave(id, comments = '') {
    return apiRequest(
      () => axiosInstance.patch(API_ENDPOINTS.LEAVE.REJECT(id), { comments }),
      `leave-reject-${id}`
    );
  }

  // Cancel leave
  async cancelLeave(id, reason = '') {
    return apiRequest(
      () => axiosInstance.patch(API_ENDPOINTS.LEAVE.CANCEL(id), { reason }),
      `leave-cancel-${id}`
    );
  }

  // Get leave balance
  async getLeaveBalance(year = null) {
    const params = year ? { year } : {};
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.LEAVE.BALANCE}?${queryParams}`
      : API_ENDPOINTS.LEAVE.BALANCE;

    return apiRequest(
      () => axiosInstance.get(url),
      'leave-balance'
    );
  }

  // Get leave types
  async getLeaveTypes() {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.LEAVE.TYPES),
      'leave-types'
    );
  }

  // Get leave history
  async getLeaveHistory(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.LEAVE.HISTORY}?${queryParams}` 
      : API_ENDPOINTS.LEAVE.HISTORY;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'leave-history'
    );
  }

  // Get pending leave requests
  async getPendingLeaves(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.LEAVE.PENDING}?${queryParams}`
      : API_ENDPOINTS.LEAVE.PENDING;

    return apiRequest(
      () => axiosInstance.get(url),
      'leave-pending'
    );
  }

  // Get leave calendar
  async getLeaveCalendar(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.LEAVE.CALENDAR}?${queryParams}`
      : API_ENDPOINTS.LEAVE.CALENDAR;

    return apiRequest(
      () => axiosInstance.get(url),
      'leave-calendar'
    );
  }

  // Get team leave requests (managers only)
  async getTeamLeaveRequests(params = {}) {
    // Clean up parameters - remove null, undefined, and empty values
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '' && value !== 'null' && value !== 'undefined') {
        cleanParams[key] = value;
      }
    });

    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.LEAVE.TEAM}?${queryParams}`
      : API_ENDPOINTS.LEAVE.TEAM;

    return apiRequest(
      () => axiosInstance.get(url),
      'team-leave-requests'
    );
  }

  // Process leave application (approve/reject)
  async processLeaveApplication(id, data) {
    return apiRequest(
      () => axiosInstance.put(API_ENDPOINTS.LEAVE.PROCESS(id), data),
      `process-leave-${id}`
    );
  }
}

export const leaveService = new LeaveService();
export default leaveService;
