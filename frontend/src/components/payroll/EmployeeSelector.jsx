import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Building, UserCheck, Loader2 } from 'lucide-react';
import { payrollService } from '@/services/payrollService';
import { employeeService } from '@/services/employeeService';

const EmployeeSelector = ({ onEmployeeSelect, selectedEmployee, className = '' }) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Fetch employees and departments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [employeesResponse, departmentsResponse] = await Promise.all([
          employeeService.getEmployees({ limit: 1000 }), // Get all employees
          employeeService.getDepartments()
        ]);

        if (employeesResponse.success) {
          setEmployees(employeesResponse.data.employees || []);
        }

        if (departmentsResponse.success) {
          setDepartments(departmentsResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter employees based on search and department
  useEffect(() => {
    let filtered = employees;

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(emp => emp.department_id?.toString() === selectedDepartment);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.first_name?.toLowerCase().includes(term) ||
        emp.last_name?.toLowerCase().includes(term) ||
        emp.employee_code?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term)
      );
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, selectedDepartment]);

  const handleEmployeeSelect = useCallback((employee) => {
    onEmployeeSelect(employee);
  }, [onEmployeeSelect]);

  const clearSelection = useCallback(() => {
    onEmployeeSelect(null);
    setSearchTerm('');
    setSelectedDepartment('');
  }, [onEmployeeSelect]);

  const renderEmployeeCard = (employee) => (
    <Card 
      key={employee.id}
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
        selectedEmployee?.id === employee.id 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={() => handleEmployeeSelect(employee)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h3>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Code: {employee.employee_code}</div>
              <div>Email: {employee.email}</div>
              <div>Department: {employee.department_name || 'N/A'}</div>
              <div>Position: {employee.position || 'N/A'}</div>
            </div>
          </div>
          {selectedEmployee?.id === employee.id && (
            <Badge variant="default" className="bg-blue-600">
              Selected
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Employee
        </CardTitle>
        <p className="text-sm text-gray-600">
          Choose an employee to view their payroll information
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Employee Display */}
        {selectedEmployee && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </h4>
                <p className="text-sm text-blue-700">
                  {selectedEmployee.employee_code} • {selectedEmployee.department_name}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSelection}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                Change
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, code, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <Building className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employee List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading employees...</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(renderEmployeeCard)
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No employees found</p>
                {(searchTerm || selectedDepartment) && (
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDepartment('');
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredEmployees.length} of {employees.length} employees
            </span>
            {selectedEmployee && (
              <Badge variant="outline" className="text-green-600 border-green-300">
                Employee Selected
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeSelector;
