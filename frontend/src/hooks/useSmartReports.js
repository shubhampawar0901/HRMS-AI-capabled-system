import { useState, useEffect, useCallback } from 'react';
import { smartReportsService } from '@/services/smartReportsService';
import { useAuth } from '@/hooks/useAuth';

/**
 * Custom hook for managing Smart Reports state and operations
 * Provides comprehensive state management for reports list, pagination, and filtering
 */
export const useSmartReports = (initialParams = {}) => {
  const { user } = useAuth();
  
  // State management
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Filters and search
  const [filters, setFilters] = useState({
    reportType: '',
    status: '',
    ...initialParams
  });
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Fetch reports with current filters and pagination
   */
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await smartReportsService.getReports(params);
      
      if (response.success) {
        setReports(response.data.reports || []);
        setPagination(response.data.pagination || pagination);
      } else {
        throw new Error(response.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /**
   * Refresh reports list
   */
  const refreshReports = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  /**
   * Update pagination
   */
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  /**
   * Change page size
   */
  const changePageSize = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      reportType: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Delete report
   */
  const deleteReport = useCallback(async (reportId) => {
    try {
      const response = await smartReportsService.deleteReport(reportId);
      
      if (response.success) {
        refreshReports();
        return { success: true, message: 'Report deleted successfully' };
      } else {
        throw new Error(response.message || 'Failed to delete report');
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      return { success: false, message: err.message || 'Failed to delete report' };
    }
  }, [refreshReports]);

  /**
   * Get formatted reports with additional display properties
   */
  const formattedReports = useCallback(() => {
    return reports.map(report => smartReportsService.formatReportForDisplay(report));
  }, [reports]);

  /**
   * Check if user can perform specific actions
   */
  const permissions = useCallback(() => {
    return {
      canGenerate: ['admin', 'manager'].includes(user?.role),
      canDelete: ['admin', 'manager'].includes(user?.role),
      canViewAll: user?.role === 'admin',
      canViewTeamReports: ['admin', 'manager'].includes(user?.role)
    };
  }, [user?.role]);

  /**
   * Get available filter options based on user role
   */
  const getFilterOptions = useCallback(() => {
    const reportTypeOptions = [
      { value: '', label: 'All Report Types' },
      { value: 'employee', label: 'Employee Reports' }
    ];
    
    if (['admin', 'manager'].includes(user?.role)) {
      reportTypeOptions.push({ value: 'team', label: 'Team Reports' });
    }
    
    const statusOptions = [
      { value: '', label: 'All Statuses' },
      { value: 'completed', label: 'Completed' },
      { value: 'generating', label: 'Generating' },
      { value: 'failed', label: 'Failed' }
    ];
    
    return { reportTypeOptions, statusOptions };
  }, [user?.role]);

  // Effect to fetch reports when dependencies change
  useEffect(() => {
    fetchReports();
  }, [fetchReports, refreshTrigger]);

  // Return hook interface
  return {
    // Data
    reports: formattedReports(),
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    refreshReports,
    updateFilters,
    updatePagination,
    goToPage,
    changePageSize,
    clearFilters,
    deleteReport,
    
    // Utilities
    permissions: permissions(),
    filterOptions: getFilterOptions(),
    
    // State setters (for advanced use cases)
    setReports,
    setLoading,
    setError,
    setPagination,
    setFilters
  };
};

/**
 * Custom hook for managing individual report state
 */
export const useSmartReport = (reportId) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch specific report by ID
   */
  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await smartReportsService.getReportById(reportId);
      
      if (response.success) {
        setReport(smartReportsService.formatReportForDisplay(response.data));
      } else {
        throw new Error(response.message || 'Failed to fetch report');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.message || 'Failed to fetch report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  /**
   * Refresh report data
   */
  const refreshReport = useCallback(() => {
    fetchReport();
  }, [fetchReport]);

  // Effect to fetch report when ID changes
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return {
    report,
    loading,
    error,
    refreshReport,
    setReport,
    setLoading,
    setError
  };
};


