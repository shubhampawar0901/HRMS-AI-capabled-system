import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/hooks/useAuth';
import { employeeService } from '@/services/employeeService';

const ReportFilters = () => {
  const { user } = useAuth();
  const { 
    reportFilters, 
    setReportFilters, 
    selectedReportType,
    availableReports 
  } = useReports();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load departments and employees for filters
  useEffect(() => {
    const loadFilterData = async () => {
      setLoading(true);
      try {
        if (user?.role === 'admin' || user?.role === 'manager') {
          const [deptResponse, empResponse] = await Promise.all([
            employeeService.getDepartments(),
            employeeService.getEmployees({ limit: 100 })
          ]);
          
          setDepartments(deptResponse.data || []);
          setEmployees(empResponse.data?.employees || []);
        }
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterData();
  }, [user?.role]);

  const handleFilterChange = (key, value) => {
    setReportFilters({ [key]: value });
  };

  const clearFilters = () => {
    setReportFilters({
      startDate: null,
      endDate: null,
      departmentId: null,
      employeeId: null
    });
  };

  const getDefaultDateRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    };
  };

  const setDefaultDateRange = () => {
    const { start, end } = getDefaultDateRange();
    setReportFilters({
      startDate: start,
      endDate: end
    });
  };

  const selectedReport = availableReports.find(r => r.id === selectedReportType);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>🔍</span>
          Report Filters
        </CardTitle>
        {selectedReport && (
          <p className="text-sm text-gray-600">
            Filtering: {selectedReport.name}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label htmlFor="startDate" className="text-xs text-gray-500">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={reportFilters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-xs text-gray-500">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={reportFilters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={setDefaultDateRange}
            className="w-full text-xs"
          >
            This Month
          </Button>
        </div>

        {/* Department Filter (Admin/Manager only) */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Department</Label>
            <Select
              value={reportFilters.departmentId || ''}
              onValueChange={(value) => handleFilterChange('departmentId', value || null)}
            >
              <SelectTrigger className="text-sm">
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
        )}

        {/* Employee Filter (Admin only) */}
        {user?.role === 'admin' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Employee</Label>
            <Select
              value={reportFilters.employeeId || ''}
              onValueChange={(value) => handleFilterChange('employeeId', value || null)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Report Type Specific Filters */}
        {selectedReportType === 'payroll' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payroll Period</Label>
            <Select
              value={reportFilters.month || ''}
              onValueChange={(value) => handleFilterChange('month', value || null)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Current Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  const monthName = new Date(2024, i, 1).toLocaleString('default', { month: 'long' });
                  return (
                    <SelectItem key={month} value={month.toString()}>
                      {monthName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedReportType === 'performance' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Review Year</Label>
            <Select
              value={reportFilters.year || ''}
              onValueChange={(value) => handleFilterChange('year', value || null)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Current Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="w-full text-xs"
          >
            Clear Filters
          </Button>
        </div>

        {/* Filter Summary */}
        {(reportFilters.startDate || reportFilters.endDate || reportFilters.departmentId || reportFilters.employeeId) && (
          <div className="pt-4 border-t">
            <Label className="text-xs font-medium text-gray-500">Active Filters:</Label>
            <div className="mt-2 space-y-1">
              {reportFilters.startDate && (
                <div className="text-xs text-gray-600">
                  From: {new Date(reportFilters.startDate).toLocaleDateString()}
                </div>
              )}
              {reportFilters.endDate && (
                <div className="text-xs text-gray-600">
                  To: {new Date(reportFilters.endDate).toLocaleDateString()}
                </div>
              )}
              {reportFilters.departmentId && (
                <div className="text-xs text-gray-600">
                  Department: {departments.find(d => d.id.toString() === reportFilters.departmentId)?.name}
                </div>
              )}
              {reportFilters.employeeId && (
                <div className="text-xs text-gray-600">
                  Employee: {employees.find(e => e.id.toString() === reportFilters.employeeId)?.first_name} {employees.find(e => e.id.toString() === reportFilters.employeeId)?.last_name}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportFilters;
