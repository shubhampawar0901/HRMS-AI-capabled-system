import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  Loader2, 
  RefreshCw, 
  Users, 
  Building, 
  Calendar, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart
} from 'lucide-react';

const AnalyticsComponent = () => {
  const { user } = useAuth();
  const {
    analytics,
    loading,
    errors,
    fetchAnalytics,
    clearError
  } = useReports();

  // Auto-load analytics when component mounts
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const renderAnalyticsCards = () => {
    if (!analytics) return null;

    let cards = [];
    
    if (user?.role === 'admin') {
      cards = [
        { 
          title: 'Total Employees', 
          value: analytics.totalEmployees, 
          icon: Users,
          description: 'Active employees in system',
          color: 'text-blue-600'
        },
        { 
          title: 'Departments', 
          value: analytics.totalDepartments, 
          icon: Building,
          description: 'Active departments',
          color: 'text-green-600'
        },
        { 
          title: 'Today\'s Attendance', 
          value: analytics.todayAttendance, 
          icon: Calendar,
          description: 'Employees present today',
          color: 'text-purple-600'
        },
        { 
          title: 'Pending Leaves', 
          value: analytics.pendingLeaves, 
          icon: FileText,
          description: 'Awaiting approval',
          color: 'text-yellow-600'
        }
      ];
    } else if (user?.role === 'manager') {
      cards = [
        { 
          title: 'Team Size', 
          value: analytics.teamSize, 
          icon: Users,
          description: 'Direct reports',
          color: 'text-blue-600'
        },
        { 
          title: 'Team Attendance Today', 
          value: analytics.teamAttendanceToday, 
          icon: Calendar,
          description: 'Team members present',
          color: 'text-green-600'
        },
        { 
          title: 'Pending Team Leaves', 
          value: analytics.pendingLeaves, 
          icon: FileText,
          description: 'Awaiting your approval',
          color: 'text-yellow-600'
        }
      ];
    } else {
      cards = [
        { 
          title: 'This Month Attendance', 
          value: analytics.thisMonthAttendance, 
          icon: Calendar,
          description: 'Days attended this month',
          color: 'text-blue-600'
        },
        { 
          title: 'Leave Balance', 
          value: analytics.leaveBalance, 
          icon: FileText,
          description: 'Remaining leave days',
          color: 'text-green-600'
        }
      ];
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-3xl font-bold ${card.color}`}>
                      {card.value}
                    </p>
                  </div>
                  <IconComponent className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderInsightCards = () => {
    if (!analytics) return null;

    const insights = [];

    if (user?.role === 'admin') {
      const attendanceRate = analytics.totalEmployees > 0 ? 
        Math.round((analytics.todayAttendance / analytics.totalEmployees) * 100) : 0;
      
      insights.push(
        {
          title: 'Attendance Rate',
          value: `${attendanceRate}%`,
          trend: attendanceRate >= 90 ? 'up' : attendanceRate >= 75 ? 'stable' : 'down',
          description: 'Today\'s attendance percentage',
          icon: BarChart3
        },
        {
          title: 'Leave Approval Rate',
          value: analytics.pendingLeaves > 0 ? 'Pending' : 'Up to date',
          trend: analytics.pendingLeaves === 0 ? 'up' : 'down',
          description: `${analytics.pendingLeaves} leaves awaiting approval`,
          icon: PieChart
        }
      );
    } else if (user?.role === 'manager') {
      const teamAttendanceRate = analytics.teamSize > 0 ? 
        Math.round((analytics.teamAttendanceToday / analytics.teamSize) * 100) : 0;
      
      insights.push(
        {
          title: 'Team Attendance Rate',
          value: `${teamAttendanceRate}%`,
          trend: teamAttendanceRate >= 90 ? 'up' : teamAttendanceRate >= 75 ? 'stable' : 'down',
          description: 'Today\'s team attendance',
          icon: BarChart3
        },
        {
          title: 'Team Management',
          value: analytics.pendingLeaves > 0 ? 'Action Required' : 'All Clear',
          trend: analytics.pendingLeaves === 0 ? 'up' : 'down',
          description: `${analytics.pendingLeaves} team leaves pending`,
          icon: PieChart
        }
      );
    } else {
      const attendanceProgress = Math.min(100, (analytics.thisMonthAttendance / 22) * 100); // Assuming 22 working days
      
      insights.push(
        {
          title: 'Monthly Progress',
          value: `${Math.round(attendanceProgress)}%`,
          trend: attendanceProgress >= 90 ? 'up' : attendanceProgress >= 75 ? 'stable' : 'down',
          description: 'This month\'s attendance progress',
          icon: BarChart3
        },
        {
          title: 'Leave Status',
          value: analytics.leaveBalance > 10 ? 'Healthy' : analytics.leaveBalance > 5 ? 'Moderate' : 'Low',
          trend: analytics.leaveBalance > 10 ? 'up' : analytics.leaveBalance > 5 ? 'stable' : 'down',
          description: `${analytics.leaveBalance} days remaining`,
          icon: PieChart
        }
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          const TrendIcon = insight.trend === 'up' ? TrendingUp : 
                           insight.trend === 'down' ? TrendingDown : BarChart3;
          const trendColor = insight.trend === 'up' ? 'text-green-500' : 
                            insight.trend === 'down' ? 'text-red-500' : 'text-yellow-500';
          
          return (
            <Card key={index} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{insight.title}</CardTitle>
                  <IconComponent className="h-6 w-6 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">{insight.value}</span>
                  <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderQuickActions = () => {
    const actions = [];

    if (user?.role === 'admin') {
      actions.push(
        { title: 'View All Employees', description: 'Manage employee records', action: () => {} },
        { title: 'Approve Leaves', description: 'Review pending leave requests', action: () => {} },
        { title: 'Generate Reports', description: 'Create comprehensive reports', action: () => {} }
      );
    } else if (user?.role === 'manager') {
      actions.push(
        { title: 'View Team', description: 'Check team attendance and performance', action: () => {} },
        { title: 'Approve Team Leaves', description: 'Review team leave requests', action: () => {} },
        { title: 'Team Reports', description: 'Generate team analytics', action: () => {} }
      );
    } else {
      actions.push(
        { title: 'Check In/Out', description: 'Mark your attendance', action: () => {} },
        { title: 'Apply for Leave', description: 'Submit leave application', action: () => {} },
        { title: 'View Payslips', description: 'Access your payroll information', action: () => {} }
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left justify-start"
                onClick={action.action}
              >
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📈 Analytics Dashboard
          </h2>
          <p className="text-gray-600">
            Real-time insights and key performance indicators
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading.analytics}
          >
            {loading.analytics ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errors.analytics && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.analytics}
            <Button
              variant="link"
              size="sm"
              onClick={() => clearError('analytics')}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading.analytics && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading analytics...</span>
        </div>
      )}

      {/* Analytics Content */}
      {!loading.analytics && analytics && (
        <>
          {/* Main Analytics Cards */}
          {renderAnalyticsCards()}

          {/* Insight Cards */}
          {renderInsightCards()}

          {/* Quick Actions */}
          {renderQuickActions()}
        </>
      )}

      {/* Empty State */}
      {!loading.analytics && !analytics && (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Analytics Data</h3>
            <p className="text-gray-500 mb-4">
              Analytics data is not available at the moment. Please try refreshing.
            </p>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analytics
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsComponent;
