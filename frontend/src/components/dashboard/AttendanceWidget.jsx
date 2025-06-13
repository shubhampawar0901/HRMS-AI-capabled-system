import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, MapPin, Calendar, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchAttendanceWidget } from '@/store/slices/dashboardSlice';
import { formatDate, formatDuration } from '@/utils/dateUtils';

const AttendanceWidget = ({ employeeId }) => {
  const dispatch = useDispatch();
  const { attendanceWidget } = useSelector(state => state.dashboard);
  const { user } = useSelector(state => state.auth);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingTime, setWorkingTime] = useState(0);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Calculate working time if checked in
  useEffect(() => {
    if (attendanceWidget.data?.checkedIn && attendanceWidget.data?.checkInTime) {
      const checkInTime = new Date(attendanceWidget.data.checkInTime);
      const now = new Date();
      const diffMs = now.getTime() - checkInTime.getTime();
      setWorkingTime(Math.floor(diffMs / (1000 * 60))); // Convert to minutes
      
      // Update working time every minute
      const timer = setInterval(() => {
        const newNow = new Date();
        const newDiffMs = newNow.getTime() - checkInTime.getTime();
        setWorkingTime(Math.floor(newDiffMs / (1000 * 60)));
      }, 60000);

      return () => clearInterval(timer);
    }
  }, [attendanceWidget.data]);

  // Fetch attendance data on mount
  useEffect(() => {
    dispatch(fetchAttendanceWidget(employeeId || user?.id));
  }, [dispatch, employeeId, user?.id]);

  const handleCheckIn = async () => {
    // This would typically call an attendance service
    console.log('Check in clicked');
    // Refresh data after check in
    dispatch(fetchAttendanceWidget(employeeId || user?.id));
  };

  const handleCheckOut = async () => {
    // This would typically call an attendance service
    console.log('Check out clicked');
    // Refresh data after check out
    dispatch(fetchAttendanceWidget(employeeId || user?.id));
  };

  const getStatusBadge = () => {
    if (attendanceWidget.isLoading) {
      return <Badge variant="secondary">Loading...</Badge>;
    }

    if (attendanceWidget.data?.checkedIn) {
      return <Badge className="bg-green-100 text-green-800">Checked In</Badge>;
    }

    return <Badge variant="outline">Not Checked In</Badge>;
  };

  const getWorkingHours = () => {
    if (!attendanceWidget.data?.checkedIn || !attendanceWidget.data?.checkInTime) {
      return '0h 0m';
    }

    return formatDuration(workingTime);
  };

  if (attendanceWidget.isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Today's Attendance
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Time */}
        <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {formatDate(currentTime, 'long')}
          </div>
        </div>

        {/* Attendance Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Check In</div>
            <div className="font-semibold text-gray-900">
              {attendanceWidget.data?.checkInTime 
                ? new Date(attendanceWidget.data.checkInTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })
                : '--:--'
              }
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Check Out</div>
            <div className="font-semibold text-gray-900">
              {attendanceWidget.data?.checkOutTime 
                ? new Date(attendanceWidget.data.checkOutTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })
                : '--:--'
              }
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Timer className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-sm text-gray-600">Working Hours</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {getWorkingHours()}
          </div>
        </div>

        {/* Location Info */}
        {attendanceWidget.data?.location && (
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{attendanceWidget.data.location}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {attendanceWidget.data?.checkedIn ? (
            <Button 
              onClick={handleCheckOut}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300"
              disabled={attendanceWidget.isLoading}
            >
              <Clock className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          ) : (
            <Button 
              onClick={handleCheckIn}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300"
              disabled={attendanceWidget.isLoading}
            >
              <Clock className="w-4 h-4 mr-2" />
              Check In
            </Button>
          )}
        </div>

        {/* Weekly Summary */}
        {attendanceWidget.data?.weeklyStats && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">This Week</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">Days</div>
                <div className="font-semibold text-gray-900">
                  {attendanceWidget.data.weeklyStats.daysPresent || 0}/5
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Hours</div>
                <div className="font-semibold text-gray-900">
                  {formatDuration(attendanceWidget.data.weeklyStats.totalMinutes || 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg</div>
                <div className="font-semibold text-gray-900">
                  {formatDuration(attendanceWidget.data.weeklyStats.avgMinutesPerDay || 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceWidget;
