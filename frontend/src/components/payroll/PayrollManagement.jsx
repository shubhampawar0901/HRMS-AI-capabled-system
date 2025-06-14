import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePayroll from '@/hooks/usePayroll';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
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
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [processing, setProcessing] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Mock employees data - in real app, this would come from employee service
  const employees = [
    { id: 1, name: 'John Doe', department: 'IT', employeeCode: 'EMP001' },
    { id: 2, name: 'Jane Smith', department: 'HR', employeeCode: 'EMP002' },
    { id: 3, name: 'Mike Johnson', department: 'Finance', employeeCode: 'EMP003' }
  ];

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
          employeeId: '',
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
      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Records</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{summaryStats.totalRecords}</div>
              <p className="text-xs text-blue-600 mt-1">Payroll records</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Draft</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{summaryStats.draftCount}</div>
              <p className="text-xs text-yellow-600 mt-1">Pending processing</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Processed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{summaryStats.processedCount}</div>
              <p className="text-xs text-green-600 mt-1">Ready for payment</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(summaryStats.totalAmount)}</div>
              <p className="text-xs text-purple-600 mt-1">Net payroll</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions and Filters */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Payroll Management
            </CardTitle>
            <Button
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Payroll
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Generate Payroll Form */}
          {showGenerateForm && (
            <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-4">Generate New Payroll</h4>
              <form onSubmit={handleGeneratePayroll} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select 
                  value={generateForm.employeeId.toString()} 
                  onValueChange={(value) => setGenerateForm(prev => ({ ...prev, employeeId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name} ({emp.employeeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={generateForm.month.toString()} 
                  onValueChange={(value) => setGenerateForm(prev => ({ ...prev, month: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Month" />
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
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
                  className="bg-green-600 hover:bg-green-700"
                >
                  {generating ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
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
              <SelectTrigger>
                <SelectValue placeholder="Select Month" />
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
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
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
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Payroll Records
            <span className="text-sm font-normal text-gray-500 ml-2">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Period</TableHead>
                    <TableHead className="font-semibold">Gross Salary</TableHead>
                    <TableHead className="font-semibold">Net Salary</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((payroll) => (
                    <TableRow key={payroll.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <TableCell className="font-medium">
                        {payroll.employeeName || payroll.employee?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {formatPayrollPeriod(payroll.month, payroll.year)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
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
                              className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
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
