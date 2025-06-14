import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Download, RefreshCw, Calendar, Users, Clock } from 'lucide-react';

const LeaveReportComponent = () => {
  const { user } = useAuth();
  const {
    leaveReport,
    loading,
    errors,
    reportFilters,
    fetchLeaveReport,
    clearError
  } = useReports();

  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-generate report when component mounts or filters change
  useEffect(() => {
    generateReport();
  }, [reportFilters]);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // For leave reports, we typically use year instead of date range
      const params = {
        ...reportFilters,
        year: reportFilters.year || new Date().getFullYear()
      };
      await fetchLeaveReport(params);
    } catch (error) {
      console.error('Error generating leave report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { variant: 'default', className: 'bg-green-100 text-green-800' },
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      rejected: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      cancelled: { variant: 'outline', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const renderEmployeeReport = () => {
    if (!leaveReport || !Array.isArray(leaveReport)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No leave data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveReport.map((leave, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{leave.leave_type}</TableCell>
                  <TableCell>{new Date(leave.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{leave.total_days} days</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  <TableCell>{new Date(leave.applied_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                    {leave.reason || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderTeamReport = () => {
    if (!leaveReport || !Array.isArray(leaveReport)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No leave data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Total Applications</TableHead>
                <TableHead>Approved Days</TableHead>
                <TableHead>Pending Days</TableHead>
                <TableHead>Rejected Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveReport.map((employee, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{employee.employee_name}</div>
                      <div className="text-xs text-gray-500">{employee.employee_code}</div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department_name || '-'}</TableCell>
                  <TableCell>{employee.leave_type || 'All Types'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.total_applications || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {employee.approved_days || 0} days
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {employee.pending_days || 0} days
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      {employee.rejected_days || 0} days
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (!leaveReport || !Array.isArray(leaveReport)) return null;

    let summaryData = {};

    if (user?.role === 'employee') {
      // For employee view, calculate personal summary
      const totalApplications = leaveReport.length;
      const approvedLeaves = leaveReport.filter(l => l.status === 'approved');
      const pendingLeaves = leaveReport.filter(l => l.status === 'pending');
      const rejectedLeaves = leaveReport.filter(l => l.status === 'rejected');
      const totalDaysTaken = approvedLeaves.reduce((sum, l) => sum + (l.total_days || 0), 0);

      summaryData = {
        totalApplications,
        approvedCount: approvedLeaves.length,
        pendingCount: pendingLeaves.length,
        rejectedCount: rejectedLeaves.length,
        totalDaysTaken
      };
    } else {
      // For admin/manager view, calculate team summary
      const totalEmployees = leaveReport.length;
      const totalApplications = leaveReport.reduce((sum, emp) => sum + (emp.total_applications || 0), 0);
      const totalApprovedDays = leaveReport.reduce((sum, emp) => sum + (emp.approved_days || 0), 0);
      const totalPendingDays = leaveReport.reduce((sum, emp) => sum + (emp.pending_days || 0), 0);
      const totalRejectedDays = leaveReport.reduce((sum, emp) => sum + (emp.rejected_days || 0), 0);

      summaryData = {
        totalEmployees,
        totalApplications,
        totalApprovedDays,
        totalPendingDays,
        totalRejectedDays
      };
    }

    const cards = user?.role === 'employee' ? [
      { title: 'Total Applications', value: summaryData.totalApplications, icon: Calendar },
      { title: 'Approved', value: summaryData.approvedCount, icon: Users, color: 'text-green-600' },
      { title: 'Pending', value: summaryData.pendingCount, icon: Clock, color: 'text-yellow-600' },
      { title: 'Days Taken', value: summaryData.totalDaysTaken, icon: Calendar, color: 'text-blue-600' }
    ] : [
      { title: 'Team Members', value: summaryData.totalEmployees, icon: Users },
      { title: 'Total Applications', value: summaryData.totalApplications, icon: Calendar },
      { title: 'Approved Days', value: summaryData.totalApprovedDays, icon: Users, color: 'text-green-600' },
      { title: 'Pending Days', value: summaryData.totalPendingDays, icon: Clock, color: 'text-yellow-600' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color || 'text-gray-900'}`}>
                      {card.value}
                    </p>
                  </div>
                  <IconComponent className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🏖️ Leave Report
          </h2>
          <p className="text-gray-600">
            {user?.role === 'employee' ? 'Your leave applications and history' : 'Team leave overview and statistics'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errors.leave && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.leave}
            <Button
              variant="link"
              size="sm"
              onClick={() => clearError('leave')}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading.leave && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Generating leave report...</span>
        </div>
      )}

      {/* Report Content */}
      {!loading.leave && leaveReport && (
        <>
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Report Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {user?.role === 'employee' ? 'Leave Applications' : 'Team Leave Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.role === 'employee' ? renderEmployeeReport() : renderTeamReport()}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default LeaveReportComponent;
