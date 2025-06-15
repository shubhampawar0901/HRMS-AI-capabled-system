import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Star, 
  Target, 
  TrendingUp,
  Award,
  Calendar,
  Search,
  Filter,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePerformance from '@/hooks/usePerformance';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const TeamPerformance = () => {
  const { user, isManager } = useAuth();
  const {
    teamPerformance,
    loading,
    error,
    updateFilters
  } = usePerformance();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    updateFilters({ search: value });
  };

  // Handle department filter
  const handleDepartmentFilter = (value) => {
    setDepartmentFilter(value);
    updateFilters({ departmentId: value === 'all' ? null : value });
  };

  // Handle performance filter
  const handlePerformanceFilter = (value) => {
    setPerformanceFilter(value);
    updateFilters({ performanceLevel: value === 'all' ? null : value });
  };

  // Get performance level badge
  const getPerformanceBadge = (rating) => {
    if (rating >= 4.5) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Exceptional</Badge>;
    } else if (rating >= 4.0) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Exceeds</Badge>;
    } else if (rating >= 3.5) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Meets</Badge>;
    } else if (rating >= 3.0) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Partial</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Below</Badge>;
    }
  };

  // Get rating stars
  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  // Calculate team statistics
  const teamStats = React.useMemo(() => {
    if (!teamPerformance?.length) return null;

    const totalMembers = teamPerformance.length;
    const averageRating = teamPerformance.reduce((sum, member) => sum + (member.overallRating || 0), 0) / totalMembers;
    const highPerformers = teamPerformance.filter(member => member.overallRating >= 4.0).length;
    const totalGoalsCompleted = teamPerformance.reduce((sum, member) => sum + (member.goalsCompleted || 0), 0);
    const totalGoals = teamPerformance.reduce((sum, member) => sum + (member.totalGoals || 0), 0);
    const goalCompletionRate = totalGoals > 0 ? (totalGoalsCompleted / totalGoals * 100).toFixed(1) : 0;

    return {
      totalMembers,
      averageRating: averageRating.toFixed(1),
      highPerformers,
      goalCompletionRate
    };
  }, [teamPerformance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="lg" text="Loading team performance..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error Loading Team Performance</div>
            <p className="text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Performance</h2>
          <p className="text-gray-600">
            Monitor and manage your team's performance metrics and goals
          </p>
        </div>
      </div>

      {/* Team Statistics */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Team Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{teamStats.totalMembers}</div>
              <p className="text-xs text-blue-600 mt-1">Active members</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{teamStats.averageRating}</div>
              <p className="text-xs text-green-600 mt-1">Team average</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">High Performers</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{teamStats.highPerformers}</div>
              <p className="text-xs text-purple-600 mt-1">Rating ≥ 4.0</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Goal Completion</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{teamStats.goalCompletionRate}%</div>
              <p className="text-xs text-orange-600 mt-1">Team goals</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={handleDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
              </SelectContent>
            </Select>
            <Select value={performanceFilter} onValueChange={handlePerformanceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance Levels</SelectItem>
                <SelectItem value="exceptional">Exceptional (4.5+)</SelectItem>
                <SelectItem value="exceeds">Exceeds (4.0+)</SelectItem>
                <SelectItem value="meets">Meets (3.5+)</SelectItem>
                <SelectItem value="below">Below (3.0-)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <div className="grid grid-cols-1 gap-4">
        {teamPerformance?.length > 0 ? (
          teamPerformance.map((member) => (
            <Card
              key={member.employeeId}
              className="shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-gray-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {member.employeeName?.split(' ').map(n => n[0]).join('') || 'EM'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.employeeName || 'Employee Name'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {member.position || 'Position'} • {member.department || 'Department'}
                        </p>
                      </div>
                      {member.overallRating && getPerformanceBadge(member.overallRating)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="flex items-center gap-1">
                            {member.overallRating && getRatingStars(member.overallRating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {member.overallRating?.toFixed(1) || 'N/A'}/5.0
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Goals: {member.goalsCompleted || 0}/{member.totalGoals || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Last Review: {member.lastReviewDate ? new Date(member.lastReviewDate).toLocaleDateString() : 'None'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Progress: {member.goalCompletionRate || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members Found</h3>
                <p className="text-gray-600">
                  {isManager 
                    ? "No team members are currently assigned to you or match the current filters."
                    : "No team performance data available."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeamPerformance;
