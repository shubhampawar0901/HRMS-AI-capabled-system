import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target
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
  fetchTeamOverview 
} from '@/store/slices/dashboardSlice';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { stats, recentActivities, quickActions, teamOverview } = useSelector(state => state.dashboard);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // Fetch dashboard data for manager
    dispatch(fetchDashboardStats('manager'));
    dispatch(fetchRecentActivities(8));
    dispatch(fetchQuickActions('manager'));
    dispatch(fetchTeamOverview());
  }, [dispatch]);

  const managerActions = [
    {
      id: 'team-attendance',
      title: 'Team Attendance',
      description: 'View team attendance status',
      icon: Clock,
      color: 'blue',
      path: '/attendance/team'
    },
    {
      id: 'approve-leaves',
      title: 'Approve Leaves',
      description: 'Review pending leave requests',
      icon: Calendar,
      color: 'green',
      path: '/leave/approvals'
    },
    {
      id: 'team-performance',
      title: 'Team Performance',
      description: 'Monitor team performance',
      icon: TrendingUp,
      color: 'purple',
      path: '/performance'
    },
    {
      id: 'generate-reports',
      title: 'Team Reports',
      description: 'Generate team reports',
      icon: BarChart3,
      color: 'orange',
      path: '/reports'
    },
    {
      id: 'set-goals',
      title: 'Set Goals',
      description: 'Define team objectives',
      icon: Target,
      color: 'indigo',
      path: '/performance/goals'
    },
    {
      id: 'review-tasks',
      title: 'Review Tasks',
      description: 'Check task completion',
      icon: CheckCircle,
      color: 'green',
      path: '/tasks'
    }
  ];

  const getStatsCards = () => {
    const defaultStats = {
      teamSize: 12,
      presentToday: 10,
      onLeave: 2,
      pendingApprovals: 5,
      avgPerformance: 88,
      completedTasks: 45,
      overdueTasks: 3,
      teamProductivity: 92
    };

    const data = stats.data || defaultStats;

    return [
      {
        title: 'Team Size',
        value: data.teamSize,
        change: null,
        trend: 'neutral',
        icon: Users,
        color: 'blue',
        format: 'number'
      },
      {
        title: 'Present Today',
        value: data.presentToday,
        change: 8.3,
        trend: 'up',
        icon: Clock,
        color: 'green',
        format: 'number'
      },
      {
        title: 'On Leave',
        value: data.onLeave,
        change: -2.1,
        trend: 'down',
        icon: Calendar,
        color: 'orange',
        format: 'number'
      },
      {
        title: 'Pending Approvals',
        value: data.pendingApprovals,
        change: null,
        trend: 'neutral',
        icon: AlertCircle,
        color: 'red',
        format: 'number'
      },
      {
        title: 'Team Performance',
        value: data.avgPerformance,
        change: 3.2,
        trend: 'up',
        icon: TrendingUp,
        color: 'purple',
        format: 'percentage'
      },
      {
        title: 'Tasks Completed',
        value: data.completedTasks,
        change: 12.5,
        trend: 'up',
        icon: CheckCircle,
        color: 'indigo',
        format: 'number'
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Good day, {user?.name || 'Manager'}! 🎯
        </h1>
        <p className="text-green-100">
          Your team is performing well. Here's today's overview.
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
          <QuickActions actions={managerActions} userRole="manager" />
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

      {/* Team Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Team Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Active Members</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {teamOverview.data?.activeMembers || 10}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">On Leave</span>
              </div>
              <span className="text-sm font-bold text-yellow-600">
                {teamOverview.data?.onLeave || 2}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Remote</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {teamOverview.data?.remote || 3}
              </span>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
            Pending Actions
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Leave Requests</div>
                <div className="text-xs text-gray-600">Awaiting your approval</div>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                {stats.data?.pendingApprovals || 5}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Performance Reviews</div>
                <div className="text-xs text-gray-600">Due this week</div>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                3
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-purple-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Goal Reviews</div>
                <div className="text-xs text-gray-600">Quarterly check-in</div>
              </div>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Productivity Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
          Team Productivity Trends
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">92%</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">88%</div>
            <div className="text-sm text-gray-600">Last Week</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">90%</div>
            <div className="text-sm text-gray-600">Monthly Avg</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">+4%</div>
            <div className="text-sm text-gray-600">Improvement</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
