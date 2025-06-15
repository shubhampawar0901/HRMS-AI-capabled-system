import React, { useEffect, useState } from 'react';
import {
  UserIcon,
  UsersIcon,
  SparklesIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { employeeService } from '@/services/employeeService';
import { smartReportsService } from '@/services/smartReportsService';

/**
 * Simplified Report Generation Form Component
 * Streamlined one-click report generation experience
 */
const ReportGenerationForm = ({
  onReportGenerated,
  onCancel,
  className = ''
}) => {
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    reportType: 'employee',
    targetId: ''
  });

  // UI state
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Available report types based on user role
  const availableReportTypes = [
    { value: 'employee', label: 'Employee Report' },
    { value: 'team', label: 'Team Report' }
  ];

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
   * Simplified form submission - synchronous generation
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.reportType || !formData.targetId) {
      setError('Please select both report type and target.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare submission data with system defaults
      const submissionData = {
        reportType: formData.reportType,
        targetId: parseInt(formData.targetId),
        // System defaults - no user input required
        reportName: `${formData.reportType === 'employee' ? 'Employee' : 'Team'} Report - ${new Date().toLocaleDateString()}`,
        dateRange: {
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 90 days
          endDate: new Date().toISOString().split('T')[0]
        }
      };

      // Generate report synchronously
      const response = await smartReportsService.generateReport(submissionData);

      if (response.success) {
        // Reset form
        setFormData({ reportType: 'employee', targetId: '' });

        // Call success callback with generated report
        if (onReportGenerated) {
          onReportGenerated(response.data);
        }
      } else {
        throw new Error(response.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle report type change
   */
  const handleReportTypeChange = (reportType) => {
    setFormData({ reportType, targetId: '' });
    setError('');

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
    setFormData(prev => ({ ...prev, targetId }));
    setError('');
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
   * Check if user can generate reports
   */
  const canGenerateReports = ['admin', 'manager'].includes(user?.role);

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

  // Loading state during report generation
  if (loading) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="text-center py-12">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <SparklesIcon className="h-8 w-8 text-indigo-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Generating Your Report...
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Our AI is analyzing performance data and creating insights. This may take a moment.
          </p>

          {/* Generic Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>

          <p className="text-xs text-gray-500">
            Please don't close this window...
          </p>
        </div>
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
            One-click AI-powered performance insights and recommendations
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

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
                  relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:scale-105
                  ${formData.reportType === type.value
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
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
              className="
                block w-full rounded-md border-gray-300 shadow-sm
                focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-all duration-200 hover:shadow-md
              "
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
          </div>
        )}

        {/* Simplified Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <SparklesIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Smart Report Features
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• AI analyzes last 90 days of performance data</li>
                <li>• Includes attendance, goals, and review metrics</li>
                <li>• Generates actionable insights and recommendations</li>
                <li>• Report name auto-generated based on selection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setFormData({ reportType: 'employee', targetId: '' });
              setError('');
              if (onCancel) onCancel();
            }}
            className="
              px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
              rounded-md hover:bg-gray-50 hover:scale-105 hover:shadow-md
              transition-all duration-200 ease-in-out
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!formData.reportType || !formData.targetId || loadingEmployees}
            className="
              px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600
              border border-transparent rounded-md hover:from-indigo-700 hover:to-purple-700
              hover:scale-105 hover:shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              transition-all duration-200 ease-in-out
              flex items-center space-x-2
            "
          >
            <SparklesIcon className="h-5 w-5" />
            <span>Generate Smart Report</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerationForm;
