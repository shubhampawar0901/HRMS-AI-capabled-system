import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  BarChart3,
  Shield,
  Activity,
  TrendingDown
} from 'lucide-react';
import useDashboardData from '@/hooks/useDashboardData';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import AIInsightsWidget from './AIInsightsWidget';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuthContext();
  const { dashboardData, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 animate-pulse">
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name || 'Admin'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              System overview and administrative controls at your fingertips.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          color="blue"
          format="number"
          trend="up"
          change={5}
          changeType="percentage"
        />
        <StatsCard
          title="Active Employees Today"
          value={stats.activeEmployees}
          icon={UserCheck}
          color="green"
          format="number"
          trend="up"
          change={2}
          changeType="number"
        />
        <StatsCard
          title="Pending Leave Approvals"
          value={stats.pendingLeaveApprovals}
          icon={Calendar}
          color="orange"
          format="number"
          trend="down"
          change={3}
          changeType="number"
        />
        <StatsCard
          title="AI Alerts"
          value={stats.aiAlerts}
          icon={AlertTriangle}
          color="red"
          format="number"
          trend="stable"
          change={0}
          changeType="number"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <QuickActions actions={quickActions} userRole="admin" />
        </div>

        {/* AI Insights */}
        <div>
          <AIInsightsWidget insights={aiInsights} userRole="admin" />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
          System Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">98.5%</div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">94.2%</div>
            <div className="text-sm text-gray-600">Employee Satisfaction</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <TrendingDown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">2.1%</div>
            <div className="text-sm text-gray-600">Attrition Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
