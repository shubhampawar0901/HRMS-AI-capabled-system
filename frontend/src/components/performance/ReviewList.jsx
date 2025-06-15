import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Star, 
  Calendar, 
  User,
  Plus,
  Eye,
  Edit,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePerformance from '@/hooks/usePerformance';
import ReviewForm from './ReviewForm';
import ReviewViewer from './ReviewViewer';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const ReviewList = () => {
  const { isAdmin, isManager, isEmployee } = useAuth();
  const {
    performanceReviews,
    loading,
    error,
    pagination,
    updateFilters,
    updatePagination,
    canManagePerformance
  } = usePerformance();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    updateFilters({ search: value });
  };

  // Handle status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    updateFilters({ status: value === 'all' ? null : value });
  };

  // Handle period filter
  const handlePeriodFilter = (value) => {
    setPeriodFilter(value);
    updateFilters({ period: value === 'all' ? null : value });
  };

  // Handle view review
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowViewModal(true);
  };

  // Handle edit review
  const handleEditReview = (review) => {
    setSelectedReview(review);
    setShowCreateForm(true);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="lg" text="Loading performance reviews..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error Loading Reviews</div>
            <p className="text-red-700">{typeof error === 'string' ? error : error?.message || 'An unexpected error occurred'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Reviews</h2>
          <p className="text-gray-600">
            {isEmployee && "View your performance reviews and feedback"}
            {isManager && "Manage team performance reviews"}
            {isAdmin && "Oversee all performance reviews"}
          </p>
        </div>
        {canManagePerformance && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Review
          </Button>
        )}
      </div>

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
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={handlePeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="current">Current Period</SelectItem>
                <SelectItem value="q1">Q1 2024</SelectItem>
                <SelectItem value="q2">Q2 2024</SelectItem>
                <SelectItem value="q3">Q3 2024</SelectItem>
                <SelectItem value="q4">Q4 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="grid grid-cols-1 gap-4">
        {performanceReviews?.length > 0 ? (
          performanceReviews.map((review, index) => (
            <Card
              key={`review-${review.id || index}`}
              className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-gray-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.review_period || review.reviewPeriod || 'Performance Review'}
                      </h3>
                      <Badge className={getStatusBadgeColor(review.status)}>
                        {review.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {review.employee_name || 'Employee'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {review.review_period || review.reviewPeriod || 'No period'}
                        </span>
                      </div>
                      
                      {(review.overall_rating || review.overallRating) && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Rating:</span>
                          <div className="flex items-center gap-1">
                            {getRatingStars(parseFloat(review.overall_rating || review.overallRating))}
                            <span className="text-sm font-medium text-gray-700 ml-1">
                              {parseFloat(review.overall_rating || review.overallRating).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Goals: {review.goalsCompleted || 0}/{review.totalGoals || 0}
                        </span>
                      </div>
                    </div>

                    {review.comments && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {review.comments}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReview(review)}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {canManagePerformance && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditReview(review)}
                        className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
                <p className="text-gray-600 mb-4">
                  {canManagePerformance 
                    ? "Start by creating a performance review for your team members."
                    : "No performance reviews available at the moment."
                  }
                </p>
                {canManagePerformance && (
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => updatePagination({ page: pagination.page - 1 })}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => updatePagination({ page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      {showCreateForm && (
        <ReviewForm
          review={selectedReview}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedReview(null);
          }}
        />
      )}

      {showViewModal && selectedReview && (
        <ReviewViewer
          review={selectedReview}
          onClose={() => {
            setShowViewModal(false);
            setSelectedReview(null);
          }}
        />
      )}
    </div>
  );
};

export default ReviewList;
