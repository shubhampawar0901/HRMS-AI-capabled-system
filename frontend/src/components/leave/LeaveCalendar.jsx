import React, { useEffect, useState } from 'react';
import { useLeave } from '@/hooks/useLeave';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  User,
  Clock,
  Info,
  CalendarDays
} from 'lucide-react';

const LeaveCalendar = () => {
  const { user } = useAuth();
  const {
    calendar,
    isLoading,
    error,
    loadCalendar,
    clearError
  } = useLeave();

  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    const params = {
      year: currentYear,
      month: currentMonth + 1 // API expects 1-based month
    };
    
    loadCalendar(params);
  }, [currentYear, currentMonth, loadCalendar]);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };



  const handleDateJump = (dateString) => {
    if (dateString) {
      const selectedDate = new Date(dateString);
      if (!isNaN(selectedDate.getTime())) {
        setCurrentDate(selectedDate);
      }
    }
  };

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getLeaveForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendar.filter(leave => leave.date === dateString);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Day headers
    dayNames.forEach(day => {
      days.push(
        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
          {day}
        </div>
      );
    });

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2 bg-gray-50"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const leaves = getLeaveForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = date < new Date().setHours(0, 0, 0, 0);

      days.push(
        <div 
          key={day} 
          className={`p-2 min-h-[80px] border border-gray-200 bg-white hover:bg-gray-50 transition-colors ${
            isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          } ${isPast ? 'bg-gray-50' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-900'
          }`}>
            {day}
          </div>
          
          <div className="space-y-1">
            {leaves.slice(0, 2).map((leave, index) => (
              <div
                key={index}
                className={`text-xs px-1 py-0.5 rounded border ${getStatusColor(leave.status)} truncate`}
                title={`${leave.employeeName || 'You'} - ${leave.leaveType} (${leave.status})`}
              >
                {user?.role === 'employee' ? leave.leaveType : (leave.employeeName || leave.leaveType)}
              </div>
            ))}
            
            {leaves.length > 2 && (
              <div className="text-xs text-gray-500 px-1">
                +{leaves.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (error) {
    return (
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Calendar</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => {
                  clearError();
                  loadCalendar({ year: currentYear, month: currentMonth + 1 });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Leave Calendar
              {user?.role !== 'employee' && (
                <Badge variant="outline" className="ml-2 border-white/30 text-white bg-white/10">
                  Team View
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Month and Year Selection */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigateMonth(-1)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-xl font-semibold text-white">
                  {getMonthName(currentDate)}
                </div>

                <Button
                  onClick={() => navigateMonth(1)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* Date Jump Input */}
                <div className="flex items-center gap-2" title="Jump to specific date">
                  <CalendarDays className="h-4 w-4 text-white/70" />
                  <Input
                    type="date"
                    value={formatDateForInput(currentDate)}
                    onChange={(e) => handleDateJump(e.target.value)}
                    className="w-[140px] bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    aria-label="Select date to jump to"
                  />
                </div>

                {/* Today Button */}
                <Button
                  onClick={() => setCurrentDate(new Date())}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  Today
                </Button>

                {/* Refresh */}
                <Button
                  onClick={() => loadCalendar({ year: currentYear, month: currentMonth + 1 })}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Navigation & Legend */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Quick Navigation */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Quick Jump:</span>
              <Button
                onClick={() => setCurrentDate(new Date())}
                variant="outline"
                size="sm"
                className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                This Month
              </Button>
              <Button
                onClick={() => {
                  const nextMonth = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setCurrentDate(nextMonth);
                }}
                variant="outline"
                size="sm"
                className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Next Month
              </Button>
              <Button
                onClick={() => {
                  const lastMonth = new Date();
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  setCurrentDate(lastMonth);
                }}
                variant="outline"
                size="sm"
                className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Last Month
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                <span className="text-sm text-gray-600">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded ring-2 ring-blue-500 bg-blue-50"></div>
                <span className="text-sm text-gray-600">Today</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Loading Calendar</h3>
                <p className="text-gray-600">Please wait while we fetch leave information...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Grid */}
      {!isLoading && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {renderCalendarGrid()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Summary for Current Month */}
      {!isLoading && calendar.length > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-600" />
              {getMonthName(currentDate)} Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {calendar.filter(leave => leave.status === 'approved').length}
                </div>
                <div className="text-sm text-green-700 font-medium">Approved</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {calendar.filter(leave => leave.status === 'pending').length}
                </div>
                <div className="text-sm text-yellow-700 font-medium">Pending</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {calendar.filter(leave => leave.status === 'rejected').length}
                </div>
                <div className="text-sm text-red-700 font-medium">Rejected</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {calendar.length}
                </div>
                <div className="text-sm text-blue-700 font-medium">Total Entries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && calendar.length === 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Data</h3>
                <p className="text-gray-600">
                  No leave applications found for {getMonthName(currentDate)}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaveCalendar;
