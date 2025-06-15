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
   * Render markdown-style content with basic formatting
   */
  const renderMarkdownContent = (content) => {
    if (!content) return null;

    // Split content into lines and process each line
    const lines = content.split('\n');
    const elements = [];
    let currentElement = null;
    let listItems = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle headers
      if (trimmedLine.startsWith('# ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
          listItems = [];
        }
        elements.push(<h1 key={index} className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">{trimmedLine.substring(2)}</h1>);
      } else if (trimmedLine.startsWith('## ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
          listItems = [];
        }
        elements.push(<h2 key={index} className="text-xl font-semibold text-gray-800 mb-4 mt-6">{trimmedLine.substring(3)}</h2>);
      } else if (trimmedLine.startsWith('### ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
          listItems = [];
        }
        elements.push(<h3 key={index} className="text-lg font-medium text-gray-700 mb-3 mt-4">{trimmedLine.substring(4)}</h3>);
      }
      // Handle bullet points
      else if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
        const content = trimmedLine.substring(2);
        // Handle bold text in bullet points
        const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        listItems.push(<li key={index} className="text-gray-700" dangerouslySetInnerHTML={{ __html: formattedContent }} />);
      }
      // Handle regular paragraphs
      else if (trimmedLine && !trimmedLine.startsWith('---')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
          listItems = [];
        }
        // Handle bold text and other formatting
        let formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        elements.push(<p key={index} className="text-gray-700 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />);
      }
      // Handle empty lines (spacing)
      else if (!trimmedLine && !trimmedLine.startsWith('---')) {
        // Add spacing for empty lines
        if (elements.length > 0 && elements[elements.length - 1].type !== 'div') {
          elements.push(<div key={index} className="mb-2" />);
        }
      }
    });

    // Add any remaining list items
    if (listItems.length > 0) {
      elements.push(<ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
    }

    return elements;
  };

  /**
   * Render the unified report document
   */
  const renderReportDocument = () => {
    // Get the report content - prioritize reportDocument, fallback to aiSummary
    const reportContent = report.reportDocument || report.aiSummary || 'No report content available.';

    return (
      <div className="max-w-none">
        {/* Key Metrics Dashboard - Show at top if available */}
        {report.keyMetrics && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall Score */}
              {report.keyMetrics.overallScore && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <ChartBarIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Overall Score</p>
                      <p className="text-lg font-semibold text-indigo-600">
                        {report.keyMetrics.overallScore}/100
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Retention Risk */}
              {report.keyMetrics.retentionRisk && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        report.keyMetrics.retentionRisk === 'high' ? 'bg-red-100' :
                        report.keyMetrics.retentionRisk === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <UserIcon className={`h-5 w-5 ${
                          report.keyMetrics.retentionRisk === 'high' ? 'text-red-600' :
                          report.keyMetrics.retentionRisk === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Retention Risk</p>
                      <p className={`text-lg font-semibold capitalize ${
                        report.keyMetrics.retentionRisk === 'high' ? 'text-red-600' :
                        report.keyMetrics.retentionRisk === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {report.keyMetrics.retentionRisk}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Development Potential */}
              {report.keyMetrics.developmentPotential && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <EyeIcon className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Development Potential</p>
                      <p className="text-lg font-semibold text-purple-600 capitalize">
                        {report.keyMetrics.developmentPotential}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Effectiveness (for team reports) */}
              {report.keyMetrics.teamEffectivenessScore && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <ChartBarIcon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Team Effectiveness</p>
                      <p className="text-lg font-semibold text-green-600">
                        {report.keyMetrics.teamEffectivenessScore}/100
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Report Document */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            {renderMarkdownContent(reportContent)}
          </div>
        </div>

        {/* Strength and Improvement Areas - Show at bottom if available */}
        {report.keyMetrics && (report.keyMetrics.strengthAreas || report.keyMetrics.improvementAreas) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strength Areas */}
            {report.keyMetrics.strengthAreas && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-900 mb-4">Key Strengths</h4>
                <ul className="space-y-3">
                  {report.keyMetrics.strengthAreas.map((strength, index) => (
                    <li key={index} className="flex items-start text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-sm font-medium">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvement Areas */}
            {report.keyMetrics.improvementAreas && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-orange-900 mb-4">Areas for Improvement</h4>
                <ul className="space-y-3">
                  {report.keyMetrics.improvementAreas.map((area, index) => (
                    <li key={index} className="flex items-start text-orange-800">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-sm font-medium">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
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

      </div>

      {/* Content */}
      <div className="min-h-96">
        {report.status === 'completed' ? (
          <div className="p-6">
            {renderReportDocument()}
          </div>
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
