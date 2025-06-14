import React, { useState, useEffect } from 'react';
import { useLeave } from '@/hooks/useLeave';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CalendarIcon, AlertCircle, CheckCircle, X } from 'lucide-react';

const LeaveApplicationForm = ({ onSuccess, onCancel }) => {
  const {
    leaveTypes,
    balance,
    isSubmitting,
    error,
    applyLeave,
    loadLeaveTypes,
    loadBalance,
    calculateLeaveDays,
    clearError
  } = useLeave();

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(null);

  // Get selected leave type name for display
  const getSelectedLeaveTypeName = () => {
    if (!formData.leaveTypeId || !leaveTypes.length) return null;
    const selectedType = leaveTypes.find(type => type.id.toString() === formData.leaveTypeId);
    return selectedType ? selectedType.name : null;
  };

  // Load initial data
  useEffect(() => {
    loadLeaveTypes();
    loadBalance();
  }, [loadLeaveTypes, loadBalance]);

  // Calculate leave days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = calculateLeaveDays(formData.startDate, formData.endDate);
      setCalculatedDays(days);
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate, calculateLeaveDays]);

  // Update available balance when leave type changes
  useEffect(() => {
    if (formData.leaveTypeId && balance.length > 0) {
      const selectedBalance = balance.find(b => b.leaveTypeId === parseInt(formData.leaveTypeId));
      setAvailableBalance(selectedBalance);
    } else {
      setAvailableBalance(null);
    }
  }, [formData.leaveTypeId, balance]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.leaveTypeId) {
      errors.leaveTypeId = 'Please select a leave type';
    }

    if (!formData.startDate) {
      errors.startDate = 'Please select start date';
    }

    if (!formData.endDate) {
      errors.endDate = 'Please select end date';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate > endDate) {
        errors.endDate = 'End date must be after start date';
      }

      if (startDate < new Date().setHours(0, 0, 0, 0)) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!formData.reason.trim()) {
      errors.reason = 'Please provide a reason for leave';
    } else if (formData.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters long';
    }

    // Check leave balance
    if (availableBalance && calculatedDays > availableBalance.remainingDays) {
      errors.balance = `Insufficient leave balance. Available: ${availableBalance.remainingDays} days, Requested: ${calculatedDays} days`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const applicationData = {
        leaveTypeId: parseInt(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim()
      };

      await applyLeave(applicationData);
      
      // Reset form
      setFormData({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setValidationErrors({});
      setCalculatedDays(0);
      setAvailableBalance(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to submit leave application:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setValidationErrors({});
    clearError();
    
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-6 relative">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-blue-600" />
          Apply for Leave
        </CardTitle>
        {onCancel && (
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            type="button"
          >
            <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="leaveType" className="text-sm font-medium text-gray-700">
              Leave Type *
            </Label>
            <Select 
              value={formData.leaveTypeId} 
              onValueChange={(value) => handleInputChange('leaveTypeId', value)}
            >
              <SelectTrigger className={`transition-all duration-200 ${
                validationErrors.leaveTypeId
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-400'
              }`}>
                <SelectValue placeholder="Select leave type">
                  {getSelectedLeaveTypeName()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.leaveTypeId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.leaveTypeId}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`transition-all duration-200 ${
                  validationErrors.startDate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-400'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {validationErrors.startDate && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.startDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                End Date *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`transition-all duration-200 ${
                  validationErrors.endDate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-400'
                }`}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
              {validationErrors.endDate && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Leave Summary */}
          {calculatedDays > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Total Leave Days:</span>
                <span className="text-lg font-bold text-blue-900">{calculatedDays} days</span>
              </div>
              
              {availableBalance && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Available Balance:</span>
                  <span className={`text-sm font-medium ${
                    availableBalance.remainingDays >= calculatedDays 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {availableBalance.remainingDays} days
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Balance Error */}
          {validationErrors.balance && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.balance}
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Reason for Leave *
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Please provide a detailed reason for your leave request..."
              className={`min-h-[100px] transition-all duration-200 ${
                validationErrors.reason 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-400'
              }`}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              {validationErrors.reason && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.reason}
                </p>
              )}
              <span className="text-xs text-gray-500 ml-auto">
                {formData.reason.length}/500 characters
              </span>
            </div>
          </div>

          {/* Global Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-8 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Submit Application
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeaveApplicationForm;
