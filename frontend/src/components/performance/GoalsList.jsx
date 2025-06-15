import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Plus, 
  Calendar, 
  User,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Edit
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePerformance from '@/hooks/usePerformance';
import GoalsForm from './GoalsForm';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const GoalsList = () => {
  const { isAdmin, isManager, isEmployee } = useAuth();
  const {
    goals,
    loading,
    error,
    pagination,
    updateFilters,
    updatePagination,
    canManagePerformance
  } = usePerformance();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

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

  // Handle priority filter
  const handlePriorityFilter = (value) => {
    setPriorityFilter(value);
    updateFilters({ priority: value === 'all' ? null : value });
  };

  // Handle edit goal
  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setShowCreateForm(true);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (goal) => {
    if (goal.status === 'completed') return 100;
    if (goal.status === 'not_started') return 0;
    return goal.progress || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="lg" text="Loading goals..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error Loading Goals</div>
            <p className="text-red-700">{error}</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Goals Management</h2>
          <p className="text-gray-600">
            {isEmployee && "Track your personal goals and objectives"}
            {isManager && "Manage team goals and track progress"}
            {isAdmin && "Oversee organization-wide goal achievement"}
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
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
                placeholder="Search goals..."
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
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={handlePriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="grid grid-cols-1 gap-4">
        {goals?.length > 0 ? (
          goals.map((goal, index) => (
            <Card
              key={`goal-${goal.id || index}`}
              className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-gray-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(goal.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {goal.title || 'Goal Title'}
                      </h3>
                      <Badge className={getStatusBadgeColor(goal.status)}>
                        {goal.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {goal.priority && (
                        <Badge className={getPriorityBadgeColor(goal.priority)}>
                          {goal.priority.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    
                    {goal.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">
                          {getProgressPercentage(goal)}%
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(goal)} 
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {goal.employee_name || goal.employeeName || 'Employee'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Due: {(goal.target_date || goal.targetDate || goal.dueDate) ? new Date(goal.target_date || goal.targetDate || goal.dueDate).toLocaleDateString() : 'No date'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Progress: {goal.achievement_percentage || goal.achievementPercentage || 0}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Category: {goal.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGoal(goal)}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
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
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Found</h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first goal to track progress and achievements.
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Goal
                </Button>
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

      {/* Create/Edit Goal Modal */}
      {showCreateForm && (
        <GoalsForm
          goal={selectedGoal}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedGoal(null);
          }}
        />
      )}
    </div>
  );
};

export default GoalsList;
