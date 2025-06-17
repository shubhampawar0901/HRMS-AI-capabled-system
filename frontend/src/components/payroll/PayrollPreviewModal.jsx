import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Save,
  Trash2,
  Eye,
  Calculator,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatCurrency } from '@/utils/payrollUtils';

const PayrollPreviewModal = ({ isOpen, onClose, previewData, onConfirm, onCancel }) => {
  const [confirming, setConfirming] = useState(false);

  if (!previewData) return null;

  const { employee, period, attendance, calculations } = previewData;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm(previewData);
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Eye className="h-5 w-5 text-blue-600" />
            Payroll Preview - Review Before Saving
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee & Period Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <User className="h-4 w-4" />
                  Employee Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-medium">Name:</span>
                    <span className="font-semibold text-blue-900">{employee.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-medium">Code:</span>
                    <span className="font-semibold text-blue-900">{employee.employeeCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-medium">Department:</span>
                    <span className="font-semibold text-blue-900">{employee.department || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-medium">Position:</span>
                    <span className="font-semibold text-blue-900">{employee.position || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Calendar className="h-4 w-4" />
                  Payroll Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-medium">Month:</span>
                    <span className="font-semibold text-purple-900">{period.monthName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-medium">Year:</span>
                    <span className="font-semibold text-purple-900">{period.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-medium">Working Days:</span>
                    <span className="font-semibold text-purple-900">{attendance.workingDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-medium">Present Days:</span>
                    <span className="font-semibold text-purple-900">{attendance.presentDays}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Summary */}
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Clock className="h-4 w-4" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{attendance.presentDays}</p>
                  <p className="text-sm text-amber-700">Present Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{attendance.absentDays}</p>
                  <p className="text-sm text-amber-700">Absent Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{attendance.overtimeHours.toFixed(1)}</p>
                  <p className="text-sm text-amber-700">Overtime Hours</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {((attendance.presentDays / attendance.workingDays) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-amber-700">Attendance Rate</p>
                </div>
              </div>
              {attendance.attendanceNote && (
                <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    {attendance.attendanceNote}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Salary Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earnings */}
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <TrendingUp className="h-4 w-4" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-600">Basic Salary:</span>
                    <span className="font-bold text-green-900">{formatCurrency(calculations.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">HRA (40%):</span>
                    <span className="font-bold text-green-900">{formatCurrency(calculations.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Transport Allowance:</span>
                    <span className="font-bold text-green-900">{formatCurrency(calculations.transportAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Overtime Pay:</span>
                    <span className="font-bold text-green-900">{formatCurrency(calculations.overtimePay)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-green-700 font-semibold">Gross Salary:</span>
                      <span className="font-bold text-green-900 text-lg">{formatCurrency(calculations.grossSalary)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <TrendingDown className="h-4 w-4" />
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-red-600">PF (12%):</span>
                    <span className="font-bold text-red-900">{formatCurrency(calculations.pfDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Tax Deduction:</span>
                    <span className="font-bold text-red-900">{formatCurrency(calculations.taxDeduction)}</span>
                  </div>
                  {calculations.absenceDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600">Absence Deduction:</span>
                      <span className="font-bold text-red-900">{formatCurrency(calculations.absenceDeduction)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-red-700 font-semibold">Total Deductions:</span>
                      <span className="font-bold text-red-900 text-lg">{formatCurrency(calculations.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net Salary */}
          <Card className="border-blue-300 bg-gradient-to-r from-blue-100 to-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-blue-600 font-medium mb-2">NET SALARY</p>
                <p className="text-4xl font-bold text-blue-900">{formatCurrency(calculations.netSalary)}</p>
                <Badge className="mt-2 bg-blue-600 text-white">
                  {calculations.calculationMethod === 'full_basic_with_absence_deduction' ? 'Full Basic + Absence Deduction' : 'Standard Calculation'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-800">Review Required</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Please review all calculations carefully before confirming. Once saved, this payroll record will be created in the system.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={confirming}
            className="hover:bg-red-50 border-red-300 text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={handleConfirm}
            disabled={confirming}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
          >
            {confirming ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Confirm & Save Payroll
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollPreviewModal;
