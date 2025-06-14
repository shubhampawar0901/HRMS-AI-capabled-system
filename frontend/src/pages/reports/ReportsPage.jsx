import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/hooks/useAuth';
import AttendanceReportComponent from '@/components/reports/AttendanceReportComponent';
import LeaveReportComponent from '@/components/reports/LeaveReportComponent';
import PayrollReportComponent from '@/components/reports/PayrollReportComponent';
import PerformanceReportComponent from '@/components/reports/PerformanceReportComponent';
import SmartReportsComponent from '@/components/reports/SmartReportsComponent';
import AnalyticsComponent from '@/components/reports/AnalyticsComponent';
import ReportFilters from '@/components/reports/ReportFilters';

const ReportsPage = () => {
  const { user } = useAuth();
  const {
    availableReports,
    selectedReportType,
    setSelectedReportType,
    fetchAnalytics,
    analytics,
    loading
  } = useReports();

  const [activeTab, setActiveTab] = useState('overview');

  // Load analytics on component mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Set default report type based on available reports
  useEffect(() => {
    if (availableReports.length > 0 && !selectedReportType) {
      setSelectedReportType(availableReports[0].id);
    }
  }, [availableReports, selectedReportType, setSelectedReportType]);

  const renderReportCard = (report) => (
    <Card
      key={report.id}
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-blue-200"
      onClick={() => {
        setSelectedReportType(report.id);
        setActiveTab('reports');
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="text-3xl">{report.icon}</div>
          <Badge variant="outline" className="text-xs">
            {user?.role === 'admin' ? 'Admin' :
             user?.role === 'manager' ? 'Manager' : 'Employee'}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold text-gray-800">
          {report.name}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {report.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full transition-colors duration-200 hover:bg-blue-50"
        >
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );

  const renderAnalyticsCards = () => {
    if (!analytics) return null;

    const cards = [];

    if (user?.role === 'admin') {
      cards.push(
        { title: 'Total Employees', value: analytics.totalEmployees, icon: '👥' },
        { title: 'Total Departments', value: analytics.totalDepartments, icon: '🏢' },
        { title: 'Today\'s Attendance', value: analytics.todayAttendance, icon: '📊' },
        { title: 'Pending Leaves', value: analytics.pendingLeaves, icon: '📋' }
      );
    } else if (user?.role === 'manager') {
      cards.push(
        { title: 'Team Size', value: analytics.teamSize, icon: '👥' },
        { title: 'Team Attendance Today', value: analytics.teamAttendanceToday, icon: '📊' },
        { title: 'Pending Leaves', value: analytics.pendingLeaves, icon: '📋' }
      );
    } else {
      cards.push(
        { title: 'This Month Attendance', value: analytics.thisMonthAttendance, icon: '📊' },
        { title: 'Leave Balance', value: analytics.leaveBalance, icon: '🏖️' }
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card key={index} className="transition-all duration-300 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className="text-3xl">{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderReportContent = () => {
    switch (selectedReportType) {
      case 'attendance':
        return <AttendanceReportComponent />;
      case 'leave':
        return <LeaveReportComponent />;
      case 'payroll':
        return <PayrollReportComponent />;
      case 'performance':
        return <PerformanceReportComponent />;
      case 'smart':
        return <SmartReportsComponent />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a report type to view details</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive HR reports and view analytics
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} View
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          {loading.analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            renderAnalyticsCards()
          )}

          {/* Available Reports */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableReports.map(renderReportCard)}
            </div>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Report Filters */}
            <div className="lg:w-1/4">
              <ReportFilters />
            </div>

            {/* Report Content */}
            <div className="lg:w-3/4">
              {renderReportContent()}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
