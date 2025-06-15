import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  Save, 
  Target, 
  User,
  Calendar,
  TrendingUp,
  Flag
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePerformance from '@/hooks/usePerformance';
import { employeeService } from '@/services/employeeService';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const GoalsForm = ({ goal, onClose }) => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const { createGoal, updateGoal, loading } = usePerformance();

  const [formData, setFormData] = useState({
    employeeId: '',
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    targetValue: '',
    currentValue: '',
    dueDate: '',
    status: 'not_started'
  });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
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
    } else if (isEmployee) {
      // For employees, set their own ID
      setFormData(prev => ({
        ...prev,
        employeeId: user.employeeId || user.employee?.id || ''
      }));
    }
  }, [isManager, isAdmin, user]);

  // Initialize form data if editing
  useEffect(() => {
    if (goal) {
      setFormData({
        employeeId: goal.employeeId || '',
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || '',
        priority: goal.priority || 'medium',
        targetValue: goal.targetValue || '',
        currentValue: goal.currentValue || '',
        dueDate: goal.dueDate ? goal.dueDate.split('T')[0] : '',
        status: goal.status || 'not_started'
      });
    }
  }, [goal]);

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
    if (!formData.title) {
      newErrors.title = 'Goal title is required';
    }
    if (!formData.description) {
      newErrors.description = 'Goal description is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const goalData = {
        ...formData,
        targetValue: formData.targetValue || null,
        currentValue: formData.currentValue || null
      };

      let success;
      if (goal) {
        success = await updateGoal(goal.id, goalData);
      } else {
        success = await createGoal(goalData);
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!formData.targetValue || !formData.currentValue) return 0;
    const target = parseFloat(formData.targetValue);
    const current = parseFloat(formData.currentValue);
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            {goal ? 'Edit Goal' : 'Create New Goal'}
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
            {(isManager || isAdmin) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Employee *
                </label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => handleInputChange('employeeId', value)}
                  disabled={loadingEmployees || !!goal}
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
            )}

            {/* Goal Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter goal title"
                className={errors.title ? 'border-red-300' : ''}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Goal Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the goal in detail..."
                rows={4}
                className={errors.description ? 'border-red-300' : ''}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="skill_development">Skill Development</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Flag className="h-4 w-4 inline mr-1" />
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target and Current Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Target Value
                </label>
                <Input
                  value={formData.targetValue}
                  onChange={(e) => handleInputChange('targetValue', e.target.value)}
                  placeholder="e.g., 100, 95%, $50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Value
                </label>
                <Input
                  value={formData.currentValue}
                  onChange={(e) => handleInputChange('currentValue', e.target.value)}
                  placeholder="Current progress value"
                />
                {formData.targetValue && formData.currentValue && (
                  <p className="text-sm text-gray-600 mt-1">
                    Progress: {calculateProgress()}%
                  </p>
                )}
              </div>
            </div>

            {/* Due Date and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Due Date *
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={errors.dueDate ? 'border-red-300' : ''}
                />
                {errors.dueDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>
                )}
              </div>

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
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                {goal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalsForm;
