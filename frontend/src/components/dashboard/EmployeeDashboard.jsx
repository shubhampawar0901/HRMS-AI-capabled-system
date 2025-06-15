import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  Calendar,
  Clock,
  User,
  Target,
  TrendingUp,
  Award,
  Coffee,
  CheckCircle,
  Star
} from 'lucide-react';
import useDashboardData from '@/hooks/useDashboardData';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import AIInsightsWidget from './AIInsightsWidget';
import AttendanceWidget from './AttendanceWidget';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const EmployeeDashboard = () => {
  const { user } = useAuthContext();
  const { dashboardData, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error Loading Dashboard</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const quickActions = dashboardData?.quickActions || [];
  const aiInsights = dashboardData?.aiInsights || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Hello, {user?.name || 'Employee'}! 🌟
            </h1>
            <p className="text-purple-100 text-lg">
              Your personal workspace for productivity and growth.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Personal Attendance This Month"
          value={stats.personalAttendanceThisMonth}
          icon={Clock}
          color="blue"
          format="percentage"
          trend="up"
          change={2}
          changeType="percentage"
        />
        <StatsCard
          title="Leave Balance"
          value={stats.leaveBalance}
          icon={Calendar}
          color="green"
          format="number"
          trend="stable"
          change={0}
          changeType="number"
        />
        <StatsCard
          title="Upcoming Holidays"
          value={stats.upcomingHolidays}
          icon={Coffee}
          color="orange"
          format="number"
          trend="stable"
          change={0}
          changeType="number"
        />
        <StatsCard
          title="Personal Performance Score"
          value={stats.personalPerformanceScore}
          icon={Star}
          color="purple"
          format="number"
          trend="up"
          change={5}
          changeType="percentage"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <QuickActions actions={quickActions} userRole="employee" />
        </div>

        {/* AI Insights */}
        <div>
          <AIInsightsWidget insights={aiInsights} userRole="employee" />
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Attendance Widget */}
        <AttendanceWidget />

        {/* Personal Goals & Progress */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-purple-600 mr-2" />
            Personal Goals & Progress
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Monthly Goals</span>
              </div>
              <span className="text-lg font-bold text-purple-700">8/10</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Skill Development</span>
              </div>
              <span className="text-lg font-bold text-green-700">75%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Achievements</span>
              </div>
              <span className="text-lg font-bold text-blue-700">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
