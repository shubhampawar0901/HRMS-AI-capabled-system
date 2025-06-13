import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Brain
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

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, recentActivities, quickActions, teamOverview } = useSelector(state => state.dashboard);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // Fetch all dashboard data
    dispatch(fetchDashboardStats('admin'));
    dispatch(fetchRecentActivities(10));
    dispatch(fetchQuickActions('admin'));
    dispatch(fetchTeamOverview());
  }, [dispatch]);

  const adminActions = [
    {
      id: 'add-employee',
      title: 'Add Employee',
      description: 'Onboard new team member',
      icon: Users,
      color: 'blue',
      path: '/employees/add'
    },
    {
      id: 'generate-reports',
      title: 'Generate Reports',
      description: 'Create analytics reports',
      icon: BarChart3,
      color: 'green',
      path: '/reports'
    },
    {
      id: 'ai-insights',
      title: 'AI Insights',
      description: 'View AI-powered analytics',
      icon: Brain,
      color: 'purple',
      path: '/ai-features'
    },
    {
      id: 'manage-payroll',
      title: 'Manage Payroll',
      description: 'Process employee payments',
      icon: DollarSign,
      color: 'orange',
      path: '/payroll'
    },
    {
      id: 'leave-approvals',
      title: 'Leave Approvals',
      description: 'Review pending requests',
      icon: Calendar,
      color: 'indigo',
      path: '/leave/approvals'
    },
    {
      id: 'system-alerts',
      title: 'System Alerts',
      description: 'Monitor system health',
      icon: AlertTriangle,
      color: 'red',
      path: '/alerts'
    }
  ];

  const getStatsCards = () => {
    const defaultStats = {
      totalEmployees: 150,
      activeEmployees: 142,
      presentToday: 128,
      onLeave: 8,
      pendingApprovals: 12,
      monthlyPayroll: 2500000,
      avgPerformance: 85,
      systemAlerts: 3
    };

    const data = stats.data || defaultStats;

    return [
      {
        title: 'Total Employees',
        value: data.totalEmployees,
        change: 5.2,
        trend: 'up',
        icon: Users,
        color: 'blue',
        format: 'number'
      },
      {
        title: 'Present Today',
        value: data.presentToday,
        change: 2.1,
        trend: 'up',
        icon: Clock,
        color: 'green',
        format: 'number'
      },
      {
        title: 'On Leave',
        value: data.onLeave,
        change: -1.5,
        trend: 'down',
        icon: Calendar,
        color: 'orange',
        format: 'number'
      },
      {
        title: 'Monthly Payroll',
        value: data.monthlyPayroll,
        change: 3.8,
        trend: 'up',
        icon: DollarSign,
        color: 'purple',
        format: 'currency'
      },
      {
        title: 'Avg Performance',
        value: data.avgPerformance,
        change: 2.3,
        trend: 'up',
        icon: TrendingUp,
        color: 'indigo',
        format: 'percentage'
      },
      {
        title: 'Pending Approvals',
        value: data.pendingApprovals,
        change: null,
        trend: 'neutral',
        icon: AlertTriangle,
        color: 'red',
        format: 'number'
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name || 'Admin'}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening in your organization today.
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
          <QuickActions actions={adminActions} userRole="admin" />
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

      {/* Team Overview Section */}
      {teamOverview.data && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Team Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {teamOverview.data.departments || 8}
              </div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {teamOverview.data.managers || 15}
              </div>
              <div className="text-sm text-gray-600">Managers</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {teamOverview.data.newHires || 5}
              </div>
              <div className="text-sm text-gray-600">New Hires (This Month)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {teamOverview.data.openPositions || 3}
              </div>
              <div className="text-sm text-gray-600">Open Positions</div>
            </div>
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          System Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Server Status</div>
              <div className="font-semibold text-green-600">Online</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Database</div>
              <div className="font-semibold text-blue-600">Healthy</div>
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Backup Status</div>
              <div className="font-semibold text-yellow-600">Scheduled</div>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
