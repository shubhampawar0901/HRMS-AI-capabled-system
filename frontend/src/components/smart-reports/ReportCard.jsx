import React, { useState } from 'react';
import { 
  EyeIcon, 
  TrashIcon, 
  DocumentTextIcon,
  UserIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ReportStatusBadge from './ReportStatusBadge';
import { useAuth } from '@/hooks/useAuth';

/**
 * Report Card Component
 * Displays a smart report in a card format with actions and status
 */
const ReportCard = ({ 
  report, 
  onView, 
  onDelete, 
  onStatusUpdate,
  className = '' 
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Handle view report
   */
  const handleView = () => {
    if (onView) {
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
        return <UserIcon className="h-5 w-5 text-blue-600" />;
      case 'team':
        return <UsersIcon className="h-5 w-5 text-green-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
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
   * Check if user can delete this report
   */
  const canDelete = () => {
    return ['admin', 'manager'].includes(user?.role) && 
           (user?.role === 'admin' || report.generatedBy === user?.id);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get summary preview (first 150 characters)
   */
  const getSummaryPreview = () => {
    if (!report.aiSummary) return 'No summary available';
    
    const summary = report.aiSummary;
    if (summary.length <= 150) return summary;
    
    return summary.substring(0, 150) + '...';
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-200 
      hover:shadow-md hover:scale-[1.02] 
      transition-all duration-300 ease-in-out
      ${className}
    `}>
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getReportTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {report.reportName || `${getReportTypeLabel()} - ${report.targetName}`}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {getReportTypeLabel()} • {report.targetName}
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <ReportStatusBadge 
              status={report.status} 
              size="sm"
              animated={true}
            />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-6 pb-4">
        {/* Summary Preview */}
        {report.status === 'completed' && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {getSummaryPreview()}
            </p>
          </div>
        )}

        {/* Insights Count */}
        {report.status === 'completed' && report.insights && (
          <div className="mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                {report.insights.length} insights
              </span>
              {report.recommendations && (
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {report.recommendations.length} recommendations
                </span>
              )}
            </div>
          </div>
        )}

        {/* Generation Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Generated {formatDate(report.createdAt)}</span>
          </div>
          {report.generatedByName && (
            <span>by {report.generatedByName}</span>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {/* View Button */}
            <button
              onClick={handleView}
              disabled={report.status !== 'completed'}
              className={`
                inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                transition-all duration-200 ease-in-out
                ${report.status === 'completed'
                  ? 'text-blue-700 bg-blue-100 hover:bg-blue-200 hover:scale-105'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }
              `}
            >
              <EyeIcon className="h-4 w-4 mr-1.5" />
              View Report
            </button>
          </div>

          {/* Delete Button */}
          {canDelete() && (
            <div className="flex space-x-2">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="
                    inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                    text-red-700 bg-red-100 hover:bg-red-200 hover:scale-105
                    transition-all duration-200 ease-in-out
                  "
                >
                  <TrashIcon className="h-4 w-4 mr-1.5" />
                  Delete
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="
                      px-3 py-2 text-sm font-medium rounded-md
                      text-gray-700 bg-gray-100 hover:bg-gray-200
                      transition-all duration-200 ease-in-out
                    "
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="
                      px-3 py-2 text-sm font-medium rounded-md
                      text-white bg-red-600 hover:bg-red-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 ease-in-out
                    "
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Report Card for loading states
 */
export const ReportCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-200 
      animate-pulse
      ${className}
    `}>
      {/* Header Skeleton */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-6 pb-4">
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>

      {/* Actions Skeleton */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-300 rounded w-24"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Empty State Component for when no reports exist
 */
export const ReportsEmptyState = ({ 
  title = "No reports found",
  description = "Get started by generating your first smart report",
  actionLabel = "Generate Report",
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
        {description}
      </p>
      {onAction && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="
              inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
              text-white bg-indigo-600 hover:bg-indigo-700
              transition-all duration-200 ease-in-out hover:scale-105
            "
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
