import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  FileText,
  Star,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePerformance from '@/hooks/usePerformance';
import ReviewList from './ReviewList';
import GoalsList from './GoalsList';
import LoadingSpinner from '@/components/layout/LoadingSpinner';


// Custom SmoothTabsContent component for smooth transitions
const SmoothTabsContent = ({ value, activeTab, children, className = "" }) => {
  const isActive = value === activeTab;
  const [isVisible, setIsVisible] = useState(isActive);

  React.useEffect(() => {
    if (isActive) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div
      className={`tab-content-panel ${isActive ? 'active' : ''} ${className}`}
      style={{
        position: isActive ? 'relative' : 'absolute',
        width: '100%',
        top: isActive ? 'auto' : 0,
        left: isActive ? 'auto' : 0,
        right: isActive ? 'auto' : 0,
        zIndex: isActive ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden'
      }}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
};

const PerformanceDashboard = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const {
    performanceReviews,
    goals,
    loading,
    error,
    canManagePerformance
  } = usePerformance();

  const [activeTab, setActiveTab] = useState(() => {
    if (isEmployee) return 'overview';
    if (isManager) return 'team';
    if (isAdmin) return 'overview';
    return 'overview';
  });



  // Calculate summary stats for employee
  const employeeSummary = React.useMemo(() => {
    // For employees, show summary even if one of the arrays is empty
    const reviews = performanceReviews || [];
    const userGoals = goals || [];

    const completedReviews = reviews.filter(review => review.status === 'completed').length;

    // Fix NaN issue: Properly handle string ratings and filter valid ratings
    const reviewsWithRatings = reviews.filter(review => {
      const rating = review.overall_rating || review.overallRating;
      const numericRating = parseFloat(rating);
      return rating !== null && rating !== undefined && !isNaN(numericRating) && numericRating > 0;
    });

    const averageRating = reviewsWithRatings.length > 0
      ? reviewsWithRatings.reduce((sum, review) => {
          const rating = review.overall_rating || review.overallRating;
          return sum + parseFloat(rating);
        }, 0) / reviewsWithRatings.length
      : null; // Use null instead of 0 to indicate no data

    const completedGoals = userGoals.filter(goal => goal.status === 'completed').length;
    const goalCompletionRate = userGoals.length > 0 ? (completedGoals / userGoals.length * 100) : 0;

    return {
      totalReviews: reviews.length,
      completedReviews,
      averageRating: averageRating !== null ? Number(averageRating.toFixed(1)) : null,
      totalGoals: userGoals.length,
      completedGoals,
      goalCompletionRate: Number(goalCompletionRate.toFixed(1))
    };
  }, [performanceReviews, goals]);

  // Removed team summary calculation as Team tab was removed

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
              Avg Rating: {employeeSummary?.averageRating !== null ? employeeSummary?.averageRating : 'No ratings yet'}
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
              {employeeSummary?.averageRating !== null ? employeeSummary?.averageRating : 'N/A'}
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
      {/* Manager Actions */}
      <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Manager Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
              onClick={() => setActiveTab('reviews')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Review
            </Button>
            <Button
              variant="outline"
              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
              onClick={() => setActiveTab('goals')}
            >
              <Target className="h-4 w-4 mr-2" />
              Manage Goals
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
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="tabs-trigger-enhanced data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="tabs-trigger-enhanced data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            {isEmployee ? 'My Reviews' : 'Reviews'}
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="tabs-trigger-enhanced data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            {isEmployee ? 'My Goals' : 'Goals'}
          </TabsTrigger>
        </TabsList>

        <div className="tab-content-container">
          <SmoothTabsContent
            key="overview-tab"
            value="overview"
            activeTab={activeTab}
            className="space-y-6"
          >
            {isEmployee ? renderEmployeeOverview() : renderManagerOverview()}
          </SmoothTabsContent>

          <SmoothTabsContent
            key="reviews-tab"
            value="reviews"
            activeTab={activeTab}
            className="space-y-6"
          >
            <ReviewList key="reviews-list" />
          </SmoothTabsContent>

          <SmoothTabsContent
            key="goals-tab"
            value="goals"
            activeTab={activeTab}
            className="space-y-6"
          >
            <GoalsList key="goals-list" />
          </SmoothTabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
