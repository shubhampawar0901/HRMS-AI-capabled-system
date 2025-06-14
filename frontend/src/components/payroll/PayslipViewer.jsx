import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Download,
  Printer,
  Building,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import usePayroll from '@/hooks/usePayroll';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { 
  formatCurrency, 
  formatPayrollPeriod, 
  getPayrollStatusColor, 
  getPayrollStatusText,
  formatEmployeeName
} from '@/utils/payrollUtils';

const PayslipViewer = ({ payslip, onClose }) => {
  const { downloadPayslip } = usePayroll();
  const [downloading, setDownloading] = useState(false);

  if (!payslip) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadPayslip(payslip.id);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const earningsData = [
    { label: 'Basic Salary', amount: payslip.basicSalary },
    { label: 'HRA', amount: payslip.hra },
    { label: 'Transport Allowance', amount: payslip.transportAllowance },
    { label: 'Overtime Pay', amount: payslip.overtimePay }
  ].filter(item => item.amount > 0);

  const deductionsData = [
    { label: 'PF Deduction', amount: payslip.pfDeduction },
    { label: 'Tax Deduction', amount: payslip.taxDeduction }
  ].filter(item => item.amount > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payslip Details</h2>
            <p className="text-gray-600 mt-1">
              {formatPayrollPeriod(payslip.month, payslip.year)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getPayrollStatusColor(payslip.status)}>
              {getPayrollStatusText(payslip.status)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 transition-colors duration-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company and Employee Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Info */}
            <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-semibold text-gray-900">HRMS Company Ltd.</p>
                  <p className="text-gray-600 text-sm">123 Business Street</p>
                  <p className="text-gray-600 text-sm">City, State 12345</p>
                  <p className="text-gray-600 text-sm">contact@hrms.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Employee Info */}
            <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatEmployeeName(payslip.employee)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Employee ID: {payslip.employee?.employeeCode || payslip.employeeId}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Department: {payslip.employee?.department || 'N/A'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Position: {payslip.employee?.position || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payroll Period and Attendance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Pay Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-purple-900">
                  {formatPayrollPeriod(payslip.month, payslip.year)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">Working Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-blue-900">
                  {payslip.presentDays} / {payslip.workingDays}
                </p>
                <p className="text-sm text-gray-600">Present / Total</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">Overtime Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-orange-900">
                  {payslip.overtimeHours || 0}
                </p>
                <p className="text-sm text-gray-600">Hours</p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings and Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {earningsData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-green-200 last:border-b-0">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t-2 border-green-300">
                  <span className="font-bold text-green-800">Gross Salary</span>
                  <span className="font-bold text-xl text-green-800">
                    {formatCurrency(payslip.grossSalary)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deductionsData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-red-200 last:border-b-0">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-semibold text-red-700">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t-2 border-red-300">
                  <span className="font-bold text-red-800">Total Deductions</span>
                  <span className="font-bold text-xl text-red-800">
                    {formatCurrency(payslip.totalDeductions)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net Salary */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-700 mb-2">Net Salary</p>
                <p className="text-4xl font-bold text-blue-900">
                  {formatCurrency(payslip.netSalary)}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Amount to be credited to your account
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="hover:bg-gray-100 transition-colors duration-300"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            {downloading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PayslipViewer;
