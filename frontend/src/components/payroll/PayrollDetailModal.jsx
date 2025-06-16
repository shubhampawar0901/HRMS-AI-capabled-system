import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Calendar,
  DollarSign,
  Minus,
  Plus,
  Clock,
  Building,
  CreditCard
} from 'lucide-react';
import {
  formatCurrency,
  formatPayrollPeriod,
  getPayrollStatusColor,
  getPayrollStatusText
} from '@/utils/payrollUtils';

const PayrollDetailModal = ({ payroll, isOpen, onClose }) => {
  if (!payroll) return null;

  const earnings = [
    { label: 'Basic Salary', value: payroll.basicSalary, icon: DollarSign },
    { label: 'HRA', value: payroll.hra, icon: Building },
    { label: 'Transport Allowance', value: payroll.transportAllowance, icon: CreditCard },
    { label: 'Overtime Pay', value: payroll.overtimePay, icon: Clock },
  ];

  const deductions = [
    { label: 'PF Deduction', value: payroll.pfDeduction, icon: Minus },
    { label: 'Tax Deduction', value: payroll.taxDeduction, icon: Minus },
  ];

  const attendanceInfo = [
    { label: 'Working Days', value: payroll.workingDays },
    { label: 'Present Days', value: payroll.presentDays },
    { label: 'Overtime Hours', value: payroll.overtimeHours },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-blue-600" />
            Payroll Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Information */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <User className="h-4 w-4" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Employee Name</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {payroll.employee_name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Employee Code</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {payroll.employee_code || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Department</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {payroll.department_name || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Period and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Calendar className="h-4 w-4" />
                  Pay Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPayrollPeriod(payroll.month, payroll.year)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <CreditCard className="h-4 w-4" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${getPayrollStatusColor(payroll.status)} text-lg px-4 py-2`}>
                  {getPayrollStatusText(payroll.status)}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Earnings */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Plus className="h-4 w-4" />
                Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {earnings.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="font-bold text-green-700">
                        {formatCurrency(item.value || 0)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between p-4 bg-green-200 rounded-lg">
                <span className="text-lg font-bold text-green-800">Gross Salary</span>
                <span className="text-xl font-bold text-green-900">
                  {formatCurrency(payroll.grossSalary || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Deductions */}
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Minus className="h-4 w-4" />
                Deductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deductions.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="font-bold text-red-700">
                        {formatCurrency(item.value || 0)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between p-4 bg-red-200 rounded-lg">
                <span className="text-lg font-bold text-red-800">Total Deductions</span>
                <span className="text-xl font-bold text-red-900">
                  {formatCurrency(payroll.totalDeductions || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Information */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Clock className="h-4 w-4" />
                Attendance Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {attendanceInfo.map((item, index) => (
                  <div key={index} className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">{item.label}</p>
                    <p className="text-2xl font-bold text-blue-900">{item.value || 0}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Net Salary */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <DollarSign className="h-4 w-4" />
                Net Salary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-white rounded-lg border border-purple-200">
                <p className="text-lg text-purple-600 font-medium mb-2">Final Amount</p>
                <p className="text-4xl font-bold text-purple-900">
                  {formatCurrency(payroll.netSalary || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Processing Information */}
          {(payroll.processedAt || payroll.processed_by_name) && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Clock className="h-4 w-4" />
                  Processing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {payroll.processed_by_name && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Processed By</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {payroll.processed_by_name}
                      </p>
                    </div>
                  )}
                  {payroll.processedAt && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Processed At</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(payroll.processedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollDetailModal;
