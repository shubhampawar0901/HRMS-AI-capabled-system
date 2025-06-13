import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchDepartments,
  uploadEmployeeDocument,
  setFilters,
  clearCurrentEmployee,
  clearError,
  clearSuccess,
  resetEmployeeState
} from '@/store/slices/employeesSlice';

export const useEmployees = () => {
  const dispatch = useDispatch();
  const {
    employees,
    currentEmployee,
    departments,
    pagination,
    filters,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isUploadingDocument,
    error,
    success
  } = useSelector(state => state.employees);

  // Fetch employees with current filters
  const loadEmployees = useCallback((params = {}) => {
    const searchParams = { ...filters, ...params };
    dispatch(fetchEmployees(searchParams));
  }, [dispatch, filters]);

  // Load employees on mount and when filters change
  useEffect(() => {
    loadEmployees();
  }, [filters.search, filters.departmentId, filters.status, filters.page]);

  // Load departments on mount
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Fetch single employee
  const loadEmployee = useCallback((id) => {
    dispatch(fetchEmployeeById(id));
  }, [dispatch]);

  // Create new employee
  const addEmployee = useCallback(async (employeeData) => {
    try {
      await dispatch(createEmployee(employeeData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Update employee
  const editEmployee = useCallback(async (id, data) => {
    try {
      await dispatch(updateEmployee({ id, data })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Delete employee
  const removeEmployee = useCallback(async (id) => {
    try {
      await dispatch(deleteEmployee(id)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Upload document
  const uploadDocument = useCallback(async (employeeId, formData) => {
    try {
      await dispatch(uploadEmployeeDocument({ employeeId, formData })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  // Search employees
  const searchEmployees = useCallback((searchTerm) => {
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  }, [dispatch]);

  // Filter by department
  const filterByDepartment = useCallback((departmentId) => {
    dispatch(setFilters({ departmentId, page: 1 }));
  }, [dispatch]);

  // Filter by status
  const filterByStatus = useCallback((status) => {
    dispatch(setFilters({ status, page: 1 }));
  }, [dispatch]);

  // Pagination
  const goToPage = useCallback((page) => {
    dispatch(setFilters({ page }));
  }, [dispatch]);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.pages) {
      dispatch(setFilters({ page: pagination.page + 1 }));
    }
  }, [dispatch, pagination.page, pagination.pages]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      dispatch(setFilters({ page: pagination.page - 1 }));
    }
  }, [dispatch, pagination.page]);

  // Clear functions
  const clearEmployee = useCallback(() => {
    dispatch(clearCurrentEmployee());
  }, [dispatch]);

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSuccessMessage = useCallback(() => {
    dispatch(clearSuccess());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetEmployeeState());
  }, [dispatch]);

  // Refresh employees
  const refreshEmployees = useCallback(() => {
    loadEmployees();
  }, [loadEmployees]);

  return {
    // Data
    employees,
    currentEmployee,
    departments,
    pagination,
    filters,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isUploadingDocument,
    
    // Messages
    error,
    success,
    
    // Actions
    loadEmployees,
    loadEmployee,
    addEmployee,
    editEmployee,
    removeEmployee,
    uploadDocument,
    
    // Filters and search
    updateFilters,
    searchEmployees,
    filterByDepartment,
    filterByStatus,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    
    // Utilities
    clearEmployee,
    clearErrorMessage,
    clearSuccessMessage,
    resetState,
    refreshEmployees
  };
};

export default useEmployees;
