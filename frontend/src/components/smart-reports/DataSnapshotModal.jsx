import React, { useState } from 'react';
import { 
  XMarkIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

/**
 * Data Snapshot Modal Component
 * Displays the raw data used to generate the smart report
 */
const DataSnapshotModal = ({ 
  data, 
  reportName, 
  onClose,
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!data) {
    return null;
  }

  /**
   * Render overview tab
   */
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Employee/Team Info */}
      {data.employee && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-semibold text-blue-900">Employee Information</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{data.employee.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Employee Code:</span>
              <span className="ml-2 text-gray-900">{data.employee.employeeCode}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Position:</span>
              <span className="ml-2 text-gray-900">{data.employee.position}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Department:</span>
              <span className="ml-2 text-gray-900">{data.employee.department}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Hire Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(data.employee.hireDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tenure:</span>
              <span className="ml-2 text-gray-900">{data.employee.tenure} years</span>
            </div>
          </div>
        </div>
      )}

      {/* Team Info */}
      {data.team && (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <UsersIcon className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-green-900">Team Information</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Manager:</span>
              <span className="ml-2 text-gray-900">{data.manager?.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Team Size:</span>
              <span className="ml-2 text-gray-900">{data.team.size} members</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Department:</span>
              <span className="ml-2 text-gray-900">{data.manager?.department}</span>
            </div>
          </div>
        </div>
      )}

      {/* Date Range */}
      {data.dateRange && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CalendarIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Analysis Period</h4>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">From:</span>
            <span className="ml-2 text-gray-900">
              {new Date(data.dateRange.startDate).toLocaleDateString()}
            </span>
            <span className="mx-4 text-gray-500">to</span>
            <span className="font-medium text-gray-700">To:</span>
            <span className="ml-2 text-gray-900">
              {new Date(data.dateRange.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Render performance tab
   */
  const renderPerformance = () => {
    if (!data.performance) {
      return <div className="text-center py-8 text-gray-500">No performance data available</div>;
    }

    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-5 w-5 text-indigo-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Performance Metrics</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-indigo-600">
                {data.performance.averageRating}
              </div>
              <div className="text-sm text-indigo-700">Average Rating</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {data.performance.totalReviews}
              </div>
              <div className="text-sm text-blue-700">Total Reviews</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {data.performance.highestRating}
              </div>
              <div className="text-sm text-green-700">Highest Rating</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600 capitalize">
                {data.performance.ratingTrend}
              </div>
              <div className="text-sm text-purple-700">Rating Trend</div>
            </div>
          </div>

          {data.performance.lastReviewDate && (
            <div className="mt-4 text-sm text-gray-600">
              <span className="font-medium">Last Review:</span>
              <span className="ml-2">
                {new Date(data.performance.lastReviewDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render attendance tab
   */
  const renderAttendance = () => {
    if (!data.attendance) {
      return <div className="text-center py-8 text-gray-500">No attendance data available</div>;
    }

    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <CalendarIcon className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Attendance Metrics</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {data.attendance.attendanceRate}%
              </div>
              <div className="text-sm text-green-700">Attendance Rate</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {data.attendance.punctualityRate}%
              </div>
              <div className="text-sm text-blue-700">Punctuality Rate</div>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-indigo-600">
                {data.attendance.totalHours}
              </div>
              <div className="text-sm text-indigo-700">Total Hours</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">
                {data.attendance.averageDailyHours}
              </div>
              <div className="text-sm text-purple-700">Avg Daily Hours</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Present Days:</span>
              <span className="ml-2 text-gray-900">{data.attendance.presentDays}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Absent Days:</span>
              <span className="ml-2 text-gray-900">{data.attendance.absentDays}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Late Days:</span>
              <span className="ml-2 text-gray-900">{data.attendance.lateDays}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render goals tab
   */
  const renderGoals = () => {
    if (!data.goals) {
      return <div className="text-center py-8 text-gray-500">No goals data available</div>;
    }

    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <TrophyIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Goals & Achievements</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">
                {data.goals.completionRate}%
              </div>
              <div className="text-sm text-yellow-700">Completion Rate</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600">
                {data.goals.averageAchievement}%
              </div>
              <div className="text-sm text-orange-700">Avg Achievement</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {data.goals.completedGoals}
              </div>
              <div className="text-sm text-green-700">Completed Goals</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {data.goals.activeGoals}
              </div>
              <div className="text-sm text-blue-700">Active Goals</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">Total Goals:</span>
            <span className="ml-2">{data.goals.totalGoals}</span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render leave tab
   */
  const renderLeave = () => {
    if (!data.leave) {
      return <div className="text-center py-8 text-gray-500">No leave data available</div>;
    }

    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-5 w-5 text-red-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Leave Utilization</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">
                {data.leave.utilizationRate}%
              </div>
              <div className="text-sm text-red-700">Utilization Rate</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600">
                {data.leave.approvedDays}
              </div>
              <div className="text-sm text-orange-700">Approved Days</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">
                {data.leave.pendingDays}
              </div>
              <div className="text-sm text-yellow-700">Pending Days</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-600">
                {data.leave.totalApplications}
              </div>
              <div className="text-sm text-gray-700">Total Applications</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { key: 'overview', label: 'Overview', render: renderOverview },
    { key: 'performance', label: 'Performance', render: renderPerformance },
    { key: 'attendance', label: 'Attendance', render: renderAttendance },
    { key: 'goals', label: 'Goals', render: renderGoals },
    { key: 'leave', label: 'Leave', render: renderLeave }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Data Snapshot - {reportName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      py-2 px-1 border-b-2 font-medium text-sm
                      transition-all duration-200 ease-in-out
                      ${activeTab === tab.key
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-50 px-6 py-6 max-h-96 overflow-y-auto">
            {tabs.find(tab => tab.key === activeTab)?.render()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="
                  px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                  rounded-md hover:bg-gray-50 hover:scale-105
                  transition-all duration-200 ease-in-out
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSnapshotModal;
