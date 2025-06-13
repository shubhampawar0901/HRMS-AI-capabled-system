import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class PayrollService {
  // Get payroll records
  async getPayrollRecords(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.PAYROLL.BASE}?${queryParams}` : API_ENDPOINTS.PAYROLL.BASE;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'payroll-records'
    );
  }

  // Get payroll by ID
  async getPayrollById(id) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.PAYROLL.BY_ID(id)),
      `payroll-${id}`
    );
  }

  // Get employee payroll
  async getEmployeePayroll(employeeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams 
      ? `${API_ENDPOINTS.PAYROLL.BY_EMPLOYEE(employeeId)}?${queryParams}` 
      : API_ENDPOINTS.PAYROLL.BY_EMPLOYEE(employeeId);
    
    return apiRequest(
      () => axiosInstance.get(url),
      `payroll-employee-${employeeId}`
    );
  }

  // Generate payroll
  async generatePayroll(data) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.PAYROLL.GENERATE, data),
      'payroll-generate'
    );
  }

  // Process payroll
  async processPayroll(payrollId, data = {}) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.PAYROLL.PROCESS, { payrollId, ...data }),
      'payroll-process'
    );
  }

  // Get payslip
  async getPayslip(payrollId) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.PAYROLL.PAYSLIP(payrollId)),
      `payslip-${payrollId}`
    );
  }

  // Download payslip PDF
  async downloadPayslip(payrollId) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.PAYROLL.PAYSLIP(payrollId), {
        responseType: 'blob',
        headers: { 'Accept': 'application/pdf' }
      }),
      `payslip-download-${payrollId}`
    );
  }

  // Export payroll data
  async exportPayroll(format = 'excel', params = {}) {
    const exportParams = { format, ...params };
    const queryParams = new URLSearchParams(exportParams).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.PAYROLL.EXPORT}?${queryParams}`, {
        responseType: 'blob'
      }),
      'payroll-export'
    );
  }

  // Get payroll statistics
  async getPayrollStatistics(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.PAYROLL.BASE}/statistics${queryParams ? `?${queryParams}` : ''}`),
      'payroll-statistics'
    );
  }

  // Calculate salary components
  async calculateSalary(employeeId, month, year) {
    return apiRequest(
      () => axiosInstance.post(`${API_ENDPOINTS.PAYROLL.BASE}/calculate`, {
        employeeId,
        month,
        year
      }),
      'payroll-calculate'
    );
  }
}

export const payrollService = new PayrollService();
export default payrollService;
