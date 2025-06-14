import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  FileText,
  Users,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePayroll from '@/hooks/usePayroll';
import EmployeeSelector from './EmployeeSelector';
import PayslipList from './PayslipList';
import SalaryBreakdown from './SalaryBreakdown';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { formatCurrency } from '@/utils/payrollUtils';

const AdminPayrollView = () => {
  const { user } = useAuth();
  const {
    payslips,
    salaryStructure,
    loading,
    error,
    fetchEmployeePayrollByAdmin,
    fetchSalaryStructure,
    clearError
  } = usePayroll();

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('selector');

  // Handle employee selection
  const handleEmployeeSelect = async (employee) => {
    setSelectedEmployee(employee);
    clearError();
    
    if (employee) {
      setActiveTab('payslips');
      // Fetch payroll data for selected employee
      try {
        await Promise.all([
          fetchEmployeePayrollByAdmin(employee.id),
          fetchSalaryStructure(employee.id)
        ]);
      } catch (error) {
        console.error('Error fetching employee payroll data:', error);
      }
    } else {
      setActiveTab('selector');
    }
  };

  // Security check
  if (user?.role !== 'admin') {
    return (
      <Card className="border-red-200">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Access Restricted</h3>
          <p className="text-red-600">
            Admin payroll view is only available to administrators for security and privacy reasons.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderEmployeePayrollSummary = () => {
    if (!selectedEmployee) return null;

    const currentMonthPayslip = payslips?.find(payslip => {
      const now = new Date();
      return payslip.month === now.getMonth() + 1 && payslip.year === now.getFullYear();
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Current Month Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {currentMonthPayslip ? formatCurrency(currentMonthPayslip.netSalary) : 'Not Generated'}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {selectedEmployee.first_name} {selectedEmployee.last_name}
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
            <p className="text-xs text-green-600 mt-1">Available records</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Basic Salary</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {salaryStructure ? formatCurrency(salaryStructure.basicSalary) : 'Loading...'}
            </div>
            <p className="text-xs text-purple-600 mt-1">Monthly basic pay</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Admin Payroll Management
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage payroll information for all employees
          </p>
        </div>
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Admin Access
        </Badge>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This section contains sensitive financial information. Access is restricted to administrators only.
          All actions are logged for security purposes.
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="link"
              size="sm"
              onClick={clearError}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="selector" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            <Users className="h-4 w-4 mr-2" />
            Select Employee
          </TabsTrigger>
          <TabsTrigger 
            value="payslips"
            disabled={!selectedEmployee}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            <FileText className="h-4 w-4 mr-2" />
            Payslips
          </TabsTrigger>
          <TabsTrigger 
            value="salary"
            disabled={!selectedEmployee}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Salary Structure
          </TabsTrigger>
        </TabsList>

        {/* Employee Selector Tab */}
        <TabsContent value="selector" className="space-y-6">
          <EmployeeSelector 
            onEmployeeSelect={handleEmployeeSelect}
            selectedEmployee={selectedEmployee}
          />
        </TabsContent>

        {/* Payslips Tab */}
        <TabsContent value="payslips" className="space-y-6">
          {selectedEmployee && (
            <>
              {/* Employee Summary */}
              {renderEmployeePayrollSummary()}
              
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" text="Loading payroll data..." />
                </div>
              )}

              {/* Payslips List */}
              {!loading && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Payslips for {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PayslipList employeeId={selectedEmployee.id} />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Salary Structure Tab */}
        <TabsContent value="salary" className="space-y-6">
          {selectedEmployee && (
            <>
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" text="Loading salary structure..." />
                </div>
              )}

              {/* Salary Breakdown */}
              {!loading && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Salary Structure for {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SalaryBreakdown employeeId={selectedEmployee.id} />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayrollView;
