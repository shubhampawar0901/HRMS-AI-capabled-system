import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { apiRequest } from '@/api/interceptors';

class EmployeeService {
  // Get all employees with pagination and filters
  async getEmployees(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_ENDPOINTS.EMPLOYEES.BASE}?${queryParams}` : API_ENDPOINTS.EMPLOYEES.BASE;
    
    return apiRequest(
      () => axiosInstance.get(url),
      'employees-list'
    );
  }

  // Get employee by ID
  async getEmployeeById(id) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.EMPLOYEES.BY_ID(id)),
      `employee-${id}`
    );
  }

  // Create new employee
  async createEmployee(employeeData) {
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

  // Search employees
  async searchEmployees(searchTerm, filters = {}) {
    const params = { search: searchTerm, ...filters };
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.EMPLOYEES.SEARCH}?${queryParams}`),
      'employees-search'
    );
  }

  // Get departments
  async getDepartments() {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.EMPLOYEES.DEPARTMENTS),
      'departments'
    );
  }

  // Get positions
  async getPositions() {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.EMPLOYEES.POSITIONS),
      'positions'
    );
  }

  // Bulk upload employees
  async bulkUpload(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.EMPLOYEES.BULK_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      'employees-bulk-upload'
    );
  }

  // Export employees
  async exportEmployees(format = 'excel', filters = {}) {
    const params = { format, ...filters };
    const queryParams = new URLSearchParams(params).toString();
    
    return apiRequest(
      () => axiosInstance.get(`${API_ENDPOINTS.EMPLOYEES.EXPORT}?${queryParams}`, {
        responseType: 'blob'
      }),
      'employees-export'
    );
  }

  // Get employee statistics
  async getStatistics() {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.EMPLOYEES.STATISTICS),
      'employees-statistics'
    );
  }

  // Deactivate employee
  async deactivateEmployee(id) {
    return apiRequest(
      () => axiosInstance.patch(API_ENDPOINTS.EMPLOYEES.DEACTIVATE(id)),
      `employee-deactivate-${id}`
    );
  }

  // Activate employee
  async activateEmployee(id) {
    return apiRequest(
      () => axiosInstance.patch(API_ENDPOINTS.EMPLOYEES.ACTIVATE(id)),
      `employee-activate-${id}`
    );
  }

  // Get employee documents
  async getEmployeeDocuments(id) {
    return apiRequest(
      () => axiosInstance.get(API_ENDPOINTS.EMPLOYEES.DOCUMENTS(id)),
      `employee-documents-${id}`
    );
  }

  // Upload employee document
  async uploadDocument(id, file, documentType) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);
    
    return apiRequest(
      () => axiosInstance.post(API_ENDPOINTS.EMPLOYEES.UPLOAD_DOCUMENT(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      `employee-upload-document-${id}`
    );
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
