import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Award,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePerformance from '@/hooks/usePerformance';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const PerformanceAnalytics = () => {
  const { isAdmin } = useAuth();
  const {
    performanceAnalytics,
    loading,
    error,
    fetchPerformanceAnalytics
  } = usePerformance();

  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchPerformanceAnalytics({ period });
  };

  // Handle department change
  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    fetchPerformanceAnalytics({ 
      period: selectedPeriod,
      departmentId: department === 'all' ? null : department 
    });
  };

  // Refresh analytics
  const handleRefresh = () => {
    fetchPerformanceAnalytics({ 
      period: selectedPeriod,
      departmentId: selectedDepartment === 'all' ? null : selectedDepartment 
    });
  };

  // Use only real data from API - no mock data
  const analyticsData = performanceAnalytics;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="lg" text="Loading performance analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error Loading Analytics</div>
            <p className="text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
            <p className="text-gray-600 mb-4">
              Performance analytics data is not available yet. Please check back later.
            </p>
            <Button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
          <p className="text-gray-600">
            Comprehensive performance insights and trends across the organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{analyticsData.overview?.totalEmployees || 0}</div>
            <p className="text-xs text-blue-600 mt-1">Active employees</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Avg Rating</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{analyticsData.overview?.averageRating || 'N/A'}</div>
            <p className="text-xs text-green-600 mt-1">Organization average</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Goal Completion</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analyticsData.overview?.goalCompletionRate || 0}%</div>
            <p className="text-xs text-purple-600 mt-1">Goals achieved</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Reviews Completed</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{analyticsData.overview?.reviewsCompleted || 0}</div>
            <p className="text-xs text-orange-600 mt-1">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Department Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.departmentPerformance?.length > 0 ? (
              analyticsData.departmentPerformance.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{dept.department}</h4>
                    <p className="text-sm text-gray-600">{dept.employees} employees</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{dept.avgRating}</div>
                      <div className="text-xs text-gray-600">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{dept.goalCompletion}%</div>
                      <div className="text-xs text-gray-600">Goals</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No department performance data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.performanceTrends?.length > 0 ? (
                analyticsData.performanceTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{trend.month}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Rating: <span className="font-medium">{trend.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Goals: <span className="font-medium">{trend.goals}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No performance trends data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPerformers?.length > 0 ? (
                analyticsData.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                    <div>
                      <h4 className="font-medium text-gray-900">{performer.name}</h4>
                      <p className="text-sm text-gray-600">{performer.department}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-yellow-800">
                        {performer.rating} ⭐
                      </div>
                      <div className="text-xs text-yellow-700">
                        {performer.goals}% goals
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No top performers data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
