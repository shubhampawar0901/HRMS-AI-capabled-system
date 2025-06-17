import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import {
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  X,
  Calculator
} from 'lucide-react';
import { formatCurrency, getMonthOptions, getYearOptions } from '@/utils/payrollUtils';
import { employeeService } from '@/services/employeeService';

const SimplifiedPayrollGeneration = ({ isOpen, onClose, onGenerate }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    month: '',
    year: ''
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch employees on mount
  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      // Set default month/year
      const now = new Date();
      setFormData(prev => ({
        ...prev,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }));
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAllEmployees();
      if (response.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setErrors({ general: 'Failed to load employees' });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Set selected employee details
    if (field === 'employeeId') {
      const employee = employees.find(emp => emp.id === parseInt(value));
      setSelectedEmployee(employee);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }
    if (!formData.month) {
      newErrors.month = 'Please select a month';
    }
    if (!formData.year) {
      newErrors.year = 'Please select a year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setGenerating(true);
    try {
      const success = await onGenerate(formData.employeeId, formData.month, formData.year);
      if (success) {
        onClose();
        // Reset form
        setFormData({ employeeId: '', month: '', year: '' });
        setSelectedEmployee(null);
      }
    } catch (error) {
      console.error('Generate payroll error:', error);

      // Handle specific error types
      let errorMessage = 'Failed to generate payroll. Please try again.';

      if (error.response?.status === 409) {
        // Duplicate payroll error
        errorMessage = error.response.data?.message || 'Payroll already exists for this employee and period.';
      } else if (error.response?.status === 400) {
        // Validation error
        errorMessage = error.response.data?.message || 'Invalid data provided.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setFormData({ employeeId: '', month: '', year: '' });
    setSelectedEmployee(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Calculator className="h-5 w-5 text-blue-600" />
            Generate Payroll
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{errors.general}</p>
            </div>
          )}

          {/* Selection Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Employee</label>
              <Select
                value={formData.employeeId.toString()}
                onValueChange={(value) => handleFieldChange('employeeId', parseInt(value))}
                disabled={loading}
              >
                <SelectTrigger className={errors.employeeId ? 'border-red-300' : ''}>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.firstName} {employee.lastName} ({employee.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-sm text-red-600">{errors.employeeId}</p>
              )}
            </div>

            {/* Month Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Month</label>
              <Select
                value={formData.month.toString()}
                onValueChange={(value) => handleFieldChange('month', parseInt(value))}
              >
                <SelectTrigger className={errors.month ? 'border-red-300' : ''}>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.month && (
                <p className="text-sm text-red-600">{errors.month}</p>
              )}
            </div>

            {/* Year Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Year</label>
              <Select
                value={formData.year.toString()}
                onValueChange={(value) => handleFieldChange('year', parseInt(value))}
              >
                <SelectTrigger className={errors.year ? 'border-red-300' : ''}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {getYearOptions().map((year) => (
                    <SelectItem key={year.value} value={year.value.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.year && (
                <p className="text-sm text-red-600">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <User className="h-4 w-4" />
                  Selected Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Name</p>
                    <p className="font-semibold text-blue-900">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Employee Code</p>
                    <p className="font-semibold text-blue-900">{selectedEmployee.employeeCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Department</p>
                    <p className="font-semibold text-blue-900">{selectedEmployee.departmentName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Basic Salary</p>
                    <p className="font-bold text-blue-900">{formatCurrency(selectedEmployee.basicSalary)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800">Automatic Calculation</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Payroll will be automatically calculated based on:
                  </p>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1">
                    <li>• Employee's basic salary</li>
                    <li>• Attendance records for the selected month</li>
                    <li>• Standard allowances (HRA 40%, Transport ₹2000)</li>
                    <li>• Standard deductions (PF 12%, Tax if applicable)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={generating}
            className="hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={handleGenerate}
            disabled={!formData.employeeId || !formData.month || !formData.year || generating}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
          >
            {generating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Generating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Generate Payroll
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimplifiedPayrollGeneration;
