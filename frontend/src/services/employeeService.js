import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class EmployeeService {
  // Get all employees without pagination (using maximum allowed limit)
  async getAllEmployees() {
    // Use the working /employees endpoint with maximum allowed limit
    const params = {
      page: 1,
      limit: 100, // Maximum allowed by backend validation
      status: 'active'
    };

    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_ENDPOINTS.EMPLOYEES.BASE}?${queryParams}`;

    return apiRequest(
      () => axiosInstance.get(url),
      'employees-all'
    );
  }

  // Get all employees with pagination and filters
  async getEmployees(params = {}) {
    // Clean and sanitize parameters
    const cleanParams = {};

    // Only include non-empty parameters
    if (params.page && params.page > 0) {
      cleanParams.page = params.page;
    }
    if (params.limit && params.limit > 0) {
      cleanParams.limit = params.limit;
    }
    if (params.search && params.search.trim().length > 0) {
      cleanParams.search = params.search.trim();
    }
    if (params.departmentId && params.departmentId !== '' && !isNaN(params.departmentId)) {
      cleanParams.departmentId = parseInt(params.departmentId);
    }
    if (params.status && params.status.trim().length > 0) {
      cleanParams.status = params.status.trim();
    }

    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = queryParams ? `${API_ENDPOINTS.EMPLOYEES.BASE}?${queryParams}` : API_ENDPOINTS.EMPLOYEES.BASE;

    return apiRequest(
      () => axiosInstance.get(url),
      'employees-list'
    );
  }

  // Get employee by ID
  async getEmployee(id) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.EMPLOYEES.BY_ID(id)),
      `employee-${id}`
    );
  }

  // Create new employee
  async addEmployee(employeeData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.EMPLOYEES.CREATE, employeeData),
      'employee-create'
    );
  }

  // Update employee
  async updateEmployee(id, employeeData) {
    return apiRequest(
      () => axiosInstance.put(API_ENDPOINTS.EMPLOYEES.UPDATE(id), employeeData),
      `employee-update-${id}`
    );
  }

  // Delete employee
  async deleteEmployee(id) {
    return apiRequest(
      () => axiosInstance.delete(API_ENDPOINTS.EMPLOYEES.DELETE(id)),
      `employee-delete-${id}`
    );
  }

  // Search employees (using the main endpoint with search params)
  async searchEmployees(searchTerm, filters = {}) {
    const params = { search: searchTerm, ...filters };
    return this.getEmployees(params);
  }

  // Get managers (employees who have team members)
  async getManagers(params = {}) {
    // For now, we'll get all employees and filter on frontend
    // In a real implementation, this would be a backend endpoint
    const response = await this.getEmployees({
      limit: 100,
      status: 'active',
      ...params
    });

    if (response.success) {
      // Filter employees who are managers (have managerId null or are referenced as managers)
      // This is a simplified approach - ideally the backend would handle this
      const managers = response.data.employees.filter(emp =>
        emp.position && (
          emp.position.toLowerCase().includes('manager') ||
          emp.position.toLowerCase().includes('lead') ||
          emp.position.toLowerCase().includes('supervisor') ||
          emp.position.toLowerCase().includes('director')
        )
      );

      return {
        ...response,
        data: {
          ...response.data,
          managers: managers,
          employees: managers // For compatibility
        }
      };
    }

    return response;
  }

  // Get departments
  async getDepartments() {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.EMPLOYEES.DEPARTMENTS_ALL),
      'departments'
    );
  }

  // Create department
  async createDepartment(departmentData) {
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.EMPLOYEES.DEPARTMENTS, departmentData),
      'department-create'
    );
  }

  // Get department by ID
  async getDepartment(id) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.EMPLOYEES.DEPARTMENT_BY_ID(id)),
      `department-${id}`
    );
  }

  // Update department
  async updateDepartment(id, departmentData) {
    return apiRequest(
      () => axiosInstance.put(API_ENDPOINTS.EMPLOYEES.DEPARTMENT_BY_ID(id), departmentData),
      `department-update-${id}`
    );
  }

  // Delete department
  async deleteDepartment(id) {
    return apiRequest(
      () => axiosInstance.delete(API_ENDPOINTS.EMPLOYEES.DEPARTMENT_BY_ID(id)),
      `department-delete-${id}`
    );
  }

  // Upload document for employee
  async uploadDocument(employeeId, formData) {
    return apiRequest(
      () => axiosInstance.post(`${API_ENDPOINTS.EMPLOYEES.BY_ID(employeeId)}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      `employee-document-upload-${employeeId}`
    );
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
