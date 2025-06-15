/**
 * Anomaly Detection Controls Component
 * Provides filtering, detection controls, and search functionality
 * 
 * Features:
 * - Date range picker for analysis period
 * - Employee/Team selector (role-based)
 * - Manual anomaly detection trigger
 * - Severity filter tabs with smooth transitions
 * - Status filter controls
 * - Mobile-responsive design with touch interactions
 */

import React, { useState, useCallback } from 'react';
import { useAnomalyDetection } from '@/contexts/AnomalyDetectionContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  Search, 
  Calendar, 
  Users, 
  Play, 
  Filter,
  X,
  ChevronDown
} from 'lucide-react';

/**
 * Filter Tabs Component
 */
const FilterTabs = React.memo(({ activeFilter, onFilterChange, loading }) => {
  const filters = [
    { key: 'all', label: 'All Severities', color: 'gray' },
    { key: 'high', label: 'High', color: 'red' },
    { key: 'medium', label: 'Medium', color: 'yellow' },
    { key: 'low', label: 'Low', color: 'blue' }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange('severity', filter.key)}
          disabled={loading}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${activeFilter === filter.key
              ? `ai-button text-white`
              : `bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300`
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
});

FilterTabs.displayName = 'FilterTabs';

/**
 * Date Range Picker Component
 */
const DateRangePicker = React.memo(({ dateRange, onDateRangeChange, loading }) => {
  const handleStartDateChange = (e) => {
    onDateRangeChange({
      ...dateRange,
      startDate: e.target.value
    });
  };

  const handleEndDateChange = (e) => {
    onDateRangeChange({
      ...dateRange,
      endDate: e.target.value
    });
  };

  const clearDateRange = () => {
    onDateRangeChange({
      startDate: null,
      endDate: null
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={dateRange.startDate || ''}
          onChange={handleStartDateChange}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          End Date
        </label>
        <input
          type="date"
          value={dateRange.endDate || ''}
          onChange={handleEndDateChange}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>
      {(dateRange.startDate || dateRange.endDate) && (
        <div className="flex items-end">
          <button
            onClick={clearDateRange}
            disabled={loading}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            title="Clear date range"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
});

DateRangePicker.displayName = 'DateRangePicker';

/**
 * Main Anomaly Detection Controls Component
 */
const AnomalyDetectionControls = React.memo(() => {
  const { user } = useAuthContext();
  const {
    filters,
    loading,
    isDetecting,
    updateFilter,
    updateFilters,
    resetFilters,
    detectAnomalies
  } = useAnomalyDetection();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [detectionDateRange, setDetectionDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // ==========================================
  // FILTER HANDLERS
  // ==========================================

  const handleFilterChange = useCallback((key, value) => {
    updateFilter(key, value);
  }, [updateFilter]);

  const handleDateRangeChange = useCallback((newDateRange) => {
    updateFilters({ dateRange: newDateRange });
  }, [updateFilters]);

  const handleDetectionDateRangeChange = useCallback((newDateRange) => {
    setDetectionDateRange(newDateRange);
  }, []);

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setDetectionDateRange({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  }, [resetFilters]);

  // ==========================================
  // DETECTION HANDLER
  // ==========================================

  const handleRunDetection = useCallback(async () => {
    try {
      await detectAnomalies(null, detectionDateRange);
    } catch (error) {
      console.error('Error running detection:', error);
    }
  }, [detectAnomalies, detectionDateRange]);

  // ==========================================
  // STATUS FILTER OPTIONS
  // ==========================================

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'ignored', label: 'Ignored' }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Detection Controls
          </h2>
        </div>
        
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <span>Advanced Filters</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main Controls */}
      <div className="ai-card p-6 space-y-6">
        
        {/* Manual Detection Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <Play className="h-4 w-4 text-blue-600" />
            <span>Run AI Detection</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Analysis Period
              </label>
              <DateRangePicker
                dateRange={detectionDateRange}
                onDateRangeChange={handleDetectionDateRangeChange}
                loading={isDetecting}
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleRunDetection}
                disabled={isDetecting || loading}
                className={`
                  ai-button w-full py-3 flex items-center justify-center space-x-2
                  ${isDetecting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Play className={`h-4 w-4 ${isDetecting ? 'animate-pulse' : ''}`} />
                <span>{isDetecting ? 'Analyzing...' : 'Run Detection'}</span>
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-600">
            {user?.role === 'admin' 
              ? 'Analyze attendance patterns for all employees in the selected date range.'
              : 'Analyze attendance patterns for your team members in the selected date range.'
            }
          </p>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <Search className="h-4 w-4 text-blue-600" />
            <span>Filter Results</span>
          </h3>
          
          {/* Severity Filter Tabs */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Severity Level
            </label>
            <FilterTabs
              activeFilter={filters.severity}
              onFilterChange={handleFilterChange}
              loading={loading}
            />
          </div>

          {/* Status Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200 ai-fade-in">
            <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Advanced Filters</span>
            </h3>
            
            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Filter by Detection Date
              </label>
              <DateRangePicker
                dateRange={filters.dateRange}
                onDateRangeChange={handleDateRangeChange}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Reset Filters */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleResetFilters}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Reset All Filters
          </button>
        </div>
      </div>
    </div>
  );
});

AnomalyDetectionControls.displayName = 'AnomalyDetectionControls';

export default AnomalyDetectionControls;
