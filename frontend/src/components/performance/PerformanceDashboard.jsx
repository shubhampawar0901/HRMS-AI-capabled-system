import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  FileText, 
  Users, 
  TrendingUp,
  Star,
  Award,
  BarChart3,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePerformance from '@/hooks/usePerformance';
import ReviewList from './ReviewList';
import GoalsList from './GoalsList';
import TeamPerformance from './TeamPerformance';
import PerformanceAnalytics from './PerformanceAnalytics';
import LoadingSpinner from '@/components/layout/LoadingSpinner';


const PerformanceDashboard = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const {
    performanceReviews,
    goals,
    teamPerformance,
    performanceAnalytics,
    loading,
    error,
    canManagePerformance,
    canViewTeamPerformance
  } = usePerformance();

  const [activeTab, setActiveTab] = useState(() => {
    if (isEmployee) return 'overview';
    if (isManager) return 'team';
    if (isAdmin) return 'analytics';
    return 'overview';
  });

  // Calculate summary stats for employee
  const employeeSummary = React.useMemo(() => {
    // For employees, show summary even if one of the arrays is empty
    const reviews = performanceReviews || [];
    const userGoals = goals || [];

    const completedReviews = reviews.filter(review => review.status === 'completed').length;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.overall_rating || review.overallRating || 0), 0) / reviews.length
      : 0;
    const completedGoals = userGoals.filter(goal => goal.status === 'completed').length;
    const goalCompletionRate = userGoals.length > 0 ? (completedGoals / userGoals.length * 100).toFixed(1) : 0;

    return {
      totalReviews: reviews.length,
      completedReviews,
      averageRating: averageRating.toFixed(1),
      totalGoals: userGoals.length,
      completedGoals,
      goalCompletionRate
    };
  }, [performanceReviews, goals]);

  // Calculate team summary for managers
  const teamSummary = React.useMemo(() => {
    if (!teamPerformance?.length) return null;

    const totalTeamMembers = teamPerformance.length;
    const averageTeamRating = teamPerformance.reduce((sum, member) => sum + (member.overall_rating || member.overallRating || 0), 0) / totalTeamMembers;
    const highPerformers = teamPerformance.filter(member => (member.overall_rating || member.overallRating || 0) >= 4.0).length;
    const totalGoalsCompleted = teamPerformance.reduce((sum, member) => sum + (member.goals_completed || member.goalsCompleted || 0), 0);

    return {
      totalTeamMembers,
      averageTeamRating: averageTeamRating.toFixed(1),
      highPerformers,
      totalGoalsCompleted
    };
  }, [teamPerformance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading performance data..." />
      </div>
    );
  }

  // Check if user needs to refresh authentication (missing employeeId)
  // Disabled for now as admin users don't need employeeId
  const needsAuthRefresh = false;

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error Loading Performance Data</div>
            <p className="text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderEmployeeOverview = () => (
    <div className="space-y-6">
      {/* Personal Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">My Reviews</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {employeeSummary?.totalReviews || 0}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Avg Rating: {employeeSummary?.averageRating !== '0' ? employeeSummary?.averageRating : 'No ratings yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">My Goals</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {employeeSummary?.completedGoals || 0}/{employeeSummary?.totalGoals || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {employeeSummary?.goalCompletionRate || 0}% Complete
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Performance Score</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {employeeSummary?.averageRating !== '0' ? employeeSummary?.averageRating : 'N/A'}
            </div>
            <p className="text-xs text-purple-600 mt-1">My average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
              onClick={() => setActiveTab('reviews')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View My Reviews
            </Button>
            <Button
              variant="outline"
              className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
              onClick={() => setActiveTab('goals')}
            >
              <Target className="h-4 w-4 mr-2" />
              My Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderManagerOverview = () => (
    <div className="space-y-6">
      {/* Team Summary */}
      {teamSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Team Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{teamSummary.totalTeamMembers}</div>
              <p className="text-xs text-blue-600 mt-1">Active members</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Avg Team Rating</CardTitle>
              <Star className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{teamSummary.averageTeamRating}</div>
              <p className="text-xs text-green-600 mt-1">Team performance</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">High Performers</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{teamSummary.highPerformers}</div>
              <p className="text-xs text-purple-600 mt-1">Rating ≥ 4.0</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Goals Completed</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{teamSummary.totalGoalsCompleted}</div>
              <p className="text-xs text-orange-600 mt-1">Team achievements</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manager Actions */}
      <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Manager Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
              onClick={() => setActiveTab('team')}
            >
              <Users className="h-4 w-4 mr-2" />
              View Team Performance
            </Button>
            <Button 
              variant="outline"
              className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
              onClick={() => setActiveTab('reviews')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-1">
            {isEmployee && "View your personal performance reviews and manage your goals"}
            {isManager && "Manage team performance and conduct reviews"}
            {isAdmin && "Oversee organization-wide performance metrics"}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {user?.role?.toUpperCase()} ACCESS
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            {isEmployee ? 'My Reviews' : 'Reviews'}
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            {isEmployee ? 'My Goals' : 'Goals'}
          </TabsTrigger>
          {canViewTeamPerformance && (
            <TabsTrigger 
              value="team"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
            >
              {isAdmin ? 'Analytics' : 'Team'}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isEmployee ? renderEmployeeOverview() : renderManagerOverview()}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <ReviewList />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <GoalsList />
        </TabsContent>

        {canViewTeamPerformance && (
          <TabsContent value="team" className="space-y-6">
            {isAdmin ? <PerformanceAnalytics /> : <TeamPerformance />}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
