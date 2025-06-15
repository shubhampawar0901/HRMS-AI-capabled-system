import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class PayrollService {
  // Get payroll records
  async getPayrollRecords(params = {}) {
    // Clean params to remove null/undefined values, but keep meaningful values
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      // Keep all non-null, non-undefined, non-empty values
      // Special handling: don't include month if it's null (means "All Months")
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    console.log('🔍 PayrollService.getPayrollRecords called with params:', params);
    console.log('🔍 Cleaned params:', cleanParams);

    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = queryParams ? `${API_ENDPOINTS.PAYROLL.RECORDS}?${queryParams}` : API_ENDPOINTS.PAYROLL.RECORDS;

    console.log('🔍 Final URL:', url);

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

  // Get employee payroll (role-based endpoint selection)
  async getEmployeePayroll(employeeId, params = {}) {
    // For admin/manager: use records endpoint
    // For employee: use payslips endpoint
    const userRole = this.getUserRole(); // We'll need to implement this

    if (userRole === 'admin' || userRole === 'manager') {
      // Use records endpoint for admin/manager
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `${API_ENDPOINTS.PAYROLL.RECORDS}?${queryParams}`
        : API_ENDPOINTS.PAYROLL.RECORDS;

      return apiRequest(
        () => axiosInstance.get(url),
        `payroll-records-${employeeId || 'all'}`
      );
    } else {
      // Use payslips endpoint for employees (their own data)
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
  }

  // Helper method to get user role from token or context
  getUserRole() {
    // Try to get role from localStorage or token
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
      }
    } catch (error) {
      console.warn('Could not determine user role:', error);
    }
    return 'employee'; // Default to employee for safety
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
  // Get employee payroll by admin (uses records endpoint)
  async getEmployeePayrollByAdmin(employeeId, params = {}) {
    // Admin uses the records endpoint to get payroll data
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.PAYROLL.RECORDS}?${queryParams}`
      : API_ENDPOINTS.PAYROLL.RECORDS;

    return apiRequest(
      () => axiosInstance.get(url),
      `admin-payroll-employee-${employeeId}`
    );
  }

  // Get all employees payroll data (admin only)
  async getAllEmployeesPayroll(params = {}) {
    // Clean params to remove null/undefined values, but keep meaningful values
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      // Keep all non-null, non-undefined, non-empty values
      // Special handling: don't include month if it's null (means "All Months")
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    console.log('🔍 PayrollService.getAllEmployeesPayroll called with params:', params);
    console.log('🔍 Cleaned params:', cleanParams);

    // Admin uses the records endpoint to get all payroll data
    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.PAYROLL.RECORDS}?${queryParams}`
      : API_ENDPOINTS.PAYROLL.RECORDS;

    console.log('🔍 Final URL:', url);

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
