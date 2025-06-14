import React, { useState } from 'react';
import { 
  SparklesIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import ReportGenerationForm from '@/components/smart-reports/ReportGenerationForm';
import ReportsList from '@/components/smart-reports/ReportsList';
import ReportViewer from '@/components/smart-reports/ReportViewer';
import { useMultipleReportsPolling } from '@/hooks/usePolling';
import { smartReportsService } from '@/services/smartReportsService';

/**
 * Manager Smart Reports Page
 * Team-focused smart reports functionality for managers
 */
const ManagerSmartReports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [selectedReport, setSelectedReport] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [generatingReports, setGeneratingReports] = useState([]);

  // Poll status for generating reports
  const { reportsStatus, getGeneratingReports } = useMultipleReportsPolling(
    generatingReports,
    smartReportsService
  );

  /**
   * Handle successful report generation
   */
  const handleReportGenerated = (report) => {
    // Add to generating reports list for status polling
    if (report.status === 'generating') {
      setGeneratingReports(prev => [...prev, report.id]);
    }
    
    // Refresh the reports list
    setRefreshTrigger(prev => prev + 1);
    
    // Switch to list view to see the new report
    setActiveTab('list');
    
    // Show success notification
    console.log('Report generated successfully:', report);
  };

  /**
   * Handle viewing a specific report
   */
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setActiveTab('view');
  };

  /**
   * Handle going back from report view
   */
  const handleBackFromReport = () => {
    setSelectedReport(null);
    setActiveTab('list');
  };

  /**
   * Handle generating new report
   */
  const handleGenerateNew = () => {
    setActiveTab('generate');
  };

  /**
   * Handle export report
   */
  const handleExportReport = (report) => {
    // Implement export functionality
    console.log('Exporting report:', report);
  };

  /**
   * Handle share report
   */
  const handleShareReport = (report) => {
    // Implement share functionality
    console.log('Sharing report:', report);
  };

  /**
   * Get tab configuration
   */
  const getTabConfig = () => [
    {
      key: 'list',
      label: 'My Reports',
      icon: DocumentTextIcon,
      description: 'View reports for your team'
    },
    {
      key: 'generate',
      label: 'Generate',
      icon: SparklesIcon,
      description: 'Create reports for team members'
    },
    ...(selectedReport ? [{
      key: 'view',
      label: 'View Report',
      icon: ChartBarIcon,
      description: selectedReport.reportName
    }] : [])
  ];

  /**
   * Render tab navigation
   */
  const renderTabNavigation = () => {
    const tabs = getTabConfig();

    return (
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    transition-all duration-200 ease-in-out
                    ${activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === tab.key ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    );
  };

  /**
   * Render page header with manager-specific info
   */
  const renderPageHeader = () => (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Team Smart Reports
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  AI-powered insights for your team's performance and development
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {/* Manager Quick Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {getGeneratingReports().length}
                </div>
                <div>Generating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">Team</div>
                <div>Access Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Manager Info Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">Manager Access</h3>
              <p className="text-sm text-blue-700 mt-1">
                You can generate reports for your team members and view team performance insights. 
                All reports are limited to your direct reports and team data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Render active tab content
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-900">Team Reports Only</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      As a manager, you can only generate reports for your direct team members. 
                      Employee reports will be limited to your team, and team reports will show your team's performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <ReportGenerationForm
              onReportGenerated={handleReportGenerated}
              onCancel={() => setActiveTab('list')}
            />
          </div>
        );

      case 'view':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ReportViewer
              report={selectedReport}
              onBack={handleBackFromReport}
              onExport={handleExportReport}
              onShare={handleShareReport}
            />
          </div>
        );

      case 'list':
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Manager-specific guidance */}
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-green-900">Team Performance Insights</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Generate individual reports for team members to get detailed performance insights, 
                      or create team reports to see overall team trends and areas for improvement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ReportsList
              onViewReport={handleViewReport}
              onGenerateNew={handleGenerateNew}
              refreshTrigger={refreshTrigger}
            />
          </div>
        );
    }
  };

  /**
   * Render generating reports notification
   */
  const renderGeneratingNotification = () => {
    const generatingCount = getGeneratingReports().length;
    
    if (generatingCount === 0) return null;

    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {generatingCount} team report{generatingCount > 1 ? 's' : ''} currently generating. 
              You'll be notified when they're ready.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Check if user has manager or admin access
  if (!['manager', 'admin'].includes(user?.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-2 text-sm text-gray-500">
            You don't have permission to access the manager smart reports page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      {renderPageHeader()}

      {/* Generating Reports Notification */}
      {renderGeneratingNotification()}

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Tab Content */}
      <div className="bg-gray-50 min-h-screen">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ManagerSmartReports;
