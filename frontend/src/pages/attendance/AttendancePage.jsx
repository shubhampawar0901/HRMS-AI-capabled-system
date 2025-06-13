import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CheckInOut from '@/components/attendance/CheckInOut';
import AttendanceHistory from '@/components/attendance/AttendanceHistory';
import AttendanceStats from '@/components/attendance/AttendanceStats';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Calendar,
  BarChart3
} from 'lucide-react';

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const { user } = useAuth();

  const tabs = [
    { id: 'checkin', label: 'Check In/Out', icon: Clock },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'stats', label: 'Statistics', icon: BarChart3 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'checkin':
        return <CheckInOut />;
      case 'history':
        return <AttendanceHistory />;
      case 'stats':
        return <AttendanceStats />;
      default:
        return <CheckInOut />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track your attendance and work hours</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AttendancePage;
