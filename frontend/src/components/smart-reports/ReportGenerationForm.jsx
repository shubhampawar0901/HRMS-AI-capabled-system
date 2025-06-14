import React, { useEffect, useState } from 'react';
import { 
  UserIcon, 
  UsersIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  SparklesIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { useAuth } from '@/contexts/AuthContext';
import { employeeService } from '@/services/employeeService';

/**
 * Report Generation Form Component
 * Handles the creation of new smart reports with comprehensive form validation
 */
const ReportGenerationForm = ({ 
  onReportGenerated, 
  onCancel,
  className = '' 
}) => {
  const { user } = useAuth();
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const {
    formData,
    errors,
    loading,
    updateFormData,
    setDateRangeFromOption,
    resetForm,
    generateReport,
    availableReportTypes,
    dateRangeOptions,
    canGenerateReports,
    selectedTargetName,
    autoGenerateReportName
  } = useReportGeneration(onReportGenerated, (error) => {
    console.error('Report generation failed:', error);
  });

  /**
   * Load employee options for selection
   */
  const loadEmployeeOptions = async () => {
    setLoadingEmployees(true);
    try {
      const response = await employeeService.getEmployees({ 
        limit: 100, 
        status: 'active' 
      });
      
      if (response.success) {
        setEmployeeOptions(response.data.employees || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  /**
   * Load manager options for team reports
   */
  const loadManagerOptions = async () => {
    setLoadingEmployees(true);
    try {
      // Get employees who have team members (managers)
      const response = await employeeService.getManagers();
      
      if (response.success) {
        setManagerOptions(response.data.managers || []);
      }
    } catch (error) {
      console.error('Error loading managers:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await generateReport();
    
    if (result.success) {
      // Form will be reset by the hook
      if (onReportGenerated) {
        onReportGenerated(result.data);
      }
    }
  };

  /**
   * Handle report type change
   */
  const handleReportTypeChange = (reportType) => {
    updateFormData({ reportType, targetId: '' });
    
    // Load appropriate options
    if (reportType === 'employee') {
      loadEmployeeOptions();
    } else if (reportType === 'team') {
      loadManagerOptions();
    }
  };

  /**
   * Handle target selection change
   */
  const handleTargetChange = (targetId) => {
    updateFormData({ targetId });
  };

  /**
   * Get target options based on report type
   */
  const getTargetOptions = () => {
    if (formData.reportType === 'employee') {
      return employeeOptions.map(emp => ({
        value: emp.id,
        label: `${emp.firstName} ${emp.lastName}`,
        subtitle: `${emp.employeeCode} • ${emp.position}`,
        department: emp.department_name
      }));
    } else if (formData.reportType === 'team') {
      return managerOptions.map(mgr => ({
        value: mgr.id,
        label: `${mgr.firstName} ${mgr.lastName}'s Team`,
        subtitle: `${mgr.position} • ${mgr.department_name}`,
        department: mgr.department_name
      }));
    }
    return [];
  };

  /**
   * Auto-generate report name when target changes
   */
  useEffect(() => {
    if (formData.targetId && selectedTargetName) {
      autoGenerateReportName();
    }
  }, [formData.targetId, selectedTargetName, autoGenerateReportName]);

  // Load initial data
  useEffect(() => {
    if (formData.reportType === 'employee') {
      loadEmployeeOptions();
    } else if (formData.reportType === 'team') {
      loadManagerOptions();
    }
  }, []);

  if (!canGenerateReports) {
    return (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="mt-2 text-sm text-gray-500">
          You don't have permission to generate smart reports.
        </p>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Header */}
        <div className="text-center">
          <SparklesIcon className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Generate Smart Report
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create AI-powered performance insights and recommendations
          </p>
        </div>

        {/* Report Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Report Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableReportTypes.map((type) => (
              <div
                key={type.value}
                className={`
                  relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200
                  ${formData.reportType === type.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => handleReportTypeChange(type.value)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {type.value === 'employee' ? (
                      <UserIcon className={`h-6 w-6 ${
                        formData.reportType === type.value ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                    ) : (
                      <UsersIcon className={`h-6 w-6 ${
                        formData.reportType === type.value ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      formData.reportType === type.value ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </h3>
                    <p className={`text-xs ${
                      formData.reportType === type.value ? 'text-indigo-700' : 'text-gray-500'
                    }`}>
                      {type.value === 'employee' 
                        ? 'Individual performance analysis'
                        : 'Team performance overview'
                      }
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="reportType"
                  value={type.value}
                  checked={formData.reportType === type.value}
                  onChange={() => handleReportTypeChange(type.value)}
                  className="sr-only"
                />
              </div>
            ))}
          </div>
          {errors.reportType && (
            <p className="mt-2 text-sm text-red-600">{errors.reportType}</p>
          )}
        </div>

        {/* Target Selection */}
        {formData.reportType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.reportType === 'employee' ? 'Select Employee' : 'Select Manager'}
            </label>
            <select
              value={formData.targetId}
              onChange={(e) => handleTargetChange(e.target.value)}
              disabled={loadingEmployees}
              className={`
                block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${errors.targetId ? 'border-red-300' : ''}
              `}
            >
              <option value="">
                {loadingEmployees 
                  ? 'Loading...' 
                  : `Choose ${formData.reportType === 'employee' ? 'employee' : 'manager'}`
                }
              </option>
              {getTargetOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.subtitle}
                </option>
              ))}
            </select>
            {errors.targetId && (
              <p className="mt-2 text-sm text-red-600">{errors.targetId}</p>
            )}
          </div>
        )}

        {/* Date Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range (Optional)
          </label>
          
          {/* Quick Date Range Options */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDateRangeFromOption(option)}
                  className="
                    px-3 py-1.5 text-xs font-medium rounded-md border
                    text-gray-700 bg-gray-100 border-gray-200
                    hover:bg-gray-200 hover:scale-105
                    transition-all duration-200 ease-in-out
                  "
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.dateRange.startDate}
                onChange={(e) => updateFormData({
                  dateRange: { ...formData.dateRange, startDate: e.target.value }
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.dateRange.endDate}
                onChange={(e) => updateFormData({
                  dateRange: { ...formData.dateRange, endDate: e.target.value }
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          {errors.dateRange && (
            <p className="mt-2 text-sm text-red-600">{errors.dateRange}</p>
          )}
        </div>

        {/* Report Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Name (Optional)
          </label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.reportName}
              onChange={(e) => updateFormData({ reportName: e.target.value })}
              placeholder="Auto-generated based on selection"
              className={`
                block w-full pl-10 rounded-md border-gray-300 shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500
                ${errors.reportName ? 'border-red-300' : ''}
              `}
            />
          </div>
          {errors.reportName && (
            <p className="mt-2 text-sm text-red-600">{errors.reportName}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Leave blank to auto-generate based on your selections
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              resetForm();
              if (onCancel) onCancel();
            }}
            className="
              px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
              rounded-md hover:bg-gray-50 hover:scale-105
              transition-all duration-200 ease-in-out
            "
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || !formData.reportType || !formData.targetId}
            className="
              px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent 
              rounded-md hover:bg-indigo-700 hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              transition-all duration-200 ease-in-out
              flex items-center space-x-2
            "
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerationForm;
