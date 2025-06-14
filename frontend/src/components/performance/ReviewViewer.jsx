import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Star, 
  User,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';

const ReviewViewer = ({ review, onClose }) => {
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get rating stars
  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-5 w-5 fill-yellow-200 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  // Get rating description
  const getRatingDescription = (rating) => {
    if (rating >= 4.5) return 'Exceptional Performance';
    if (rating >= 4.0) return 'Exceeds Expectations';
    if (rating >= 3.5) return 'Meets Expectations';
    if (rating >= 3.0) return 'Partially Meets Expectations';
    if (rating >= 2.0) return 'Below Expectations';
    return 'Needs Improvement';
  };

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Performance Review Details
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Employee Information</h3>
                  </div>
                  <p className="text-blue-800 font-medium">
                    {review.employeeName || 'Employee Name'}
                  </p>
                  <p className="text-blue-600 text-sm">
                    {review.employeePosition || 'Position'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Review Period</h3>
                  </div>
                  <p className="text-green-800 font-medium">
                    {review.reviewPeriod || 'Review Period'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusBadgeColor(review.status)}>
                      {review.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Rating */}
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-yellow-900">Overall Rating</h3>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {review.overallRating && getRatingStars(review.overallRating)}
                  </div>
                  
                  <div className="text-3xl font-bold text-yellow-900 mb-1">
                    {review.overallRating?.toFixed(1) || 'N/A'}/5.0
                  </div>
                  
                  {review.overallRating && (
                    <p className={`text-sm font-medium ${getRatingColor(review.overallRating)}`}>
                      {getRatingDescription(review.overallRating)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Goals and Achievements */}
            {(review.goals || review.achievements) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {review.goals && (
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Goals & Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{review.goals}</p>
                    </CardContent>
                  </Card>
                )}

                {review.achievements && (
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{review.achievements}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Comments & Feedback */}
            {review.comments && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Comments & Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {review.comments}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Areas for Improvement and Development Plan */}
            {(review.areasForImprovement || review.developmentPlan) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {review.areasForImprovement && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-orange-800 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-orange-700 whitespace-pre-wrap">
                        {review.areasForImprovement}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {review.developmentPlan && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-blue-800 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Development Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-700 whitespace-pre-wrap">
                        {review.developmentPlan}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Review Metadata */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {review.updatedAt ? new Date(review.updatedAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Reviewer:</span>{' '}
                    {review.reviewerName || 'Manager'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-6 border-t mt-6">
            <Button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 transition-colors duration-300"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewViewer;
