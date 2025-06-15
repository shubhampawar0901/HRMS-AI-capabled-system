import React, { useEffect, useState } from 'react';
import { useLeave } from '@/hooks/useLeave';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const LeaveBalance = () => {
  const {
    balance,
    isLoading,
    error,
    loadBalance,
    clearError
  } = useLeave();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Generate year options (current year and previous 2 years)
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 3; i++) {
    yearOptions.push(currentYear - i);
  }

  useEffect(() => {
    loadBalance(selectedYear);
  }, [selectedYear, loadBalance]);

  const handleRefresh = () => {
    clearError();
    loadBalance(selectedYear);
  };

  const getBalanceStatus = (item) => {
    const usagePercentage = (item.usedDays / item.allocatedDays) * 100;

    if (usagePercentage >= 90) return { status: 'critical', color: 'red', icon: AlertTriangle };
    if (usagePercentage >= 70) return { status: 'warning', color: 'yellow', icon: Clock };
    if (usagePercentage >= 50) return { status: 'moderate', color: 'blue', icon: TrendingUp };
    return { status: 'good', color: 'green', icon: CheckCircle };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (error) {
    return (
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Leave Balance</h3>
              <p className="text-gray-600 mb-4">{typeof error === 'string' ? error : error?.message || 'An unexpected error occurred'}</p>
              <Button 
                onClick={handleRefresh}
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
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Leave Balance
            </CardTitle>
            
            <div className="flex items-center gap-3">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Loading Leave Balance</h3>
                <p className="text-gray-600">Please wait while we fetch your leave information...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Cards */}
      {!isLoading && balance.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {balance.map((item) => {
            const balanceStatus = getBalanceStatus(item);
            const usagePercentage = (item.usedDays / item.allocatedDays) * 100;
            const StatusIcon = balanceStatus.icon;

            return (
              <Card
                key={item.leaveTypeId}
                className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                        {item.leave_type_name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          balanceStatus.color === 'red' ? 'border-red-200 text-red-700 bg-red-50' :
                          balanceStatus.color === 'yellow' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                          balanceStatus.color === 'blue' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                          'border-green-200 text-green-700 bg-green-50'
                        }`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {balanceStatus.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {item.remainingDays}
                      </div>
                      <div className="text-xs text-gray-500">days left</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage</span>
                      <span className="font-medium text-gray-900">
                        {item.usedDays}/{item.allocatedDays} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ease-out ${getProgressColor(usagePercentage)}`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {usagePercentage.toFixed(1)}% used
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{item.allocatedDays}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{item.usedDays}</div>
                      <div className="text-xs text-gray-500">Used</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{item.remainingDays}</div>
                      <div className="text-xs text-gray-500">Available</div>
                    </div>
                  </div>

                  {/* Warning for low balance */}
                  {item.remainingDays <= 2 && item.remainingDays > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-yellow-800">
                        <span className="font-medium">Low balance:</span> Only {item.remainingDays} day{item.remainingDays === 1 ? '' : 's'} remaining
                      </div>
                    </div>
                  )}

                  {/* No balance warning */}
                  {item.remainingDays === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-red-800">
                        <span className="font-medium">No balance:</span> You have used all available days for this leave type
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && balance.length === 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Info className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Balance Found</h3>
                <p className="text-gray-600 mb-4">
                  No leave balance information is available for {selectedYear}. 
                  This might be because leave allocations haven't been set up yet.
                </p>
                <Button 
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      {!isLoading && balance.length > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Summary for {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {balance.reduce((sum, item) => sum + item.allocatedDays, 0)}
                </div>
                <div className="text-sm text-blue-700 font-medium">Total Allocated</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {balance.reduce((sum, item) => sum + item.usedDays, 0)}
                </div>
                <div className="text-sm text-orange-700 font-medium">Total Used</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {balance.reduce((sum, item) => sum + item.remainingDays, 0)}
                </div>
                <div className="text-sm text-green-700 font-medium">Total Available</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {balance.length}
                </div>
                <div className="text-sm text-purple-700 font-medium">Leave Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaveBalance;
