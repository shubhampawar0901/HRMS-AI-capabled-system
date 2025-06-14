import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useCheckInOut } from '@/hooks/useCheckInOut';
import { useAuth } from '@/hooks/useAuth';
import {
  formatTimeFromBackend,
  calculateWorkDuration,
  isLateCheckIn,
  isEarlyCheckOut
} from '@/utils/dateUtils';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Shield
} from 'lucide-react';

const CheckInOut = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState('');

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    currentTime,
    formatTime,
    formatDate,
    todayAttendance,
    getWorkStatus,
    getWorkDuration,
    getTodaySummary,
    canCheckIn,
    canCheckOut,
    handleCheckIn,
    handleCheckOut,
    isCheckingIn,
    isCheckingOut
  } = useCheckInOut();

  const workStatus = getWorkStatus();
  const workDuration = getWorkDuration();
  const todaySummary = getTodaySummary();

  const handleCheckInClick = async () => {
    const result = await handleCheckIn();
    if (result.success) {
      setMessage('Successfully checked in!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setMessage(result.error || 'Failed to check in');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const handleCheckOutClick = async () => {
    const result = await handleCheckOut();
    if (result.success) {
      setMessage('Successfully checked out!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setMessage(result.error || 'Failed to check out');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'working':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not-started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'working':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'not-started':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };



  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div className="ml-2">
            <p className="text-green-800">{message}</p>
          </div>
        </Alert>
      )}

      {showError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div className="ml-2">
            <p className="text-red-800">{message}</p>
          </div>
        </Alert>
      )}

      {/* Current Time and Date */}
      <Card className="hrms-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {formatDate(currentTime)}
              </h2>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {formatTime(currentTime)}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Badge className={`${getStatusColor(workStatus)} flex items-center space-x-1`}>
                {getStatusIcon(workStatus)}
                <span className="capitalize">{workStatus.replace('-', ' ')}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check In/Out Actions */}
      <Card className="hrms-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Admin Notice */}
          {isAdmin && (
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <div className="text-blue-800 font-medium mb-2">Admin Account</div>
              <div className="text-sm text-blue-600">
                Attendance check-in/check-out is only available for employees.
                As an admin, you can manage attendance through the Team Attendance section.
              </div>
            </div>
          )}


          {/* Work Duration - Only for employees */}
          {!isAdmin && workStatus !== 'not-started' && todayAttendance && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Work Duration</div>
              <div className="text-2xl font-bold text-blue-600">
                {calculateWorkDuration(todayAttendance.checkInTime, todayAttendance.checkOutTime)}
              </div>
              {todayAttendance.totalHours && (
                <div className="text-sm text-gray-600">
                  Total: {todayAttendance.totalHours} hours
                </div>
              )}
            </div>
          )}

          {/* Check In/Out Buttons - Only for employees */}
          {!isAdmin && (
            <div className="space-y-3">
              {canCheckIn() && (
                <Button
                  onClick={handleCheckInClick}
                  disabled={isCheckingIn}
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  size="lg"
                >
                  {isCheckingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Check In
                    </>
                  )}
                </Button>
              )}

              {canCheckOut() && (
                <Button
                  onClick={handleCheckOutClick}
                  disabled={isCheckingOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  size="lg"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking Out...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Check Out
                    </>
                  )}
                </Button>
              )}

              {workStatus === 'completed' && todayAttendance && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-green-800 font-medium">Work completed for today!</div>
                  <div className="text-sm text-green-600">
                    Total work time: {todayAttendance.totalHours} hours
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Today's Summary - Only for employees */}
          {!isAdmin && todayAttendance && (
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-medium text-gray-900">Today's Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {todayAttendance.checkInTime && (
                  <div>
                    <span className="text-gray-600">Check In:</span>
                    <div className="font-medium">
                      {formatTimeFromBackend(todayAttendance.checkInTime)}
                    </div>
                    {isLateCheckIn(todayAttendance.checkInTime) && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Late</Badge>
                    )}
                  </div>
                )}

                {todayAttendance.checkOutTime && (
                  <div>
                    <span className="text-gray-600">Check Out:</span>
                    <div className="font-medium">
                      {formatTimeFromBackend(todayAttendance.checkOutTime)}
                    </div>
                    {isEarlyCheckOut(todayAttendance.checkOutTime) && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs">Early</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInOut;
