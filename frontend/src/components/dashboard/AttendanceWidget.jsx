import React, { useState } from 'react';
import { Clock, MapPin, Calendar, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDuration } from '@/utils/dateUtils';

const AttendanceWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock attendance data for display
  const mockAttendanceData = {
    checkedIn: false,
    checkInTime: null,
    checkOutTime: null,
    location: 'Office - Main Building',
    weeklyStats: {
      daysPresent: 4,
      totalMinutes: 1920, // 32 hours
      avgMinutesPerDay: 480 // 8 hours
    }
  };

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    console.log('Check in clicked - would call attendance service');
  };

  const handleCheckOut = async () => {
    console.log('Check out clicked - would call attendance service');
  };

  const getStatusBadge = () => {
    if (mockAttendanceData.checkedIn) {
      return <Badge className="bg-green-100 text-green-800">Checked In</Badge>;
    }
    return <Badge variant="outline">Not Checked In</Badge>;
  };

  const getWorkingHours = () => {
    if (!mockAttendanceData.checkedIn || !mockAttendanceData.checkInTime) {
      return '0h 0m';
    }
    return formatDuration(0); // Mock working time
  };

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
              {mockAttendanceData.checkInTime
                ? new Date(mockAttendanceData.checkInTime).toLocaleTimeString('en-US', {
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
              {mockAttendanceData.checkOutTime
                ? new Date(mockAttendanceData.checkOutTime).toLocaleTimeString('en-US', {
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
        {mockAttendanceData.location && (
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{mockAttendanceData.location}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {mockAttendanceData.checkedIn ? (
            <Button
              onClick={handleCheckOut}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300"
            >
              <Clock className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          ) : (
            <Button
              onClick={handleCheckIn}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300"
            >
              <Clock className="w-4 h-4 mr-2" />
              Check In
            </Button>
          )}
        </div>

        {/* Weekly Summary */}
        {mockAttendanceData.weeklyStats && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">This Week</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">Days</div>
                <div className="font-semibold text-gray-900">
                  {mockAttendanceData.weeklyStats.daysPresent || 0}/5
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Hours</div>
                <div className="font-semibold text-gray-900">
                  {formatDuration(mockAttendanceData.weeklyStats.totalMinutes || 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg</div>
                <div className="font-semibold text-gray-900">
                  {formatDuration(mockAttendanceData.weeklyStats.avgMinutesPerDay || 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(AttendanceWidget);
