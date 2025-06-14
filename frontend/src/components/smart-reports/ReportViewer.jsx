import React, { useState } from 'react';
import { 
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import ReportStatusBadge from './ReportStatusBadge';
import InsightsSection from './InsightsSection';
import RecommendationsSection from './RecommendationsSection';
import DataSnapshotModal from './DataSnapshotModal';
import { useAuth } from '@/hooks/useAuth';

/**
 * Report Viewer Component
 * Displays a complete smart report with all sections and actions
 */
const ReportViewer = ({ 
  report, 
  onBack, 
  onExport,
  onShare,
  className = '' 
}) => {
  const { user } = useAuth();
  const [showDataSnapshot, setShowDataSnapshot] = useState(false);
  const [activeSection, setActiveSection] = useState('summary');

  if (!report) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <DocumentArrowDownIcon className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Report Selected</h3>
        <p className="text-sm text-gray-500">Please select a report to view</p>
      </div>
    );
  }

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get report type icon and label
   */
  const getReportTypeInfo = () => {
    switch (report.reportType) {
      case 'employee':
        return {
          icon: UserIcon,
          label: 'Employee Performance Report',
          color: 'text-blue-600'
        };
      case 'team':
        return {
          icon: ChartBarIcon,
          label: 'Team Performance Report',
          color: 'text-green-600'
        };
      default:
        return {
          icon: DocumentArrowDownIcon,
          label: 'Performance Report',
          color: 'text-gray-600'
        };
    }
  };

  const reportTypeInfo = getReportTypeInfo();
  const ReportIcon = reportTypeInfo.icon;

  /**
   * Render navigation tabs
   */
  const renderTabs = () => {
    const tabs = [
      { key: 'summary', label: 'Summary', count: null },
      { key: 'insights', label: 'Insights', count: report.insights?.length || 0 },
      { key: 'recommendations', label: 'Recommendations', count: report.recommendations?.length || 0 }
    ];

    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                transition-all duration-200 ease-in-out
                ${activeSection === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`
                  ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${activeSection === tab.key
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  /**
   * Render report summary section
   */
  const renderSummary = () => (
    <div className="prose max-w-none">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Summary</h3>
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {report.aiSummary}
        </div>
      </div>

      {/* Quick Stats */}
      {report.dataSnapshot && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {report.dataSnapshot.performance && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Performance Rating</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {report.dataSnapshot.performance.averageRating}/5.0
                  </p>
                </div>
              </div>
            </div>
          )}

          {report.dataSnapshot.attendance && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Attendance Rate</p>
                  <p className="text-lg font-semibold text-green-600">
                    {report.dataSnapshot.attendance.attendanceRate}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {report.dataSnapshot.goals && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <EyeIcon className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Goal Completion</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {report.dataSnapshot.goals.completionRate}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /**
   * Render active section content
   */
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'insights':
        return (
          <InsightsSection
            insights={report.insights || []}
            title="AI-Generated Insights"
            className="p-6"
          />
        );
      case 'recommendations':
        return (
          <RecommendationsSection
            recommendations={report.recommendations || []}
            title="Action Recommendations"
            className="p-6"
          />
        );
      case 'summary':
      default:
        return (
          <div className="p-6">
            {renderSummary()}
          </div>
        );
    }
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="
                    inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 
                    bg-white border border-gray-300 rounded-md hover:bg-gray-50
                    transition-all duration-200 ease-in-out hover:scale-105
                  "
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </button>
              )}

              {/* Report Info */}
              <div className="flex items-center space-x-3">
                <ReportIcon className={`h-6 w-6 ${reportTypeInfo.color}`} />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {report.reportName}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {reportTypeInfo.label} • {report.targetName}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <ReportStatusBadge status={report.status} size="md" />
              
              {/* View Data Button */}
              <button
                onClick={() => setShowDataSnapshot(true)}
                className="
                  inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 
                  bg-white border border-gray-300 rounded-md hover:bg-gray-50
                  transition-all duration-200 ease-in-out hover:scale-105
                "
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Data
              </button>

              {/* Export Button */}
              {onExport && (
                <button
                  onClick={() => onExport(report)}
                  className="
                    inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 
                    bg-white border border-gray-300 rounded-md hover:bg-gray-50
                    transition-all duration-200 ease-in-out hover:scale-105
                  "
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Export
                </button>
              )}

              {/* Share Button */}
              {onShare && (
                <button
                  onClick={() => onShare(report)}
                  className="
                    inline-flex items-center px-3 py-2 text-sm font-medium text-white 
                    bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700
                    transition-all duration-200 ease-in-out hover:scale-105
                  "
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </button>
              )}
            </div>
          </div>

          {/* Report Metadata */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Generated {formatDate(report.createdAt)}
            </span>
            {report.generatedByName && (
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                by {report.generatedByName}
              </span>
            )}
            {report.dataSnapshot?.dateRange && (
              <span>
                Data from {new Date(report.dataSnapshot.dateRange.startDate).toLocaleDateString()} 
                {' to '} 
                {new Date(report.dataSnapshot.dateRange.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        {renderTabs()}
      </div>

      {/* Content */}
      <div className="min-h-96">
        {report.status === 'completed' ? (
          renderActiveSection()
        ) : report.status === 'generating' ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Report</h3>
              <p className="text-sm text-gray-500">
                AI is analyzing the data and generating insights. This may take a few minutes.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.38 0 2.5-1.12 2.5-2.5 0-.394-.094-.77-.26-1.106L13.64 6.394a2.5 2.5 0 00-4.28 0L3.86 15.394c-.166.336-.26.712-.26 1.106 0 1.38 1.12 2.5 2.5 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Report Generation Failed</h3>
              <p className="text-sm text-gray-500">
                There was an error generating this report. Please try generating a new report.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Data Snapshot Modal */}
      {showDataSnapshot && (
        <DataSnapshotModal
          data={report.dataSnapshot}
          reportName={report.reportName}
          onClose={() => setShowDataSnapshot(false)}
        />
      )}
    </div>
  );
};

export default ReportViewer;
