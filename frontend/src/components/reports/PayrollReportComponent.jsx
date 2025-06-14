import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Download, RefreshCw, DollarSign, Users, TrendingUp, Shield } from 'lucide-react';

const PayrollReportComponent = () => {
  const { user } = useAuth();
  const {
    payrollReport,
    loading,
    errors,
    reportFilters,
    fetchPayrollReport,
    clearError
  } = useReports();

  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-generate report when component mounts or filters change
  useEffect(() => {
    generateReport();
  }, [reportFilters]);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // For payroll reports, we use month and year
      const params = {
        ...reportFilters,
        month: reportFilters.month || new Date().getMonth() + 1,
        year: reportFilters.year || new Date().getFullYear()
      };
      await fetchPayrollReport(params);
    } catch (error) {
      console.error('Error generating payroll report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const renderAccessDenied = () => (
    <Card className="border-red-200">
      <CardContent className="p-8 text-center">
        <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Access Restricted</h3>
        <p className="text-red-600">
          Payroll reports are only available to administrators for security and privacy reasons.
        </p>
      </CardContent>
    </Card>
  );

  const renderPayrollReport = () => {
    if (!payrollReport || !Array.isArray(payrollReport)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No payroll data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollReport.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{record.employee_name}</div>
                      <div className="text-xs text-gray-500">{record.employee_code}</div>
                    </div>
                  </TableCell>
                  <TableCell>{record.department_name || '-'}</TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(record.basic_salary)}
                  </TableCell>
                  <TableCell className="font-mono text-green-600">
                    +{formatCurrency(record.allowances)}
                  </TableCell>
                  <TableCell className="font-mono text-red-600">
                    -{formatCurrency(record.deductions)}
                  </TableCell>
                  <TableCell className="font-mono text-blue-600">
                    +{formatCurrency(record.overtime_pay)}
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {formatCurrency(record.gross_pay)}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-green-700">
                    {formatCurrency(record.net_pay)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={record.status === 'paid' ? 'default' : 'secondary'}
                      className={record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (!payrollReport || !Array.isArray(payrollReport)) return null;

    const totalEmployees = payrollReport.length;
    const totalGrossPay = payrollReport.reduce((sum, record) => sum + (parseFloat(record.gross_pay) || 0), 0);
    const totalNetPay = payrollReport.reduce((sum, record) => sum + (parseFloat(record.net_pay) || 0), 0);
    const totalDeductions = payrollReport.reduce((sum, record) => sum + (parseFloat(record.deductions) || 0), 0);
    const totalAllowances = payrollReport.reduce((sum, record) => sum + (parseFloat(record.allowances) || 0), 0);
    const paidCount = payrollReport.filter(record => record.status === 'paid').length;
    const avgSalary = totalEmployees > 0 ? totalNetPay / totalEmployees : 0;

    const cards = [
      { 
        title: 'Total Employees', 
        value: totalEmployees, 
        icon: Users,
        description: `${paidCount} paid, ${totalEmployees - paidCount} pending`
      },
      { 
        title: 'Total Gross Pay', 
        value: formatCurrency(totalGrossPay), 
        icon: DollarSign, 
        color: 'text-blue-600',
        description: 'Before deductions'
      },
      { 
        title: 'Total Net Pay', 
        value: formatCurrency(totalNetPay), 
        icon: TrendingUp, 
        color: 'text-green-600',
        description: 'After deductions'
      },
      { 
        title: 'Average Salary', 
        value: formatCurrency(avgSalary), 
        icon: DollarSign, 
        color: 'text-purple-600',
        description: 'Per employee'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-xl font-bold ${card.color || 'text-gray-900'}`}>
                      {card.value}
                    </p>
                  </div>
                  <IconComponent className="h-8 w-8 text-gray-400" />
                </div>
                {card.description && (
                  <p className="text-xs text-gray-500">{card.description}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Check if user has access to payroll reports
  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              💰 Payroll Report
            </h2>
            <p className="text-gray-600">Comprehensive payroll processing and salary information</p>
          </div>
        </div>
        {renderAccessDenied()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            💰 Payroll Report
          </h2>
          <p className="text-gray-600">
            Comprehensive payroll processing and salary information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This report contains sensitive financial information. Access is restricted to administrators only.
        </AlertDescription>
      </Alert>

      {/* Error Alert */}
      {errors.payroll && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.payroll}
            <Button
              variant="link"
              size="sm"
              onClick={() => clearError('payroll')}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading.payroll && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Generating payroll report...</span>
        </div>
      )}

      {/* Report Content */}
      {!loading.payroll && payrollReport && (
        <>
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Report Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payroll Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderPayrollReport()}
            </CardContent>
          </Card>

          {/* Additional Insights */}
          {payrollReport && payrollReport.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deduction Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Deductions:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(payrollReport.reduce((sum, r) => sum + (parseFloat(r.deductions) || 0), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Allowances:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(payrollReport.reduce((sum, r) => sum + (parseFloat(r.allowances) || 0), 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Paid:</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {payrollReport.filter(r => r.status === 'paid').length} employees
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending:</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {payrollReport.filter(r => r.status !== 'paid').length} employees
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PayrollReportComponent;
