import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Download, RefreshCw, Target, Star, TrendingUp, Users } from 'lucide-react';

const PerformanceReportComponent = () => {
  const { user } = useAuth();
  const {
    performanceReport,
    loading,
    errors,
    reportFilters,
    fetchPerformanceReport,
    clearError
  } = useReports();

  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-generate report when component mounts or filters change
  useEffect(() => {
    generateReport();
  }, [reportFilters]);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // For performance reports, we use year
      const params = {
        ...reportFilters,
        year: reportFilters.year || new Date().getFullYear()
      };
      await fetchPerformanceReport(params);
    } catch (error) {
      console.error('Error generating performance report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getRatingBadge = (rating) => {
    const ratingValue = parseFloat(rating) || 0;
    let variant = 'secondary';
    let className = 'bg-gray-100 text-gray-800';

    if (ratingValue >= 4.5) {
      variant = 'default';
      className = 'bg-green-100 text-green-800';
    } else if (ratingValue >= 3.5) {
      variant = 'default';
      className = 'bg-blue-100 text-blue-800';
    } else if (ratingValue >= 2.5) {
      variant = 'secondary';
      className = 'bg-yellow-100 text-yellow-800';
    } else if (ratingValue > 0) {
      variant = 'destructive';
      className = 'bg-red-100 text-red-800';
    }

    return (
      <Badge variant={variant} className={className}>
        {ratingValue > 0 ? `${ratingValue.toFixed(1)} ⭐` : 'No Rating'}
      </Badge>
    );
  };

  const renderEmployeeReport = () => {
    if (!performanceReport || (!performanceReport.reviews && !performanceReport.goals)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No performance data available</p>
        </div>
      );
    }

    const { reviews = [], goals = [] } = performanceReport;

    return (
      <div className="space-y-6">
        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Performance Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Review Period</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{review.review_period}</TableCell>
                        <TableCell>{getRatingBadge(review.overall_rating)}</TableCell>
                        <TableCell>{review.reviewer_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                            {review.status?.charAt(0).toUpperCase() + review.status?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                          {review.comments || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No reviews available</p>
            )}
          </CardContent>
        </Card>

        {/* Goals Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      </div>
                      <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                        {goal.status?.charAt(0).toUpperCase() + goal.status?.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{goal.achievement_percentage || 0}%</span>
                        </div>
                        <Progress value={goal.achievement_percentage || 0} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-500">
                        Due: {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No goals set</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTeamReport = () => {
    if (!performanceReport || !Array.isArray(performanceReport)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No performance data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Total Reviews</TableHead>
                <TableHead>Average Rating</TableHead>
                <TableHead>Total Goals</TableHead>
                <TableHead>Goal Completion</TableHead>
                <TableHead>Performance Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceReport.map((employee, index) => {
                const avgRating = parseFloat(employee.avg_rating) || 0;
                const goalCompletion = parseFloat(employee.avg_goal_completion) || 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{employee.employee_name}</div>
                        <div className="text-xs text-gray-500">{employee.employee_code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.total_reviews || 0}</Badge>
                    </TableCell>
                    <TableCell>{getRatingBadge(avgRating)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.total_goals || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={goalCompletion} className="h-2 w-16" />
                        <span className="text-sm font-medium">{goalCompletion.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`h-4 w-4 ${
                          avgRating >= 4 ? 'text-green-500' : 
                          avgRating >= 3 ? 'text-blue-500' : 
                          avgRating >= 2 ? 'text-yellow-500' : 'text-red-500'
                        }`} />
                        <span className="text-sm">
                          {avgRating >= 4 ? 'Excellent' : 
                           avgRating >= 3 ? 'Good' : 
                           avgRating >= 2 ? 'Average' : 
                           avgRating > 0 ? 'Needs Improvement' : 'No Data'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (!performanceReport) return null;

    let summaryData = {};

    if (user?.role === 'employee') {
      // For employee view, calculate personal summary
      const { reviews = [], goals = [] } = performanceReport;
      const avgRating = reviews.length > 0 ? 
        reviews.reduce((sum, r) => sum + (parseFloat(r.overall_rating) || 0), 0) / reviews.length : 0;
      const completedGoals = goals.filter(g => g.status === 'completed').length;
      const avgGoalCompletion = goals.length > 0 ? 
        goals.reduce((sum, g) => sum + (parseFloat(g.achievement_percentage) || 0), 0) / goals.length : 0;

      summaryData = {
        totalReviews: reviews.length,
        avgRating: avgRating.toFixed(1),
        totalGoals: goals.length,
        completedGoals,
        avgGoalCompletion: avgGoalCompletion.toFixed(0)
      };
    } else {
      // For admin/manager view, calculate team summary
      if (Array.isArray(performanceReport)) {
        const totalEmployees = performanceReport.length;
        const totalReviews = performanceReport.reduce((sum, emp) => sum + (emp.total_reviews || 0), 0);
        const avgTeamRating = performanceReport.reduce((sum, emp) => sum + (parseFloat(emp.avg_rating) || 0), 0) / totalEmployees;
        const totalGoals = performanceReport.reduce((sum, emp) => sum + (emp.total_goals || 0), 0);
        const avgTeamGoalCompletion = performanceReport.reduce((sum, emp) => sum + (parseFloat(emp.avg_goal_completion) || 0), 0) / totalEmployees;

        summaryData = {
          totalEmployees,
          totalReviews,
          avgTeamRating: avgTeamRating.toFixed(1),
          totalGoals,
          avgTeamGoalCompletion: avgTeamGoalCompletion.toFixed(0)
        };
      }
    }

    const cards = user?.role === 'employee' ? [
      { title: 'Total Reviews', value: summaryData.totalReviews, icon: Star },
      { title: 'Average Rating', value: `${summaryData.avgRating} ⭐`, icon: TrendingUp, color: 'text-blue-600' },
      { title: 'Total Goals', value: summaryData.totalGoals, icon: Target },
      { title: 'Goal Progress', value: `${summaryData.avgGoalCompletion}%`, icon: TrendingUp, color: 'text-green-600' }
    ] : [
      { title: 'Team Members', value: summaryData.totalEmployees, icon: Users },
      { title: 'Total Reviews', value: summaryData.totalReviews, icon: Star },
      { title: 'Team Avg Rating', value: `${summaryData.avgTeamRating} ⭐`, icon: TrendingUp, color: 'text-blue-600' },
      { title: 'Team Goal Progress', value: `${summaryData.avgTeamGoalCompletion}%`, icon: Target, color: 'text-green-600' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color || 'text-gray-900'}`}>
                      {card.value}
                    </p>
                  </div>
                  <IconComponent className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🎯 Performance Report
          </h2>
          <p className="text-gray-600">
            {user?.role === 'employee' ? 'Your performance reviews and goals' : 'Team performance overview and analytics'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errors.performance && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.performance}
            <Button
              variant="link"
              size="sm"
              onClick={() => clearError('performance')}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading.performance && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Generating performance report...</span>
        </div>
      )}

      {/* Report Content */}
      {!loading.performance && performanceReport && (
        <>
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Report Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {user?.role === 'employee' ? 'Performance Details' : 'Team Performance Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.role === 'employee' ? renderEmployeeReport() : renderTeamReport()}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PerformanceReportComponent;
