import React, { useState } from 'react';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useSmartReports } from '@/hooks/useSmartReports';
import { useAuth } from '@/hooks/useAuth';
import ReportCard, { ReportCardSkeleton, ReportsEmptyState } from './ReportCard';

/**
 * Reports List Component
 * Displays a paginated, filterable list of smart reports
 */
const ReportsList = ({ 
  onViewReport, 
  onGenerateNew,
  refreshTrigger,
  className = '' 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const {
    reports,
    loading,
    error,
    pagination,
    filters,
    refreshReports,
    updateFilters,
    goToPage,
    changePageSize,
    clearFilters,
    deleteReport,
    permissions,
    filterOptions
  } = useSmartReports();

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Implement search logic here if needed
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (filterKey, value) => {
    updateFilters({ [filterKey]: value });
  };

  /**
   * Handle report view
   */
  const handleViewReport = (report) => {
    if (onViewReport) {
      onViewReport(report);
    }
  };

  /**
   * Handle report deletion with confirmation
   */
  const handleDeleteReport = async (reportId) => {
    const result = await deleteReport(reportId);
    
    if (!result.success) {
      // Handle error - could show toast notification
      console.error('Failed to delete report:', result.message);
    }
  };

  /**
   * Render pagination controls
   */
  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${
                    page === pagination.page
                      ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render filters section
   */
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Report Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {filterOptions.reportTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {filterOptions.statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items per page
            </label>
            <select
              value={pagination.limit}
              onChange={(e) => changePageSize(parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Clear all filters
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.38 0 2.5-1.12 2.5-2.5 0-.394-.094-.77-.26-1.106L13.64 6.394a2.5 2.5 0 00-4.28 0L3.86 15.394c-.166.336-.26.712-.26 1.106 0 1.38 1.12 2.5 2.5 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
        <p className="text-sm text-gray-500 mb-4">{typeof error === 'string' ? error : error?.message || 'An unexpected error occurred'}</p>
        <button
          onClick={refreshReports}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header with Search and Actions */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium
                  transition-all duration-200 ease-in-out
                  ${showFilters 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>

              {/* Refresh */}
              <button
                onClick={refreshReports}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Generate New Report Button */}
            {permissions.canGenerate && onGenerateNew && (
              <button
                onClick={onGenerateNew}
                className="
                  inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                  bg-indigo-600 border border-transparent rounded-md 
                  hover:bg-indigo-700 hover:scale-105
                  transition-all duration-200 ease-in-out
                "
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {renderFilters()}
      </div>

      {/* Reports Content */}
      <div className="bg-gray-50 min-h-96">
        {loading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <ReportCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : reports.length === 0 ? (
          <ReportsEmptyState
            title="No reports found"
            description={
              Object.values(filters).some(filter => filter) 
                ? "No reports match your current filters. Try adjusting your search criteria."
                : "Get started by generating your first smart report with AI-powered insights."
            }
            actionLabel="Generate Report"
            onAction={permissions.canGenerate ? onGenerateNew : undefined}
            className="py-12"
          />
        ) : (
          <>
            {/* Reports Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={handleViewReport}
                    onDelete={handleDeleteReport}
                    className="hover:shadow-lg transition-shadow duration-200"
                  />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsList;
