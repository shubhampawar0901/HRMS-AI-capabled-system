import React from 'react';
import { useParams } from 'react-router-dom';
import ReviewViewer from '@/components/performance/ReviewViewer';
import usePerformance from '@/hooks/usePerformance';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';

const ReviewPage = () => {
  const { id } = useParams();
  const { currentReview, fetchPerformanceReview, loading, error } = usePerformance();

  React.useEffect(() => {
    if (id) {
      fetchPerformanceReview(id);
    }
  }, [id, fetchPerformanceReview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading performance review..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error Loading Review</div>
            <p className="text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentReview) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-gray-600 mb-2">Review not found</div>
            <p className="text-gray-500">The requested performance review could not be found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ReviewViewer
        review={currentReview}
        onClose={() => window.history.back()}
      />
    </div>
  );
};

export default ReviewPage;
