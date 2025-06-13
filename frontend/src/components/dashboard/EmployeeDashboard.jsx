import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Target,
  Award,
  BookOpen,
  Bell
} from 'lucide-react';

// Components
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import AttendanceWidget from './AttendanceWidget';

// Redux actions
import { 
  fetchDashboardStats, 
  fetchRecentActivities, 
  fetchQuickActions,
  fetchLeaveSummary,
  fetchPerformanceMetrics 
} from '@/store/slices/dashboardSlice';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { 
    stats, 
    recentActivities, 
    quickActions, 
    leaveSummary, 
    performanceMetrics 
  } = useSelector(state => state.dashboard);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // Fetch dashboard data for employee
    dispatch(fetchDashboardStats('employee'));
    dispatch(fetchRecentActivities(6));
    dispatch(fetchQuickActions('employee'));
    dispatch(fetchLeaveSummary(user?.id));
    dispatch(fetchPerformanceMetrics({ employeeId: user?.id, period: 'month' }));
  }, [dispatch, user?.id]);

  const employeeActions = [
    {
      id: 'check-attendance',
      title: 'Check In/Out',
      description: 'Mark your attendance',
      icon: Clock,
      color: 'blue',
      path: '/attendance'
    },
    {
      id: 'apply-leave',
      title: 'Apply Leave',
      description: 'Request time off',
      icon: Calendar,
      color: 'green',
      path: '/leave/apply'
    },
    {
      id: 'view-payslip',
      title: 'View Payslip',
      description: 'Check salary details',
      icon: DollarSign,
      color: 'purple',
      path: '/payroll'
    },
    {
      id: 'my-goals',
      title: 'My Goals',
      description: 'Track your objectives',
      icon: Target,
      color: 'orange',
      path: '/performance/goals'
    },
    {
      id: 'learning',
      title: 'Learning',
      description: 'Access training materials',
      icon: BookOpen,
      color: 'indigo',
      path: '/learning'
    },
    {
      id: 'feedback',
      title: 'Give Feedback',
      description: 'Share your thoughts',
      icon: Award,
      color: 'red',
      path: '/feedback'
    }
  ];

  const getStatsCards = () => {
    const defaultStats = {
      attendanceRate: 95,
      leaveBalance: 18,
      hoursWorked: 168,
      performanceScore: 87,
      goalsCompleted: 8,
      totalGoals: 10,
      upcomingDeadlines: 3,
      learningProgress: 75
    };

    const data = stats.data || defaultStats;

    return [
      {
        title: 'Attendance Rate',
        value: data.attendanceRate,
        change: 2.1,
        trend: 'up',
        icon: Clock,
        color: 'blue',
        format: 'percentage'
      },
      {
        title: 'Leave Balance',
        value: data.leaveBalance,
        change: -2,
        trend: 'down',
        icon: Calendar,
        color: 'green',
        format: 'number'
      },
      {
        title: 'Hours This Month',
        value: data.hoursWorked,
        change: 5.3,
        trend: 'up',
        icon: TrendingUp,
        color: 'purple',
        format: 'number'
      },
      {
        title: 'Performance Score',
        value: data.performanceScore,
        change: 3.2,
        trend: 'up',
        icon: Award,
        color: 'orange',
        format: 'percentage'
      },
      {
        title: 'Goals Progress',
        value: Math.round((data.goalsCompleted / data.totalGoals) * 100),
        change: 12.5,
        trend: 'up',
        icon: Target,
        color: 'indigo',
        format: 'percentage'
      },
      {
        title: 'Learning Progress',
        value: data.learningProgress,
        change: 8.7,
        trend: 'up',
        icon: BookOpen,
        color: 'red',
        format: 'percentage'
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Hello, {user?.name || 'Employee'}! 🌟
        </h1>
        <p className="text-purple-100">
          Ready to make today productive? Here's your personal dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getStatsCards().map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            color={stat.color}
            format={stat.format}
            isLoading={stats.isLoading}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions actions={employeeActions} userRole="employee" />
        </div>

        {/* Middle Column - Attendance Widget */}
        <div className="lg:col-span-1">
          <AttendanceWidget />
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity 
            activities={recentActivities.data} 
            isLoading={recentActivities.isLoading} 
          />
        </div>
      </div>

      {/* Personal Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Leave Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Annual Leave</div>
                <div className="text-xs text-gray-600">Available days</div>
              </div>
              <span className="text-lg font-bold text-green-600">
                {leaveSummary.data?.annualLeave || 15}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Sick Leave</div>
                <div className="text-xs text-gray-600">Available days</div>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {leaveSummary.data?.sickLeave || 10}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Casual Leave</div>
                <div className="text-xs text-gray-600">Available days</div>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {leaveSummary.data?.casualLeave || 8}
              </span>
            </div>
          </div>
        </div>

        {/* Goals & Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-600" />
            Goals & Performance
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Current Goals</span>
                <span className="text-sm text-orange-600">8/10 Completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: '80%' }}
                ></div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Performance Score</span>
                <span className="text-sm text-blue-600">87%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: '87%' }}
                ></div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Learning Progress</span>
                <span className="text-sm text-green-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events & Reminders */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          Upcoming Events & Reminders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Team Meeting</span>
            </div>
            <div className="text-xs text-gray-600">Tomorrow, 10:00 AM</div>
          </div>
          <div className="p-4 border border-orange-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Goal Review</span>
            </div>
            <div className="text-xs text-gray-600">Friday, 2:00 PM</div>
          </div>
          <div className="p-4 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <BookOpen className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Training Session</span>
            </div>
            <div className="text-xs text-gray-600">Next Monday, 9:00 AM</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
