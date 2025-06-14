import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  FileText, 
  Users, 
  TrendingUp,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePayroll from '@/hooks/usePayroll';
import PayslipList from './PayslipList';
import SalaryBreakdown from './SalaryBreakdown';
import PayrollManagement from './PayrollManagement';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import AuthRefreshPrompt from '@/components/common/AuthRefreshPrompt';
import { formatCurrency, formatPayrollPeriod } from '@/utils/payrollUtils';

const PayrollDashboard = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const {
    payrollRecords,
    payslips,
    salaryStructure,
    loading,
    error,
    canManagePayroll,
    canViewTeamPayroll
  } = usePayroll();

  const [activeTab, setActiveTab] = useState(() => {
    if (isEmployee) return 'overview';
    if (isAdmin) return 'management';
    return 'overview';
  });

  // Get current month payslip for employee
  const currentMonthPayslip = payslips?.find(payslip => {
    const now = new Date();
    return payslip.month === now.getMonth() + 1 && payslip.year === now.getFullYear();
  });

  // Calculate summary stats for admin
  const summaryStats = React.useMemo(() => {
    if (!payrollRecords?.length) return null;

    const totalRecords = payrollRecords.length;
    const totalGross = payrollRecords.reduce((sum, record) => sum + (record.grossSalary || 0), 0);
    const totalNet = payrollRecords.reduce((sum, record) => sum + (record.netSalary || 0), 0);
    const processedCount = payrollRecords.filter(record => record.status === 'processed' || record.status === 'paid').length;

    return {
      totalRecords,
      totalGross,
      totalNet,
      processedCount,
      processingRate: totalRecords > 0 ? (processedCount / totalRecords * 100).toFixed(1) : 0
    };
  }, [payrollRecords]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading payroll data..." />
      </div>
    );
  }

  // Check if user needs to refresh authentication (missing employeeId)
  const needsAuthRefresh = (isEmployee || isManager) && user && !user.employeeId && !user.employee?.id;

  if (error) {
    return (
      <div className="space-y-4">
        {needsAuthRefresh && error.includes('Employee ID is required') && (
          <AuthRefreshPrompt message="Your session is missing employee information. Please logout and login again to access payroll features." />
        )}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-600 mb-2">⚠️ Error Loading Payroll Data</div>
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderEmployeeOverview = () => (
    <div className="space-y-6">
      {/* Current Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Current Month</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {currentMonthPayslip ? formatCurrency(currentMonthPayslip.netSalary) : 'Not Generated'}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {formatPayrollPeriod(new Date().getMonth() + 1, new Date().getFullYear())}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Payslips</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{payslips?.length || 0}</div>
            <p className="text-xs text-green-600 mt-1">Available for download</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Basic Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {salaryStructure ? formatCurrency(salaryStructure.basicSalary) : 'Loading...'}
            </div>
            <p className="text-xs text-purple-600 mt-1">Monthly basic pay</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {currentMonthPayslip && (
              <Button 
                variant="outline" 
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                onClick={() => setActiveTab('payslips')}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Current Payslip
              </Button>
            )}
            <Button 
              variant="outline"
              className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
              onClick={() => setActiveTab('salary')}
            >
              <Settings className="h-4 w-4 mr-2" />
              View Salary Structure
            </Button>
            <Button 
              variant="outline"
              className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
              onClick={() => setActiveTab('payslips')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Payslips
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminOverview = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{summaryStats.totalRecords}</div>
              <p className="text-xs text-blue-600 mt-1">Payroll records</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Gross</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(summaryStats.totalGross)}</div>
              <p className="text-xs text-green-600 mt-1">Gross salary</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Net</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(summaryStats.totalNet)}</div>
              <p className="text-xs text-purple-600 mt-1">Net salary</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Processing Rate</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{summaryStats.processingRate}%</div>
              <p className="text-xs text-orange-600 mt-1">{summaryStats.processedCount} processed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
              onClick={() => setActiveTab('management')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Payroll
            </Button>
            <Button 
              variant="outline"
              className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
              onClick={() => setActiveTab('payslips')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Payslips
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {needsAuthRefresh && (
        <AuthRefreshPrompt message="Your session is missing employee information. Please logout and login again to access all payroll features." />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">
            {isEmployee && "View your payslips and salary information"}
            {isManager && "View team payroll information"}
            {isAdmin && "Manage payroll for all employees"}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {user?.role?.toUpperCase()} ACCESS
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="payslips"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            Payslips
          </TabsTrigger>
          <TabsTrigger 
            value="salary"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            Salary Structure
          </TabsTrigger>
          {canManagePayroll && (
            <TabsTrigger 
              value="management"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
            >
              Management
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isEmployee ? renderEmployeeOverview() : renderAdminOverview()}
        </TabsContent>

        <TabsContent value="payslips" className="space-y-6">
          <PayslipList />
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <SalaryBreakdown />
        </TabsContent>

        {canManagePayroll && (
          <TabsContent value="management" className="space-y-6">
            <PayrollManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PayrollDashboard;
