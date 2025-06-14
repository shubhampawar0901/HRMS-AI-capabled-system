import { useState, useCallback } from 'react';
import { smartReportsService } from '@/services/smartReportsService';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/hooks/useAuth';

/**
 * Custom hook for managing Smart Report generation
 * Handles form state, validation, submission, and progress tracking
 */
export const useReportGeneration = (onSuccess, onError) => {
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    reportType: 'employee',
    targetId: '',
    reportName: '',
    dateRange: {
      startDate: '',
      endDate: ''
    }
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generatedReport, setGeneratedReport] = useState(null);
  
  // Available options
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  /**
   * Update form data
   */
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    // Clear related errors when field is updated
    if (updates.reportType !== undefined) {
      setErrors(prev => ({ ...prev, reportType: '', targetId: '' }));
      setFormData(prev => ({ ...prev, targetId: '' })); // Reset target when type changes
    }
    
    if (updates.targetId !== undefined) {
      setErrors(prev => ({ ...prev, targetId: '' }));
    }
    
    if (updates.reportName !== undefined) {
      setErrors(prev => ({ ...prev, reportName: '' }));
    }
    
    if (updates.dateRange !== undefined) {
      setErrors(prev => ({ ...prev, dateRange: '' }));
    }
  }, []);

  /**
   * Set date range from predefined options
   */
  const setDateRangeFromOption = useCallback((option) => {
    updateFormData({
      dateRange: {
        startDate: option.startDate,
        endDate: option.endDate
      }
    });
  }, [updateFormData]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({
      reportType: 'employee',
      targetId: '',
      reportName: '',
      dateRange: {
        startDate: '',
        endDate: ''
      }
    });
    setErrors({});
    setGeneratedReport(null);
  }, []);

  /**
   * Validate form data
   */
  const validateForm = useCallback(() => {
    const validation = smartReportsService.validateReportData(formData);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData]);

  /**
   * Generate report name automatically
   */
  const generateReportName = useCallback((targetName) => {
    if (!targetName) return '';
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    
    if (formData.reportType === 'employee') {
      return `Employee Performance Report - ${targetName} (${dateStr})`;
    } else {
      return `Team Performance Report - ${targetName}'s Team (${dateStr})`;
    }
  }, [formData.reportType]);

  /**
   * Submit form and generate report
   */
  const generateReport = useCallback(async () => {
    // Validate form
    if (!validateForm()) {
      return { success: false, message: 'Please fix the form errors' };
    }
    
    setLoading(true);
    
    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        targetId: parseInt(formData.targetId)
      };
      
      // Remove empty date range
      if (!submissionData.dateRange.startDate && !submissionData.dateRange.endDate) {
        delete submissionData.dateRange;
      }
      
      // Generate report
      const response = await smartReportsService.generateReport(submissionData);
      
      if (response.success) {
        setGeneratedReport(response.data);
        
        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      
      // Call error callback
      if (onError) {
        onError(err);
      }
      
      return { success: false, message: err.message || 'Failed to generate report' };
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSuccess, onError]);

  /**
   * Load employees for selection
   */
  const loadEmployees = useCallback(async () => {
    setLoadingOptions(true);
    
    try {
      // This would typically call an employees API
      // For now, we'll use a placeholder
      const response = await fetch('/api/employees?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data.employees || []);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  /**
   * Load managers for team report selection
   */
  const loadManagers = useCallback(async () => {
    setLoadingOptions(true);
    
    try {
      // This would typically call a managers API
      // For now, we'll use a placeholder
      const response = await fetch('/api/employees?role=manager&limit=100');
      const data = await response.json();
      
      if (data.success) {
        setManagers(data.data.employees || []);
      }
    } catch (err) {
      console.error('Error loading managers:', err);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  /**
   * Get available report types for current user
   */
  const getAvailableReportTypes = useCallback(() => {
    return smartReportsService.getAvailableReportTypes(user?.role);
  }, [user?.role]);

  /**
   * Get predefined date range options
   */
  const getDateRangeOptions = useCallback(() => {
    return dataService.getDateRangeOptions();
  }, []);

  /**
   * Check if user can generate reports
   */
  const canGenerateReports = useCallback(() => {
    return ['admin', 'manager'].includes(user?.role);
  }, [user?.role]);

  /**
   * Get target options based on report type
   */
  const getTargetOptions = useCallback(() => {
    if (formData.reportType === 'employee') {
      return employees.map(emp => ({
        value: emp.id,
        label: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`,
        name: `${emp.firstName} ${emp.lastName}`
      }));
    } else if (formData.reportType === 'team') {
      return managers.map(mgr => ({
        value: mgr.id,
        label: `${mgr.firstName} ${mgr.lastName}'s Team (${mgr.department})`,
        name: `${mgr.firstName} ${mgr.lastName}`
      }));
    }
    
    return [];
  }, [formData.reportType, employees, managers]);

  /**
   * Get selected target name for auto-generating report name
   */
  const getSelectedTargetName = useCallback(() => {
    const targetOptions = getTargetOptions();
    const selectedOption = targetOptions.find(opt => opt.value === parseInt(formData.targetId));
    return selectedOption?.name || '';
  }, [formData.targetId, getTargetOptions]);

  /**
   * Auto-generate report name when target changes
   */
  const autoGenerateReportName = useCallback(() => {
    const targetName = getSelectedTargetName();
    if (targetName && !formData.reportName) {
      const generatedName = generateReportName(targetName);
      updateFormData({ reportName: generatedName });
    }
  }, [getSelectedTargetName, formData.reportName, generateReportName, updateFormData]);

  return {
    // Form state
    formData,
    errors,
    loading,
    generatedReport,
    
    // Options
    employees,
    managers,
    loadingOptions,
    
    // Actions
    updateFormData,
    setDateRangeFromOption,
    resetForm,
    validateForm,
    generateReport,
    loadEmployees,
    loadManagers,
    autoGenerateReportName,
    
    // Utilities
    availableReportTypes: getAvailableReportTypes(),
    dateRangeOptions: getDateRangeOptions(),
    targetOptions: getTargetOptions(),
    canGenerateReports: canGenerateReports(),
    selectedTargetName: getSelectedTargetName(),
    
    // State setters (for advanced use cases)
    setFormData,
    setErrors,
    setLoading,
    setGeneratedReport
  };
};

export default useReportGeneration;
