import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { useAttendance } from '@/hooks/useAttendance';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  MinusCircle
} from 'lucide-react';

const AttendanceHistory = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const {
    attendanceHistory,
    pagination,
    filters,
    isLoading,
    error,
    loadAttendanceHistory,
    updateFilters,
    filterByDateRange,
    goToPage,
    nextPage,
    prevPage,
    clearErrorMessage,
    calculateWorkHours,
    getAttendanceStatus
  } = useAttendance();

  // Load attendance history on mount
  useEffect(() => {
    loadAttendanceHistory();
  }, [loadAttendanceHistory]);

  const handleDateRangeChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
    
    if (newRange.startDate && newRange.endDate) {
      filterByDateRange(newRange.startDate, newRange.endDate);
    }
  };

  const clearDateRange = () => {
    setDateRange({ startDate: '', endDate: '' });
    updateFilters({ startDate: '', endDate: '', page: 1 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'incomplete':
        return <MinusCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isLateCheckIn = (checkInTime) => {
    if (!checkInTime) return false;
    const checkIn = new Date(checkInTime);
    const expectedTime = new Date(checkIn);
    expectedTime.setHours(9, 0, 0, 0); // 9 AM expected time
    return checkIn > expectedTime;
  };

  const isEarlyCheckOut = (checkOutTime) => {
    if (!checkOutTime) return false;
    const checkOut = new Date(checkOutTime);
    const expectedTime = new Date(checkOut);
    expectedTime.setHours(17, 0, 0, 0); // 5 PM expected time
    return checkOut < expectedTime;
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === pagination.page ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} records
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={pagination.page === 1}
            className="hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {pages}
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={pagination.page === pagination.pages}
            className="hover:bg-gray-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
            <p className="text-gray-600">View your attendance records and work hours</p>
          </div>
        </div>
        <Button variant="outline" className="hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div className="ml-2">
            <p className="text-red-800">{error}</p>
            <Button 
              variant="link" 
              size="sm" 
              onClick={clearErrorMessage}
              className="text-red-600 p-0 h-auto"
            >
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

      {/* Filters */}
      <Card className="hrms-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearDateRange}
                className="w-full hover:bg-gray-50"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading attendance history...</span>
        </div>
      )}

      {/* Attendance Records */}
      {!isLoading && (
        <>
          {attendanceHistory.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-gray-600">
                {dateRange.startDate || dateRange.endDate
                  ? 'Try adjusting your date range filters.'
                  : 'Your attendance records will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceHistory.map((record) => {
                const status = getAttendanceStatus(record);
                const workHours = calculateWorkHours(record.checkInTime, record.checkOutTime);
                const isLate = isLateCheckIn(record.checkInTime);
                const isEarly = isEarlyCheckOut(record.checkOutTime);

                return (
                  <Card key={record.id} className="hrms-card hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {formatDate(record.date)}
                            </div>
                            <Badge className={`${getStatusColor(status)} flex items-center space-x-1 mt-1`}>
                              {getStatusIcon(status)}
                              <span className="capitalize">{status}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                              <span className="text-gray-600">Check In:</span>
                              <div className="font-medium flex items-center space-x-2">
                                <span>{formatTime(record.checkInTime)}</span>
                                {isLate && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Late</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Check Out:</span>
                              <div className="font-medium flex items-center space-x-2">
                                <span>{formatTime(record.checkOutTime)}</span>
                                {isEarly && (
                                  <Badge className="bg-orange-100 text-orange-800 text-xs">Early</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Work Hours</div>
                          <div className="text-lg font-bold text-blue-600">
                            {workHours > 0 ? `${workHours}h` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default AttendanceHistory;
