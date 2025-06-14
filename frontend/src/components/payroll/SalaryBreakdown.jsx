import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart,
  User,
  Building,
  Calculator
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePayroll from '@/hooks/usePayroll';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { 
  formatCurrency, 
  calculateSalaryBreakdown, 
  calculateDeductionBreakdown,
  formatEmployeeName
} from '@/utils/payrollUtils';

const SalaryBreakdown = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const { 
    salaryStructure, 
    loading, 
    error, 
    fetchSalaryStructure 
  } = usePayroll();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employees, setEmployees] = useState([]);

  // For admin/manager: fetch employees list
  useEffect(() => {
    if (isAdmin || isManager) {
      // This would typically come from an employee service
      // For now, we'll use a placeholder
      setEmployees([
        { id: 1, name: 'John Doe', department: 'IT' },
        { id: 2, name: 'Jane Smith', department: 'HR' },
        { id: 3, name: 'Mike Johnson', department: 'Finance' }
      ]);
    }
  }, [isAdmin, isManager]);

  const handleEmployeeSelect = async (employeeId) => {
    setSelectedEmployeeId(employeeId);
    await fetchSalaryStructure(employeeId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading salary structure..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error Loading Salary Structure</div>
            <p className="text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earningsBreakdown = salaryStructure ? calculateSalaryBreakdown(salaryStructure) : [];
  const deductionsBreakdown = salaryStructure ? calculateDeductionBreakdown(salaryStructure) : [];

  const SimpleChart = ({ data, title, type = 'earnings' }) => {
    const colors = type === 'earnings' 
      ? ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
      : ['#EF4444', '#F97316'];

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          {title}
        </h4>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Employee Selection (Admin/Manager only) */}
      {(isAdmin || isManager) && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Employee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEmployeeId?.toString()} onValueChange={(value) => handleEmployeeSelect(parseInt(value))}>
              <SelectTrigger className="w-full md:w-1/3 transition-all duration-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name} - {employee.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {salaryStructure ? (
        <>
          {/* Employee Info */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Employee Name</p>
                  <p className="font-semibold text-blue-900">{salaryStructure.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Employee Code</p>
                  <p className="font-semibold text-blue-900">{salaryStructure.employeeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Basic Salary</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(salaryStructure.basicSalary)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Gross Salary</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(salaryStructure.grossSalary)}
                </div>
                <p className="text-xs text-green-600 mt-1">Before deductions</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Total Deductions</CardTitle>
                <Calculator className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">
                  {formatCurrency(salaryStructure.totalDeductions)}
                </div>
                <p className="text-xs text-red-600 mt-1">Total deducted</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Net Salary</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(salaryStructure.netSalary)}
                </div>
                <p className="text-xs text-blue-600 mt-1">Take home amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Breakdown */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-green-800">Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(salaryStructure.allowances || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-green-200 last:border-b-0">
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-gray-700">Basic Salary</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(salaryStructure.basicSalary)}
                    </span>
                  </div>
                </div>
                {earningsBreakdown.length > 0 && (
                  <div className="mt-6">
                    <SimpleChart data={earningsBreakdown} title="Earnings Distribution" type="earnings" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deductions Breakdown */}
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-red-800">Deductions Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(salaryStructure.deductions || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-red-200 last:border-b-0">
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold text-red-700">
                        {formatCurrency(value)}
                      </span>
                    </div>
                  ))}
                </div>
                {deductionsBreakdown.length > 0 && (
                  <div className="mt-6">
                    <SimpleChart data={deductionsBreakdown} title="Deductions Distribution" type="deductions" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">📊 No Salary Structure Available</div>
              <p className="text-gray-400">
                {isEmployee 
                  ? 'Your salary structure is not available at the moment'
                  : 'Please select an employee to view their salary structure'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalaryBreakdown;
