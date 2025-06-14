import { useState, useEffect, useCallback, useMemo } from 'react';
import { payrollService } from '@/services/payrollService';
import { useAuth } from '@/hooks/useAuth';

/**
 * Custom hook for payroll management
 * Provides payroll data and operations with role-based access
 */
export const usePayroll = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();

  // Debug user data and get employeeId safely
  const employeeId = useMemo(() => {
    console.log('🔍 usePayroll - User object:', user);

    if (!user) {
      console.log('❌ No user object');
      return null;
    }

    // Try multiple ways to get employeeId for backward compatibility
    const id = user.employeeId || user.employee?.id || null;
    console.log('🔍 usePayroll - Employee ID:', id);

    if (!id && (user.role === 'employee' || user.role === 'manager')) {
      console.warn('⚠️ Employee ID is missing for employee/manager user. User may need to logout and login again.');
    }

    return id;
  }, [user]);
  
  // State management
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [currentPayslip, setCurrentPayslip] = useState(null);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filters state
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    employeeId: null,
    departmentId: null,
    status: null
  });

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch payroll records (role-based)
  const fetchPayrollRecords = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        ...params,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await payrollService.getPayrollRecords(queryParams);
      
      if (response.success) {
        setPayrollRecords(response.data.records || []);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        throw new Error(response.message || 'Failed to fetch payroll records');
      }
    } catch (err) {
      console.error('Fetch payroll records error:', err);
      setError(err.message || 'Failed to fetch payroll records');
      setPayrollRecords([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch employee payslips
  const fetchEmployeePayslips = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        year: filters.year,
        ...params,
        page: pagination.page,
        limit: pagination.limit
      };

      if (!employeeId) {
        throw new Error('Employee ID is required but not found. Please logout and login again.');
      }

      const response = await payrollService.getEmployeePayroll(employeeId, queryParams);

      // Handle wrapped response from apiRequest
      const apiData = response.data || response;

      if (apiData.success) {
        setPayslips(apiData.data.payslips || []);
        setPagination(prev => ({
          ...prev,
          ...apiData.data.pagination
        }));
      } else {
        throw new Error(apiData.message || 'Failed to fetch payslips');
      }
    } catch (err) {
      console.error('Fetch payslips error:', err);
      setError(err.message || 'Failed to fetch payslips');
      setPayslips([]);
    } finally {
      setLoading(false);
    }
  }, [filters.year, pagination.page, pagination.limit, employeeId]);

  // Fetch specific payslip
  const fetchPayslip = useCallback(async (payrollId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollService.getPayslip(payrollId);

      // Handle wrapped response from apiRequest
      const apiData = response.data || response;

      if (apiData.success) {
        setCurrentPayslip(apiData.data);
        return apiData.data;
      } else {
        throw new Error(apiData.message || 'Failed to fetch payslip');
      }
    } catch (err) {
      console.error('Fetch payslip error:', err);
      setError(err.message || 'Failed to fetch payslip');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch salary structure
  const fetchSalaryStructure = useCallback(async (paramEmployeeId = null) => {
    try {
      setLoading(true);
      setError(null);

      const targetEmployeeId = paramEmployeeId || employeeId;

      if (!targetEmployeeId) {
        throw new Error('Employee ID is required but not found. Please logout and login again.');
      }
      const response = await payrollService.getSalaryStructure(targetEmployeeId);

      // Handle wrapped response from apiRequest
      const apiData = response.data || response;

      if (apiData.success) {
        setSalaryStructure(apiData.data);
        return apiData.data;
      } else {
        throw new Error(apiData.message || 'Failed to fetch salary structure');
      }
    } catch (err) {
      console.error('Fetch salary structure error:', err);
      setError(err.message || 'Failed to fetch salary structure');
      return null;
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // Generate payroll (admin only)
  const generatePayroll = useCallback(async (employeeId, month, year) => {
    if (!isAdmin) {
      setError('Access denied: Admin privileges required');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollService.generatePayroll({
        employeeId,
        month,
        year
      });
      
      if (response.success) {
        // Refresh payroll records
        await fetchPayrollRecords();
        return true;
      } else {
        throw new Error(response.message || 'Failed to generate payroll');
      }
    } catch (err) {
      console.error('Generate payroll error:', err);
      setError(err.message || 'Failed to generate payroll');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, fetchPayrollRecords]);

  // Process payroll (admin only)
  const processPayroll = useCallback(async (payrollId) => {
    if (!isAdmin) {
      setError('Access denied: Admin privileges required');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollService.processPayroll(payrollId);
      
      if (response.success) {
        // Refresh payroll records
        await fetchPayrollRecords();
        return true;
      } else {
        throw new Error(response.message || 'Failed to process payroll');
      }
    } catch (err) {
      console.error('Process payroll error:', err);
      setError(err.message || 'Failed to process payroll');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, fetchPayrollRecords]);

  // Download payslip PDF
  const downloadPayslip = useCallback(async (payrollId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollService.downloadPayslip(payrollId);
      
      if (response) {
        // Create blob URL and trigger download
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payslip-${payrollId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return true;
      } else {
        throw new Error('Failed to download payslip');
      }
    } catch (err) {
      console.error('Download payslip error:', err);
      setError(err.message || 'Failed to download payslip');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }));
  }, []);

  // Computed values
  const hasPayrollAccess = useMemo(() => {
    return isAdmin || isManager || isEmployee;
  }, [isAdmin, isManager, isEmployee]);

  const canManagePayroll = useMemo(() => {
    return isAdmin;
  }, [isAdmin]);

  const canViewTeamPayroll = useMemo(() => {
    return isAdmin || isManager;
  }, [isAdmin, isManager]);

  // Auto-fetch data based on role
  useEffect(() => {
    if (!user || !hasPayrollAccess) return;

    if (isEmployee) {
      fetchEmployeePayslips();
      fetchSalaryStructure();
    } else if (isAdmin || isManager) {
      fetchPayrollRecords();
    }
  }, [user, hasPayrollAccess, isEmployee, isAdmin, isManager, fetchEmployeePayslips, fetchSalaryStructure, fetchPayrollRecords]);

  return {
    // State
    payrollRecords,
    payslips,
    currentPayslip,
    salaryStructure,
    payrollSummary,
    loading,
    error,
    pagination,
    filters,

    // Actions
    fetchPayrollRecords,
    fetchEmployeePayslips,
    fetchPayslip,
    fetchSalaryStructure,
    generatePayroll,
    processPayroll,
    downloadPayslip,
    updateFilters,
    updatePagination,
    clearError,

    // Computed values
    hasPayrollAccess,
    canManagePayroll,
    canViewTeamPayroll,

    // Role checks
    isAdmin,
    isManager,
    isEmployee
  };
};

export default usePayroll;
