import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAttendance } from '@/hooks/useAttendance';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Loader2,
  Users,
  Building
} from 'lucide-react';

const AttendanceStats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    attendanceStats,
    isLoading,
    loadAttendanceStats
  } = useAttendance();

  useEffect(() => {
    loadAttendanceStats({ period: selectedPeriod });
  }, [selectedPeriod, loadAttendanceStats]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const formatPercentage = (value) => {
    return `${Math.round(value || 0)}%`;
  };

  const formatHours = (hours) => {
    return `${Math.round((hours || 0) * 100) / 100}h`;
  };

  const getAttendanceRating = (percentage) => {
    if (percentage >= 95) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (percentage >= 85) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 75) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading attendance statistics...</span>
      </div>
    );
  }

  const stats = attendanceStats || {};
  const attendanceRating = getAttendanceRating(stats.attendancePercentage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {isAdmin ? (
            <Building className="h-8 w-8 text-blue-600" />
          ) : (
            <BarChart3 className="h-8 w-8 text-blue-600" />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? 'Organization Attendance Statistics' : 'Attendance Statistics'}
            </h1>
            <p className="text-gray-600">
              {isAdmin
                ? 'System-wide attendance insights and analytics'
                : 'Track your attendance performance and trends'
              }
            </p>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex space-x-2">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* First Card - Different for Admin vs Employee */}
        <Card className="hrms-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {isAdmin ? (
                  <>
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalEmployees || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats.activeEmployees || 0} active
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(stats.attendancePercentage)}
                    </p>
                    <Badge className={attendanceRating.color}>
                      {attendanceRating.label}
                    </Badge>
                  </>
                )}
              </div>
              {isAdmin ? (
                <Users className="h-8 w-8 text-blue-500" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Second Card - Present Days / Overall Attendance */}
        <Card className="hrms-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {isAdmin ? (
                  <>
                    <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(stats.attendancePercentage)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats.presentDays || 0} total present days
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-600">Present Days</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.presentDays || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      out of {stats.totalWorkingDays || 0} days
                    </p>
                  </>
                )}
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Third Card - Work Hours */}
        <Card className="hrms-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? 'Total Work Hours' : 'Total Hours'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatHours(stats.totalWorkHours)}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin
                    ? `Avg: ${formatHours(stats.averageWorkHours)} per employee`
                    : `Avg: ${formatHours(stats.averageWorkHours)} per day`
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Fourth Card - Late Days / Issues */}
        <Card className="hrms-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? 'Total Late Days' : 'Late Days'}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.lateDays || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin
                    ? `${stats.absentDays || 0} total absent days`
                    : `${formatPercentage((stats.lateDays || 0) / (stats.presentDays || 1) * 100)} of present days`
                  }
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <Card className="hrms-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              {isAdmin ? 'Organization Attendance Breakdown' : 'Attendance Breakdown'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {isAdmin ? 'Total Present Days' : 'Present Days'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats.presentDays || 0}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({formatPercentage(stats.attendancePercentage)})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">
                    {isAdmin ? 'Total Absent Days' : 'Absent Days'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats.absentDays || 0}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({formatPercentage(100 - (stats.attendancePercentage || 0))})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">
                    {isAdmin ? 'Total Late Arrivals' : 'Late Arrivals'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats.lateDays || 0}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({formatPercentage((stats.lateDays || 0) / (stats.totalWorkingDays || 1) * 100)})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Early Departures</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats.earlyDepartures || 0}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({formatPercentage((stats.earlyDepartures || 0) / (stats.totalWorkingDays || 1) * 100)})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Hours Analysis */}
        <Card className="hrms-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              {isAdmin ? 'Organization Work Hours Analysis' : 'Work Hours Analysis'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {isAdmin ? 'Total Organization Hours' : 'Total Work Hours'}
                </span>
                <span className="font-medium">{formatHours(stats.totalWorkHours)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {isAdmin ? 'Average Hours per Employee' : 'Average Daily Hours'}
                </span>
                <span className="font-medium">{formatHours(stats.averageWorkHours)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {isAdmin ? 'Total Expected Hours' : 'Expected Hours'}
                </span>
                <span className="font-medium">{formatHours(stats.expectedWorkHours)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {isAdmin ? 'Total Overtime Hours' : 'Overtime Hours'}
                </span>
                <span className="font-medium text-blue-600">{formatHours(stats.overtimeHours)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {isAdmin ? 'Total Undertime Hours' : 'Undertime Hours'}
                </span>
                <span className="font-medium text-red-600">{formatHours(stats.undertimeHours)}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Hours Completion</span>
                <span className="text-sm font-medium">
                  {formatPercentage((stats.totalWorkHours || 0) / (stats.expectedWorkHours || 1) * 100)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (stats.totalWorkHours || 0) / (stats.expectedWorkHours || 1) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin-specific Organization Insights */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Performance Overview */}
          <Card className="hrms-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Employee Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Employees</span>
                  <span className="font-medium text-green-600">{stats.activeEmployees || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Employees</span>
                  <span className="font-medium">{stats.totalEmployees || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Attendance Rate</span>
                  <span className="font-medium text-blue-600">
                    {formatPercentage(stats.attendancePercentage)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Working Days</span>
                  <span className="font-medium">{stats.totalWorkingDays || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Metrics */}
          <Card className="hrms-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                Organization Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Productivity Rate</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage((stats.totalWorkHours || 0) / (stats.expectedWorkHours || 1) * 100)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Punctuality Rate</span>
                  <span className="font-medium text-blue-600">
                    {formatPercentage(100 - ((stats.lateDays || 0) / (stats.totalWorkingDays || 1) * 100))}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Attendance Compliance</span>
                  <span className="font-medium text-purple-600">
                    {formatPercentage(stats.attendancePercentage)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Period</span>
                  <span className="font-medium capitalize">{stats.period || 'month'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Trends - Only for employees */}
      {!isAdmin && stats.weeklyTrend && (
        <Card className="hrms-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {stats.weeklyTrend.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-600 mb-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </div>
                  <div className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                    day.status === 'present' ? 'bg-green-100 text-green-800' :
                    day.status === 'absent' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {day.status === 'present' ? '✓' : day.status === 'absent' ? '✗' : '-'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {day.hours ? formatHours(day.hours) : '-'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceStats;
