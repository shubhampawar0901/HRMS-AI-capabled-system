import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Download, RefreshCw, Calendar, Clock, Users } from 'lucide-react';

const AttendanceReportComponent = () => {
  const { user } = useAuth();
  const {
    attendanceReport,
    loading,
    errors,
    reportFilters,
    fetchAttendanceReport,
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
      await fetchAttendanceReport(reportFilters);
    } catch (error) {
      console.error('Error generating attendance report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { variant: 'default', className: 'bg-green-100 text-green-800' },
      absent: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      late: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      'half-day': { variant: 'outline', className: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status] || statusConfig.present;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const calculateAttendanceRate = (presentDays, totalDays) => {
    if (!totalDays) return 0;
    return Math.round((presentDays / totalDays) * 100);
  };

  const renderEmployeeReport = () => {
    if (!attendanceReport || !Array.isArray(attendanceReport)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No attendance data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceReport.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {record.check_in_time ? 
                      new Date(`2024-01-01T${record.check_in_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    {record.check_out_time ? 
                      new Date(`2024-01-01T${record.check_out_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>{record.total_hours || '0'} hrs</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {record.notes || '-'}
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
    if (!attendanceReport || !Array.isArray(attendanceReport)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No attendance data available</p>
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
                <TableHead>Total Days</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Avg Hours</TableHead>
                <TableHead>Attendance Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceReport.map((employee, index) => {
                const attendanceRate = calculateAttendanceRate(employee.present_days, employee.total_days);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{employee.employee_name}</div>
                        <div className="text-xs text-gray-500">{employee.employee_code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department_name || '-'}</TableCell>
                    <TableCell>{employee.total_days || 0}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {employee.present_days || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        {employee.absent_days || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {employee.late_days || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.avg_hours || 0} hrs</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              attendanceRate >= 90 ? 'bg-green-500' :
                              attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{attendanceRate}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (!attendanceReport || !Array.isArray(attendanceReport)) return null;

    let summaryData = {};

    if (user?.role === 'employee') {
      // For employee view, calculate personal summary
      const totalRecords = attendanceReport.length;
      const presentDays = attendanceReport.filter(r => r.status === 'present').length;
      const absentDays = attendanceReport.filter(r => r.status === 'absent').length;
      const lateDays = attendanceReport.filter(r => r.status === 'late').length;
      const totalHours = attendanceReport.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0);

      summaryData = {
        totalDays: totalRecords,
        presentDays,
        absentDays,
        lateDays,
        avgHours: totalRecords > 0 ? (totalHours / totalRecords).toFixed(1) : 0,
        attendanceRate: calculateAttendanceRate(presentDays, totalRecords)
      };
    } else {
      // For admin/manager view, calculate team summary
      const totalEmployees = attendanceReport.length;
      const totalDays = attendanceReport.reduce((sum, emp) => sum + (emp.total_days || 0), 0);
      const totalPresent = attendanceReport.reduce((sum, emp) => sum + (emp.present_days || 0), 0);
      const totalAbsent = attendanceReport.reduce((sum, emp) => sum + (emp.absent_days || 0), 0);
      const totalLate = attendanceReport.reduce((sum, emp) => sum + (emp.late_days || 0), 0);
      const avgHours = attendanceReport.reduce((sum, emp) => sum + (parseFloat(emp.avg_hours) || 0), 0) / totalEmployees;

      summaryData = {
        totalEmployees,
        totalDays,
        presentDays: totalPresent,
        absentDays: totalAbsent,
        lateDays: totalLate,
        avgHours: avgHours.toFixed(1),
        attendanceRate: calculateAttendanceRate(totalPresent, totalDays)
      };
    }

    const cards = user?.role === 'employee' ? [
      { title: 'Total Days', value: summaryData.totalDays, icon: Calendar },
      { title: 'Present Days', value: summaryData.presentDays, icon: Users, color: 'text-green-600' },
      { title: 'Average Hours', value: `${summaryData.avgHours}h`, icon: Clock },
      { title: 'Attendance Rate', value: `${summaryData.attendanceRate}%`, icon: Users, color: summaryData.attendanceRate >= 90 ? 'text-green-600' : 'text-yellow-600' }
    ] : [
      { title: 'Total Employees', value: summaryData.totalEmployees, icon: Users },
      { title: 'Present Days', value: summaryData.presentDays, icon: Users, color: 'text-green-600' },
      { title: 'Absent Days', value: summaryData.absentDays, icon: Users, color: 'text-red-600' },
      { title: 'Team Attendance Rate', value: `${summaryData.attendanceRate}%`, icon: Users, color: summaryData.attendanceRate >= 90 ? 'text-green-600' : 'text-yellow-600' }
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
            📊 Attendance Report
          </h2>
          <p className="text-gray-600">
            {user?.role === 'employee' ? 'Your attendance records' : 'Team attendance overview'}
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
      {errors.attendance && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.attendance}
            <Button
              variant="link"
              size="sm"
              onClick={() => clearError('attendance')}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading.attendance && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Generating attendance report...</span>
        </div>
      )}

      {/* Report Content */}
      {!loading.attendance && attendanceReport && (
        <>
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Report Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {user?.role === 'employee' ? 'Attendance Records' : 'Team Attendance Summary'}
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

export default AttendanceReportComponent;
