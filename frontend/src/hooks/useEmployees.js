import { useState, useEffect, useCallback } from 'react';
import { employeeService } from '@/services/employeeService';

export const useEmployees = (initialFilters = {}) => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    departmentId: '',
    status: 'active',
    ...initialFilters
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter and paginate employees client-side
  const filterAndPaginateEmployees = () => {
    console.log('🔄 Filtering employees:', {
      allEmployeesCount: allEmployees.length,
      filters,
      pagination
    });

    let filteredEmployees = [...allEmployees];

    // Apply filters
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.firstName?.toLowerCase().includes(searchTerm) ||
        emp.lastName?.toLowerCase().includes(searchTerm) ||
        emp.email?.toLowerCase().includes(searchTerm) ||
        emp.employeeCode?.toLowerCase().includes(searchTerm) ||
        emp.position?.toLowerCase().includes(searchTerm)
      );
      console.log('🔍 After search filter:', filteredEmployees.length);
    }

    if (filters.departmentId && filters.departmentId !== '') {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.departmentId === parseInt(filters.departmentId)
      );
      console.log('🏢 After department filter:', filteredEmployees.length);
    }

    // Remove status filter since API already filters by status
    // if (filters.status && filters.status !== '') {
    //   filteredEmployees = filteredEmployees.filter(emp =>
    //     emp.status === filters.status
    //   );
    // }

    // Calculate pagination
    const total = filteredEmployees.length;
    const pages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    console.log('📄 Final result:', {
      filteredTotal: total,
      pages,
      currentPage: pagination.page,
      paginatedCount: paginatedEmployees.length,
      employees: paginatedEmployees.slice(0, 2) // Log first 2
    });

    setEmployees(paginatedEmployees);
    setPagination(prev => ({
      ...prev,
      total,
      pages
    }));
  };

  // Fetch all employees from API
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await employeeService.getAllEmployees();

      // After handleApiSuccess, the structure is: { success, message, data: { employees, pagination } }
      if (response && response.success) {
        const employees = response.data.employees || [];
        console.log('✅ API Response Success:', {
          totalEmployees: employees.length,
          employees: employees.slice(0, 2), // Log first 2 employees
          responseStructure: response
        });
        setAllEmployees(employees);
      } else {
        console.log('❌ API Response Failed:', response);
        setError(response.message || 'Failed to fetch employees');
        setAllEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError(error.message || 'Failed to fetch employees');
      setAllEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filtering and pagination when data or filters change
  useEffect(() => {
    if (allEmployees.length > 0) {
      filterAndPaginateEmployees();
    } else {
      // Clear employees if no data
      setEmployees([]);
      setPagination(prev => ({ ...prev, total: 0, pages: 0 }));
    }
  }, [allEmployees, filters, pagination.page, pagination.limit]);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Update filters and reset to first page
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Search employees
  const searchEmployees = useCallback((searchTerm) => {
    const cleanSearchTerm = searchTerm ? searchTerm.trim() : '';
    updateFilters({ search: cleanSearchTerm });
  }, [updateFilters]);

  // Pagination functions
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.pages)
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(prev.page - 1, 1)
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    employees,
    pagination,
    filters,
    isLoading,
    error,
    fetchEmployees,
    updateFilters,
    searchEmployees,
    goToPage,
    nextPage,
    prevPage,
    clearError
  };
};

export const useEmployee = (id) => {
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployee = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await employeeService.getEmployee(id);

      // After handleApiSuccess, the structure is: { success, message, data }
      if (response && response.success) {
        setEmployee(response.data);
      } else {
        setError(response.message || 'Failed to fetch employee');
        setEmployee(null);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      setError(error.message || 'Failed to fetch employee');
      setEmployee(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  return {
    employee,
    isLoading,
    error,
    refetch: fetchEmployee
  };
};

export const useEmployeeMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const addEmployee = useCallback(async (employeeData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await employeeService.addEmployee(employeeData);

      // After handleApiSuccess, the structure is: { success, message, data }
      if (response && response.success) {
        setSuccess('Employee added successfully');
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to add employee');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setError(error.message || 'Failed to add employee');
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEmployee = useCallback(async (id, employeeData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await employeeService.updateEmployee(id, employeeData);

      // After handleApiSuccess, the structure is: { success, message, data }
      if (response && response.success) {
        setSuccess('Employee updated successfully');
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update employee');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setError(error.message || 'Failed to update employee');
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEmployee = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await employeeService.deleteEmployee(id);

      // After handleApiSuccess, the structure is: { success, message, data }
      if (response && response.success) {
        setSuccess('Employee deleted successfully');
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete employee');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError(error.message || 'Failed to delete employee');
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (employeeId, formData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Note: This endpoint needs to be implemented in the backend
      const response = await employeeService.uploadDocument(employeeId, formData);

      // After handleApiSuccess, the structure is: { success, message, data }
      if (response && response.success) {
        setSuccess('Document uploaded successfully');
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to upload document');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error.message || 'Failed to upload document');
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    isLoading,
    error,
    success,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    uploadDocument,
    clearMessages
  };
};

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await employeeService.getDepartments();

      // After handleApiSuccess, the structure is: { success, message, data }
      if (response && response.success) {
        setDepartments(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch departments');
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError(error.message || 'Failed to fetch departments');
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    isLoading,
    error,
    refetch: fetchDepartments
  };
};
