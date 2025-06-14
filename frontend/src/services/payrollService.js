import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class PayrollService {
  // Get payroll records
  async getPayrollRecords(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.PAYROLL.RECORDS}?${queryParams}` : API_ENDPOINTS.PAYROLL.RECORDS;

    return apiRequest(
      () => axiosInstance.get(url),
      'payroll-records'
    );
  }

  // Get payroll by ID (using payslip endpoint)
  async getPayrollById(id) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.PAYROLL.PAYSLIP(id)),
      `payroll-${id}`
    );
  }

  // Get employee payroll (using payslips endpoint)
  async getEmployeePayroll(employeeId, params = {}) {
    // Remove employeeId from params since backend gets it from token
    const { employeeId: _, ...cleanParams } = params;
    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.PAYROLL.PAYSLIPS}?${queryParams}`
      : API_ENDPOINTS.PAYROLL.PAYSLIPS;

    return apiRequest(
      () => axiosInstance.get(url),
      `payroll-employee-${employeeId || 'current'}`
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
      () => axiosInstance.put(API_ENDPOINTS.PAYROLL.PROCESS(payrollId), data),
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
      () => axiosInstance.get(API_ENDPOINTS.PAYROLL.PAYSLIP_DOWNLOAD(payrollId), {
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

  // Get salary structure for an employee
  async getSalaryStructure(employeeId) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.PAYROLL.SALARY_STRUCTURE(employeeId)),
      `salary-structure-${employeeId}`
    );
  }

  // Admin-specific methods
  // Get employee payroll by admin (can specify any employee ID)
  async getEmployeePayrollByAdmin(employeeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.PAYROLL.ADMIN_EMPLOYEE_PAYROLL(employeeId)}?${queryParams}`
      : API_ENDPOINTS.PAYROLL.ADMIN_EMPLOYEE_PAYROLL(employeeId);

    return apiRequest(
      () => axiosInstance.get(url),
      `admin-payroll-employee-${employeeId}`
    );
  }

  // Get all employees payroll data (admin only)
  async getAllEmployeesPayroll(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.PAYROLL.ADMIN_ALL_EMPLOYEES}?${queryParams}`
      : API_ENDPOINTS.PAYROLL.ADMIN_ALL_EMPLOYEES;

    return apiRequest(
      () => axiosInstance.get(url),
      'admin-all-employees-payroll'
    );
  }

  // Get employees list for admin selection
  async getEmployeesForPayroll(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.EMPLOYEES.BASE}?${queryParams}`
      : API_ENDPOINTS.EMPLOYEES.BASE;

    return apiRequest(
      () => axiosInstance.get(url),
      'employees-for-payroll'
    );
  }
}

export const payrollService = new PayrollService();
export default payrollService;
