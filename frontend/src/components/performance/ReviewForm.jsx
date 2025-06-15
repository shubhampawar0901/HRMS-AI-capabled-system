import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  Star, 
  User,
  Calendar,
  FileText,
  Target,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePerformance from '@/hooks/usePerformance';
import { employeeService } from '@/services/employeeService';
import { aiService } from '@/services/aiService';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const ReviewForm = ({ review, onClose }) => {
  const { user, isAdmin, isManager } = useAuth();
  const { createPerformanceReview, updatePerformanceReview, loading } = usePerformance();

  const [formData, setFormData] = useState({
    employeeId: '',
    reviewPeriod: '',
    overallRating: '',
    comments: '',
    status: 'draft',
    goals: '',
    achievements: '',
    areasForImprovement: '',
    developmentPlan: ''
  });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [errors, setErrors] = useState({});

  // Load employees for selection (managers only see their team)
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await employeeService.getEmployees({
          managerId: isManager ? user.employeeId || user.employee?.id : null
        });
        
        if (response.success) {
          setEmployees(response.data.employees || []);
        }
      } catch (error) {
        console.error('Error loading employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (isManager || isAdmin) {
      loadEmployees();
    }
  }, [isManager, isAdmin, user]);

  // Initialize form data if editing
  useEffect(() => {
    if (review) {
      setFormData({
        employeeId: review.employeeId || '',
        reviewPeriod: review.reviewPeriod || '',
        overallRating: review.overallRating?.toString() || '',
        comments: review.comments || '',
        status: review.status || 'draft',
        goals: review.goals || '',
        achievements: review.achievements || '',
        areasForImprovement: review.areasForImprovement || '',
        developmentPlan: review.developmentPlan || ''
      });
    }
  }, [review]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }
    if (!formData.reviewPeriod) {
      newErrors.reviewPeriod = 'Review period is required';
    }
    if (!formData.overallRating) {
      newErrors.overallRating = 'Overall rating is required';
    } else if (formData.overallRating < 1 || formData.overallRating > 5) {
      newErrors.overallRating = 'Rating must be between 1 and 5';
    }
    if (!formData.comments) {
      newErrors.comments = 'Comments are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate AI feedback
  const generateAIFeedback = async () => {
    if (!formData.employeeId || !formData.overallRating) {
      alert('Please select an employee and provide a rating first');
      return;
    }

    try {
      setGeneratingFeedback(true);
      
      const response = await aiService.generateSmartFeedback({
        employeeId: formData.employeeId,
        feedbackType: 'performance',
        performanceData: {
          rating: parseFloat(formData.overallRating),
          goals: formData.goals,
          achievements: formData.achievements
        }
      });

      if (response.success) {
        const feedback = response.data.feedback;
        setFormData(prev => ({
          ...prev,
          comments: feedback.generatedFeedback || prev.comments,
          areasForImprovement: feedback.suggestions?.join(', ') || prev.areasForImprovement
        }));
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      alert('Failed to generate AI feedback. Please try again.');
    } finally {
      setGeneratingFeedback(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const reviewData = {
        ...formData,
        overallRating: parseFloat(formData.overallRating)
      };

      let success;
      if (review) {
        success = await updatePerformanceReview(review.id, reviewData);
      } else {
        success = await createPerformanceReview(reviewData);
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  // Get rating stars display
  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 cursor-pointer transition-colors duration-200 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => handleInputChange('overallRating', i.toString())}
        />
      );
    }
    return stars;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {review ? 'Edit Performance Review' : 'Create Performance Review'}
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

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Employee *
                </label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => handleInputChange('employeeId', value)}
                  disabled={loadingEmployees || !!review}
                >
                  <SelectTrigger className={errors.employeeId ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.firstName} {employee.lastName} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeId && (
                  <p className="text-red-600 text-sm mt-1">{errors.employeeId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Review Period *
                </label>
                <Input
                  value={formData.reviewPeriod}
                  onChange={(e) => handleInputChange('reviewPeriod', e.target.value)}
                  placeholder="e.g., Q4 2024, Annual 2024"
                  className={errors.reviewPeriod ? 'border-red-300' : ''}
                />
                {errors.reviewPeriod && (
                  <p className="text-red-600 text-sm mt-1">{errors.reviewPeriod}</p>
                )}
              </div>
            </div>

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="h-4 w-4 inline mr-1" />
                Overall Rating * ({formData.overallRating}/5)
              </label>
              <div className="flex items-center gap-2">
                {getRatingStars(parseInt(formData.overallRating) || 0)}
                <span className="text-sm text-gray-600 ml-2">
                  {formData.overallRating && `${formData.overallRating}/5`}
                </span>
              </div>
              {errors.overallRating && (
                <p className="text-red-600 text-sm mt-1">{errors.overallRating}</p>
              )}
            </div>

            {/* Goals and Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="h-4 w-4 inline mr-1" />
                  Goals & Objectives
                </label>
                <Textarea
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  placeholder="List the goals and objectives for this review period..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achievements
                </label>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  placeholder="Highlight key achievements and accomplishments..."
                  rows={4}
                />
              </div>
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Comments & Feedback *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAIFeedback}
                  disabled={generatingFeedback || !formData.employeeId}
                  className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {generatingFeedback ? 'Generating...' : 'AI Feedback'}
                </Button>
              </div>
              <Textarea
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                placeholder="Provide detailed feedback on performance..."
                rows={5}
                className={errors.comments ? 'border-red-300' : ''}
              />
              {errors.comments && (
                <p className="text-red-600 text-sm mt-1">{errors.comments}</p>
              )}
            </div>

            {/* Areas for Improvement and Development Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas for Improvement
                </label>
                <Textarea
                  value={formData.areasForImprovement}
                  onChange={(e) => handleInputChange('areasForImprovement', e.target.value)}
                  placeholder="Identify areas where improvement is needed..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Development Plan
                </label>
                <Textarea
                  value={formData.developmentPlan}
                  onChange={(e) => handleInputChange('developmentPlan', e.target.value)}
                  placeholder="Outline development plans and next steps..."
                  rows={4}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {review ? 'Update Review' : 'Create Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewForm;
