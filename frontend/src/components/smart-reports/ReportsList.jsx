import React, { useState } from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useSmartReports } from '@/hooks/useSmartReports';
import { useAuth } from '@/hooks/useAuth';
import { ReportCardSkeleton, ReportsEmptyState } from './ReportCard';

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
            <div className="space-y-6">
              {[...Array(4)].map((_, index) => (
                <ReportDocumentSkeleton key={index} />
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
            {/* Reports Document List */}
            <div className="p-6">
              <div className="space-y-6">
                {reports.map((report) => (
                  <ReportDocumentItem
                    key={report.id}
                    report={report}
                    onView={handleViewReport}
                    onDelete={handleDeleteReport}
                    permissions={permissions}
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

/**
 * Report Document Item Component
 * Displays a report in document-style format instead of card format
 */
const ReportDocumentItem = ({ report, onView, onDelete, permissions }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Handle view report
   */
  const handleView = () => {
    if (onView && report.status === 'completed') {
      onView(report);
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(report.id);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /**
   * Get report type icon
   */
  const getReportTypeIcon = () => {
    switch (report.reportType) {
      case 'employee':
        return <UserIcon className="h-6 w-6 text-blue-600" />;
      case 'team':
        return <UsersIcon className="h-6 w-6 text-green-600" />;
      default:
        return <DocumentTextIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  /**
   * Get report type label
   */
  const getReportTypeLabel = () => {
    switch (report.reportType) {
      case 'employee':
        return 'Employee Report';
      case 'team':
        return 'Team Report';
      default:
        return 'Report';
    }
  };

  /**
   * Get status badge
   */
  const getStatusBadge = () => {
    switch (report.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'generating':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Generating
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  /**
   * Get summary preview
   */
  const getSummaryPreview = () => {
    const content = report.reportDocument || report.aiSummary || '';
    if (!content) return 'No summary available.';

    // Extract first meaningful paragraph
    const cleanContent = content.replace(/[#*\-]/g, '').trim();
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 20);

    if (sentences.length > 0) {
      const preview = sentences[0].trim() + '.';
      return preview.length > 200 ? preview.substring(0, 200) + '...' : preview;
    }

    return cleanContent.length > 200 ? cleanContent.substring(0, 200) + '...' : cleanContent;
  };

  /**
   * Check if user can delete this report
   */
  const canDelete = () => {
    return ['admin', 'manager'].includes(user?.role) &&
           (user?.role === 'admin' || report.generatedBy === user?.id);
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-200
      hover:shadow-md hover:border-gray-300
      transition-all duration-300 ease-in-out
      ${report.status === 'completed' ? 'hover:scale-[1.01]' : ''}
    `}>
      {/* Document Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Report Icon */}
            <div className="flex-shrink-0 mt-1">
              {getReportTypeIcon()}
            </div>

            {/* Report Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {report.reportName || `${getReportTypeLabel()} - ${report.targetName}`}
                </h3>
                {getStatusBadge()}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Generated {formatDate(report.createdAt)}
                </span>
                <span>•</span>
                <span>{getReportTypeLabel()}</span>
                <span>•</span>
                <span className="font-medium">{report.targetName}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {/* View Button */}
            <button
              onClick={handleView}
              disabled={report.status !== 'completed'}
              className={`
                inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                transition-all duration-200 ease-in-out
                ${report.status === 'completed'
                  ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 hover:scale-105 border border-blue-200'
                  : 'text-gray-400 bg-gray-50 cursor-not-allowed border border-gray-200'
                }
              `}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View Report
            </button>

            {/* Delete Button */}
            {canDelete() && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="
                  inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                  text-red-700 bg-red-50 hover:bg-red-100 hover:scale-105
                  border border-red-200 transition-all duration-200 ease-in-out
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview */}
      {report.status === 'completed' && (
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Executive Summary</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getSummaryPreview()}
            </p>
          </div>

          {/* Key Metrics */}
          {report.keyMetrics && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.keyMetrics.overallScore && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Overall Score</div>
                  <div className="text-lg font-semibold text-blue-900">{report.keyMetrics.overallScore}%</div>
                </div>
              )}
              {report.keyMetrics.attendanceRate && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide">Attendance Rate</div>
                  <div className="text-lg font-semibold text-green-900">{report.keyMetrics.attendanceRate}%</div>
                </div>
              )}
              {report.keyMetrics.performanceRating && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Performance</div>
                  <div className="text-lg font-semibold text-purple-900">{report.keyMetrics.performanceRating}/5</div>
                </div>
              )}
            </div>
          )}

          {/* Insights Count */}
          {(report.insights || report.recommendations) && (
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
              {report.insights && (
                <span className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  {Array.isArray(report.insights) ? report.insights.length : 0} insights
                </span>
              )}
              {report.recommendations && (
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {Array.isArray(report.recommendations) ? report.recommendations.length : 0} recommendations
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Generating State */}
      {report.status === 'generating' && (
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Generating AI insights...</p>
            </div>
          </div>
        </div>
      )}

      {/* Failed State */}
      {report.status === 'failed' && (
        <div className="p-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">
                Report generation failed. Please try generating a new report.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Report</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton Report Document Item for loading states
 */
const ReportDocumentSkeleton = ({ className = '' }) => {
  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-200
      animate-pulse
      ${className}
    `}>
      {/* Header Skeleton */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-6 h-6 bg-gray-300 rounded mt-1"></div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-6 bg-gray-300 rounded w-2/3"></div>
                <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="w-24 h-8 bg-gray-300 rounded"></div>
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>

        {/* Metrics Skeleton */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
              <div className="h-5 bg-gray-300 rounded w-12"></div>
            </div>
          ))}
        </div>

        {/* Insights Skeleton */}
        <div className="mt-4 flex items-center space-x-6">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default ReportsList;
