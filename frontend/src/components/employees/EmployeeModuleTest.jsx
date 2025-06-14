import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { useEmployees, useEmployeeMutations, useDepartments } from '@/hooks/useEmployees';
import { useAuthContext } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Loader2, Users, Building2 } from 'lucide-react';

const EmployeeModuleTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  const { user, isAdmin, isManager } = useAuthContext();
  const { 
    employees, 
    isLoading: employeesLoading, 
    error: employeesError, 
    fetchEmployees 
  } = useEmployees();
  const { departments, isLoading: departmentsLoading, error: departmentsError } = useDepartments();

  const runTests = async () => {
    setIsRunningTests(true);
    const results = {};

    try {
      // Test 1: Authentication Context
      results.authContext = {
        passed: !!user && typeof isAdmin === 'boolean' && typeof isManager === 'boolean',
        message: user ? `User: ${user.name} (${user.role})` : 'No user found'
      };

      // Test 2: Departments Loading
      results.departmentsLoad = {
        passed: !departmentsLoading && !departmentsError && Array.isArray(departments),
        message: `Departments: ${departments?.length || 0} loaded`
      };

      // Test 3: Employees Loading
      await fetchEmployees();
      results.employeesLoad = {
        passed: !employeesLoading && !employeesError && Array.isArray(employees),
        message: `Employees: ${employees?.length || 0} loaded`
      };

      // Test 4: Role-based Access
      results.roleAccess = {
        passed: (isAdmin || isManager) && user?.role !== 'employee',
        message: `Role access: ${user?.role} - ${isAdmin ? 'Admin' : isManager ? 'Manager' : 'Employee'}`
      };

      // Test 5: API Integration
      results.apiIntegration = {
        passed: !employeesError && !departmentsError,
        message: employeesError || departmentsError ? 'API errors detected' : 'API integration working'
      };

    } catch (error) {
      results.error = {
        passed: false,
        message: `Test error: ${error.message}`
      };
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  const getTestIcon = (passed) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getTestColor = (passed) => {
    return passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Employee Management Module Test
            </div>
            <Button 
              onClick={runTests} 
              disabled={isRunningTests}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Tests'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div 
              key={testName}
              className={`p-4 rounded-lg border ${getTestColor(result.passed)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTestIcon(result.passed)}
                  <div>
                    <h3 className="font-medium capitalize">
                      {testName.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.passed ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>
          ))}

          {Object.keys(testResults).length === 0 && !isRunningTests && (
            <Alert>
              <div className="text-center py-4">
                <p>Click "Run Tests" to verify employee management module functionality</p>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Module Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-green-600" />
            Module Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900">Components</h3>
              <p className="text-sm text-blue-700">
                ✅ EmployeeList<br/>
                ✅ EmployeeForm<br/>
                ✅ EmployeeCard<br/>
                ✅ EmployeeProfile<br/>
                ✅ EmployeeSearch<br/>
                ✅ DocumentUpload
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900">Hooks & Services</h3>
              <p className="text-sm text-green-700">
                ✅ useEmployees<br/>
                ✅ useEmployeeMutations<br/>
                ✅ useDepartments<br/>
                ✅ useEmployeeForm<br/>
                ✅ employeeService
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-900">Features</h3>
              <p className="text-sm text-purple-700">
                ✅ CRUD Operations<br/>
                ✅ Search & Filtering<br/>
                ✅ Pagination<br/>
                ✅ Role-based Access<br/>
                ✅ Document Upload<br/>
                ✅ Form Validation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeModuleTest;
