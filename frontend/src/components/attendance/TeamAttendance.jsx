import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { useAttendance } from '@/hooks/useAttendance';
import { 
  Users, 
  Calendar, 
  Clock, 
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  MinusCircle,
  Eye
} from 'lucide-react';

const TeamAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');

  const {
    teamAttendance,
    pagination,
    isLoading,
    error,
    loadTeamAttendance,
    updateFilters,
    goToPage,
    nextPage,
    prevPage,
    clearErrorMessage,
    calculateWorkHours,
    getAttendanceStatus
  } = useAttendance();

  useEffect(() => {
    loadTeamAttendance({ date: selectedDate });
  }, [selectedDate, loadTeamAttendance]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    // In a real app, this would filter the results
    // For now, we'll just update the local state
  };

  const filteredAttendance = teamAttendance.filter(record =>
    record.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getInitials = (name) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || 'N/A';
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

  const getTeamStats = () => {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(record => 
      getAttendanceStatus(record) === 'present'
    ).length;
    const absent = filteredAttendance.filter(record => 
      getAttendanceStatus(record) === 'absent'
    ).length;
    const incomplete = filteredAttendance.filter(record => 
      getAttendanceStatus(record) === 'incomplete'
    ).length;
    const late = filteredAttendance.filter(record => 
      isLateCheckIn(record.checkInTime)
    ).length;

    return { total, present, absent, incomplete, late };
  };

  const stats = getTeamStats();

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
          Showing {filteredAttendance.length} of {stats.total} team members
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
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Attendance</h1>
            <p className="text-gray-600">Monitor your team's attendance and work hours</p>
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

      {/* Controls */}
      <Card className="hrms-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full md:w-auto"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employee
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name or employee ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="hrms-card">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="hrms-card">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <div className="text-sm text-gray-600">Present</div>
          </CardContent>
        </Card>
        <Card className="hrms-card">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </CardContent>
        </Card>
        <Card className="hrms-card">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.incomplete}</div>
            <div className="text-sm text-gray-600">Incomplete</div>
          </CardContent>
        </Card>
        <Card className="hrms-card">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.late}</div>
            <div className="text-sm text-gray-600">Late</div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading team attendance...</span>
        </div>
      )}

      {/* Team Attendance List */}
      {!isLoading && (
        <>
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'No team members found for the selected date.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAttendance.map((record) => {
                const status = getAttendanceStatus(record);
                const workHours = calculateWorkHours(record.checkInTime, record.checkOutTime);
                const isLate = isLateCheckIn(record.checkInTime);
                const isEarly = isEarlyCheckOut(record.checkOutTime);

                return (
                  <Card key={record.employeeId} className="hrms-card hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {getInitials(record.employeeName)}
                          </Avatar>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900">{record.employeeName}</h3>
                            <p className="text-sm text-gray-600">{record.position}</p>
                            <p className="text-xs text-gray-500">ID: {record.employeeCode}</p>
                          </div>
                          
                          <Badge className={`${getStatusColor(status)} flex items-center space-x-1`}>
                            {getStatusIcon(status)}
                            <span className="capitalize">{status}</span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Check In</div>
                            <div className="font-medium flex items-center space-x-2">
                              <span>{formatTime(record.checkInTime)}</span>
                              {isLate && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Late</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Check Out</div>
                            <div className="font-medium flex items-center space-x-2">
                              <span>{formatTime(record.checkOutTime)}</span>
                              {isEarly && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs">Early</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Work Hours</div>
                            <div className="font-bold text-blue-600">
                              {workHours > 0 ? `${workHours}h` : 'N/A'}
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm" className="hover:bg-gray-50">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
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

export default TeamAttendance;
