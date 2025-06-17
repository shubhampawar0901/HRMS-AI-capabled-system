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
  Building,
  Calendar,
  DollarSign,
  Clock,
  Calculator,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { formatCurrency, getMonthOptions, getYearOptions } from '@/utils/payrollUtils';
import { payrollService } from '@/services/payrollService';
import { employeeService } from '@/services/employeeService';
import { attendanceService } from '@/services/attendanceService';

const PayrollGenerationModal = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  employees = [], 
  loadingEmployees = false 
}) => {
  const [formData, setFormData] = useState({
    employeeId: null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [payrollPreview, setPayrollPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        employeeId: null,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      setEmployeeDetails(null);
      setAttendanceSummary(null);
      setPayrollPreview(null);
      setErrors({});
    }
  }, [isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }
    if (!formData.month || formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Please select a valid month';
    }
    if (!formData.year || formData.year < 2020) {
      newErrors.year = 'Please select a valid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // If employee changes, reset other data
    if (field === 'employeeId') {
      setEmployeeDetails(null);
      setAttendanceSummary(null);
      setPayrollPreview(null);
    }
  };

  // Fetch data when form is complete
  useEffect(() => {
    if (formData.employeeId && formData.month && formData.year && isOpen) {
      fetchPayrollData();
    }
  }, [formData.employeeId, formData.month, formData.year, isOpen]);

  const fetchPayrollData = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Fetch all required data in parallel
      const [employeeDetailsResponse, attendanceResponse, payrollPreviewResponse] = await Promise.all([
        employeeService.getEmployeePayrollDetails(formData.employeeId),
        attendanceService.getEmployeeAttendanceSummary(formData.employeeId, formData.month, formData.year),
        payrollService.getPayrollPreview(formData.employeeId, formData.month, formData.year)
      ]);

      // Check if all requests were successful
      if (!employeeDetailsResponse.success) {
        throw new Error(employeeDetailsResponse.message || 'Failed to fetch employee details');
      }
      if (!attendanceResponse.data) {
        throw new Error('Failed to fetch attendance data');
      }
      if (!payrollPreviewResponse.success) {
        throw new Error(payrollPreviewResponse.message || 'Failed to fetch payroll preview');
      }

      // Set the fetched data
      setEmployeeDetails(employeeDetailsResponse.data);

      // Transform attendance data to match expected format
      const attendanceData = attendanceResponse.data;
      setAttendanceSummary({
        month: formData.month,
        year: formData.year,
        workingDays: 22, // Standard working days
        presentDays: attendanceData.present_days || 0,
        absentDays: (attendanceData.total_days || 22) - (attendanceData.present_days || 0),
        totalHours: parseFloat(attendanceData.total_hours) || 0,
        overtimeHours: Math.max(0, (parseFloat(attendanceData.total_hours) || 0) - ((attendanceData.present_days || 0) * 8))
      });

      setPayrollPreview(payrollPreviewResponse.data);

    } catch (error) {
      console.error('Error fetching payroll data:', error);

      let errorMessage = 'Failed to fetch payroll data. Please try again.';

      // Handle specific error types
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        switch (status) {
          case 400:
            errorMessage = responseData.message || 'Invalid request. Please check your inputs.';
            break;
          case 404:
            if (responseData.message?.includes('Employee not found')) {
              errorMessage = 'Selected employee not found. Please refresh and try again.';
            } else if (responseData.message?.includes('attendance')) {
              errorMessage = 'No attendance data found for the selected period.';
            } else {
              errorMessage = 'Required data not found for the selected period.';
            }
            break;
          case 409:
            errorMessage = 'Payroll already exists for this employee and period.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = responseData.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setGenerating(true);
    try {
      const success = await onGenerate(formData.employeeId, formData.month, formData.year);
      if (success) {
        onClose();
      } else {
        setErrors({ general: 'Failed to generate payroll. Please try again.' });
      }
    } catch (error) {
      console.error('Error generating payroll:', error);

      let errorMessage = 'Failed to generate payroll. Please try again.';

      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        switch (status) {
          case 400:
            errorMessage = responseData.message || 'Invalid payroll data. Please check your inputs.';
            break;
          case 409:
            errorMessage = 'Payroll already exists for this employee and period.';
            break;
          case 403:
            errorMessage = 'You do not have permission to generate payroll.';
            break;
          case 404:
            errorMessage = 'Employee or required data not found.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = responseData.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setGenerating(false);
    }
  };

  const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <Calculator className="h-5 w-5 text-blue-600" />
            Generate Payroll
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form Inputs */}
          <Card className="border-blue-200/60 bg-gradient-to-r from-blue-50/50 to-blue-100/30">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Payroll Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Month Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Month *</label>
                  <Select
                    value={formData.month?.toString()}
                    onValueChange={(value) => handleFieldChange('month', parseInt(value))}
                  >
                    <SelectTrigger className={`${errors.month ? 'border-red-300' : ''}`}>
                      <SelectValue placeholder="Select month..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getMonthOptions().map(month => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.month && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.month}
                    </p>
                  )}
                </div>

                {/* Year Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Year *</label>
                  <Select
                    value={formData.year?.toString()}
                    onValueChange={(value) => handleFieldChange('year', parseInt(value))}
                  >
                    <SelectTrigger className={`${errors.year ? 'border-red-300' : ''}`}>
                      <SelectValue placeholder="Select year..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getYearOptions().map(year => (
                        <SelectItem key={year.value} value={year.value.toString()}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.year && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.year}
                    </p>
                  )}
                </div>

                {/* Employee Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Employee *</label>
                  <Select
                    value={formData.employeeId?.toString() || ''}
                    onValueChange={(value) => handleFieldChange('employeeId', parseInt(value))}
                    disabled={loadingEmployees}
                  >
                    <SelectTrigger className={`${errors.employeeId ? 'border-red-300' : ''}`}>
                      <SelectValue placeholder={loadingEmployees ? "Loading..." : "Select employee..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingEmployees ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            Loading employees...
                          </div>
                        </SelectItem>
                      ) : employees.length > 0 ? (
                        employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">
                                  {emp.name?.charAt(0)?.toUpperCase() || 'E'}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{emp.name}</div>
                                <div className="text-xs text-gray-500">Code: {emp.employeeCode}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-employees" disabled>
                          No employees found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.employeeId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.employeeId}
                    </p>
                  )}
                </div>
              </div>

              {errors.general && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.general}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading payroll data...</span>
            </div>
          )}

          {/* Employee Details and Calculations */}
          {employeeDetails && attendanceSummary && payrollPreview && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Employee Info */}
              <div className="space-y-4">
                {/* Employee Information */}
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <User className="h-4 w-4" />
                      Employee Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Name</p>
                        <p className="font-semibold text-blue-900">{employeeDetails.employee.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Employee Code</p>
                        <p className="font-semibold text-blue-900">{employeeDetails.employee.employeeCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Department</p>
                        <p className="font-semibold text-blue-900">{employeeDetails.employee.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Position</p>
                        <p className="font-semibold text-blue-900">{employeeDetails.employee.position}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Salary Structure */}
                <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-800">
                      <DollarSign className="h-4 w-4" />
                      Current Salary Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">Basic Salary</p>
                        <p className="font-bold text-emerald-900">{formatCurrency(employeeDetails.salaryStructure.basicSalary)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">HRA Rate</p>
                        <p className="font-semibold text-emerald-900">{(employeeDetails.salaryStructure.hraRate * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">Transport Allowance</p>
                        <p className="font-semibold text-emerald-900">{formatCurrency(employeeDetails.salaryStructure.transportAllowance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">PF Rate</p>
                        <p className="font-semibold text-emerald-900">{(employeeDetails.salaryStructure.pfRate * 100)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Attendance & Calculations */}
              <div className="space-y-4">
                {/* Attendance Summary */}
                <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <Clock className="h-4 w-4" />
                      Attendance Summary ({getMonthOptions().find(m => m.value === attendanceSummary.month)?.label} {attendanceSummary.year})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Working Days</p>
                        <p className="font-bold text-orange-900">{attendanceSummary.workingDays}</p>
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Present Days</p>
                        <p className="font-bold text-orange-900">{attendanceSummary.presentDays}</p>
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Absent Days</p>
                        <p className="font-semibold text-orange-900">{attendanceSummary.absentDays}</p>
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Overtime Hours</p>
                        <p className="font-semibold text-orange-900">{attendanceSummary.overtimeHours} hrs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payroll Calculation Preview */}
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Calculator className="h-4 w-4" />
                      Payroll Calculation Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Earnings */}
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2">Earnings</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-600">Earned Basic:</span>
                          <span className="font-semibold">{formatCurrency(payrollPreview.calculations.earnedBasicSalary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">HRA:</span>
                          <span className="font-semibold">{formatCurrency(payrollPreview.calculations.hra)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Transport:</span>
                          <span className="font-semibold">{formatCurrency(payrollPreview.calculations.transportAllowance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Overtime:</span>
                          <span className="font-semibold">{formatCurrency(payrollPreview.calculations.overtimePay)}</span>
                        </div>
                      </div>
                      <div className="border-t border-purple-200 mt-2 pt-2">
                        <div className="flex justify-between font-bold text-purple-800">
                          <span>Gross Salary:</span>
                          <span>{formatCurrency(payrollPreview.calculations.grossSalary)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2">Deductions</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-600">PF Deduction:</span>
                          <span className="font-semibold">{formatCurrency(payrollPreview.calculations.pfDeduction)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Tax Deduction:</span>
                          <span className="font-semibold">{formatCurrency(payrollPreview.calculations.taxDeduction)}</span>
                        </div>
                      </div>
                      <div className="border-t border-purple-200 mt-2 pt-2">
                        <div className="flex justify-between font-bold text-purple-800">
                          <span>Total Deductions:</span>
                          <span>{formatCurrency(payrollPreview.calculations.totalDeductions)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Net Salary */}
                    <div className="border-t-2 border-purple-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-purple-800">NET SALARY:</span>
                        <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-lg px-4 py-2">
                          {formatCurrency(payrollPreview.calculations.netSalary)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={generating}
            className="hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={handleGenerate}
            disabled={!formData.employeeId || !payrollPreview || generating}
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

export default PayrollGenerationModal;
