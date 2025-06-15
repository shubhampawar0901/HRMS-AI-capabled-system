import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Plus,
  Settings,
  CheckCircle,
  DollarSign,
  Search,
  Filter,
  AlertCircle,
  Users,
  Calendar,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePayroll from '@/hooks/usePayroll';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { employeeService } from '@/services/employeeService';
import {
  formatCurrency,
  formatPayrollPeriod,
  getPayrollStatusColor,
  getPayrollStatusText,
  getMonthOptions,
  getYearOptions,
  canProcessPayroll,
  canMarkAsPaid
} from '@/utils/payrollUtils';

const PayrollManagement = () => {
  const { user, isAdmin } = useAuth();
  const {
    payrollRecords,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    generatePayroll,
    processPayroll,
    fetchPayrollRecords
  } = usePayroll();

  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    employeeId: null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [processing, setProcessing] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch employees for payroll generation
  React.useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const response = await employeeService.getEmployees({ limit: 100, status: 'active' });
        if (response.success) {
          const employeeList = response.data.employees || [];
          // Transform to match expected format
          const transformedEmployees = employeeList.map(emp => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department_name || 'Unknown',
            employeeCode: emp.employee_code
          }));
          setEmployees(transformedEmployees);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  // Filter data based on search term
  const filteredData = payrollRecords?.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const employeeName = item.employeeName || item.employee?.name || '';
    const period = formatPayrollPeriod(item.month, item.year);
    
    return (
      employeeName.toLowerCase().includes(searchLower) ||
      period.toLowerCase().includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    setGenerating(true);
    
    try {
      const success = await generatePayroll(
        generateForm.employeeId,
        generateForm.month,
        generateForm.year
      );
      
      if (success) {
        setShowGenerateForm(false);
        setGenerateForm({
          employeeId: null,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        });
        await fetchPayrollRecords();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleProcessPayroll = async (payrollId) => {
    setProcessing(payrollId);
    try {
      await processPayroll(payrollId);
    } finally {
      setProcessing(null);
    }
  };

  const handleFilterChange = (key, value) => {
    console.log('🔍 Filter change:', key, '=', value);
    if (key === 'month' && value === null) {
      console.log('🔍 "All Months" selected');
    }
    updateFilters({ [key]: value });
  };

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    if (!payrollRecords?.length) return null;

    const totalRecords = payrollRecords.length;
    const draftCount = payrollRecords.filter(r => r.status === 'draft').length;
    const processedCount = payrollRecords.filter(r => r.status === 'processed').length;
    const paidCount = payrollRecords.filter(r => r.status === 'paid').length;
    const totalAmount = payrollRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);

    return {
      totalRecords,
      draftCount,
      processedCount,
      paidCount,
      totalAmount
    };
  }, [payrollRecords]);

  if (!isAdmin) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Access Denied</h3>
            <p className="text-red-600">You don't have permission to manage payroll.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !payrollRecords?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading payroll management..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="group hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] bg-gradient-to-br from-blue-50/50 to-blue-100/50 border-blue-200/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 group-hover:text-blue-800 transition-colors duration-200">Total Records</CardTitle>
              <Users className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 group-hover:text-blue-950 transition-colors duration-200">{summaryStats.totalRecords}</div>
              <p className="text-xs text-blue-600/80 mt-1">Payroll records</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] bg-gradient-to-br from-amber-50/50 to-amber-100/50 border-amber-200/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 group-hover:text-amber-800 transition-colors duration-200">Draft</CardTitle>
              <Calendar className="h-4 w-4 text-amber-600 group-hover:text-amber-700 transition-colors duration-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 group-hover:text-amber-950 transition-colors duration-200">{summaryStats.draftCount}</div>
              <p className="text-xs text-amber-600/80 mt-1">Pending processing</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 border-emerald-200/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors duration-200">Processed</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900 group-hover:text-emerald-950 transition-colors duration-200">{summaryStats.processedCount}</div>
              <p className="text-xs text-emerald-600/80 mt-1">Ready for payment</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions and Filters */}
      <Card className="border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Payroll Management
            </CardTitle>
            <Button
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] border-0 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Payroll
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Generate Payroll Form */}
          {showGenerateForm && (
            <div className="mb-6 p-6 border border-blue-200/60 rounded-xl bg-gradient-to-br from-blue-50/50 to-blue-100/30 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Generate New Payroll
              </h4>
              <form onSubmit={handleGeneratePayroll} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  value={generateForm.employeeId?.toString() || ''}
                  onValueChange={(value) => setGenerateForm(prev => ({ ...prev, employeeId: parseInt(value) }))}
                  disabled={loadingEmployees}
                >
                  <SelectTrigger className="shadow-sm hover:shadow-md transition-all duration-300">
                    <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Choose an employee for payroll generation..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingEmployees ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          Loading employees...
                        </div>
                      </SelectItem>
                    ) : employees.length > 0 ? (
                      employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {emp.name?.charAt(0)?.toUpperCase() || 'E'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{emp.name}</div>
                              <div className="text-xs text-gray-500">Code: {emp.employeeCode}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-employees" disabled>
                        <div className="flex items-center gap-2 text-gray-500">
                          <span>⚠️</span>
                          No employees found
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={generateForm.month.toString()}
                  onValueChange={(value) => setGenerateForm(prev => ({ ...prev, month: parseInt(value) }))}
                >
                  <SelectTrigger className="shadow-sm hover:shadow-md transition-all duration-300">
                    <SelectValue placeholder="Choose month..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={generateForm.year.toString()}
                  onValueChange={(value) => setGenerateForm(prev => ({ ...prev, year: parseInt(value) }))}
                >
                  <SelectTrigger className="shadow-sm hover:shadow-md transition-all duration-300">
                    <SelectValue placeholder="Choose year..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getYearOptions().map(year => (
                      <SelectItem key={year.value} value={year.value.toString()}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  disabled={!generateForm.employeeId || generating}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {generating ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search payroll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.year?.toString()} onValueChange={(value) => handleFilterChange('year', parseInt(value))}>
              <SelectTrigger className="shadow-sm hover:shadow-md transition-all duration-300">
                <SelectValue placeholder="Filter by year..." />
              </SelectTrigger>
              <SelectContent>
                {getYearOptions().map(year => (
                  <SelectItem key={year.value} value={year.value.toString()}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.month?.toString() || 'all'} onValueChange={(value) => handleFilterChange('month', value === 'all' ? null : parseInt(value))}>
              <SelectTrigger className="shadow-sm hover:shadow-md transition-all duration-300">
                <SelectValue placeholder="Filter by month..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {getMonthOptions().map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? null : value)}>
              <SelectTrigger className="shadow-sm hover:shadow-md transition-all duration-300">
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Records Table */}
      <Card className="border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              Payroll Records
            </div>
            <span className="text-sm font-normal text-gray-500">
              ({filteredData.length} {filteredData.length === 1 ? 'record' : 'records'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">📄 No payroll records found</div>
              <p className="text-gray-400">
                {searchTerm ? 'Try adjusting your search criteria' : 'No payroll records available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold min-w-[150px]">Employee</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Period</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Gross Salary</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Net Salary</TableHead>
                    <TableHead className="font-semibold min-w-[100px]">Status</TableHead>
                    <TableHead className="font-semibold text-center min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((payroll) => (
                    <TableRow key={payroll.id} className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/30 transition-all duration-300 ease-in-out hover:shadow-sm">
                      <TableCell className="font-medium text-gray-900">
                        {payroll.employeeName || payroll.employee?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatPayrollPeriod(payroll.month, payroll.year)}
                      </TableCell>
                      <TableCell className="font-medium text-emerald-600">
                        {formatCurrency(payroll.grossSalary)}
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">
                        {formatCurrency(payroll.netSalary)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPayrollStatusColor(payroll.status)}>
                          {getPayrollStatusText(payroll.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          {canProcessPayroll(payroll, user.role) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcessPayroll(payroll.id)}
                              disabled={processing === payroll.id}
                              className="hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 ease-in-out hover:scale-[1.05] hover:shadow-sm border-gray-200"
                            >
                              {processing === payroll.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollManagement;
