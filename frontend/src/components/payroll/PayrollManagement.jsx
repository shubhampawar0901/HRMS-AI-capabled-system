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
  X,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePayroll from '@/hooks/usePayroll';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { employeeService } from '@/services/employeeService';
import { payrollService } from '@/services/payrollService';
import PayrollDetailModal from './PayrollDetailModal';
import SimplifiedPayrollGeneration from './SimplifiedPayrollGeneration';
import PayrollPreviewModal from './PayrollPreviewModal';
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
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [markingAsPaid, setMarkingAsPaid] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            department: emp.departmentName || 'Unknown',
            employeeCode: emp.employeeCode
          }));
          console.log('🔍 Transformed employees:', transformedEmployees);
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

  const handleGeneratePayroll = async (employeeId, month, year) => {
    setGenerating(true);

    try {
      // Call the preview API instead of direct generation
      const response = await payrollService.generatePayrollPreview(employeeId, month, year);

      if (response.success) {
        setPreviewData(response.data);
        setShowGenerateModal(false);
        setShowPreviewModal(true);
        return true;
      } else {
        throw new Error(response.message || 'Failed to generate payroll preview');
      }
    } catch (error) {
      console.error('Generate payroll preview error:', error);

      // Handle specific error types for better UX
      if (error.response?.status === 409) {
        // Duplicate payroll error - show user-friendly message
        const message = error.response.data?.message || 'Payroll already exists for this employee and period.';
        alert(`⚠️ Duplicate Payroll\n\n${message}`);
        return false;
      }

      // Re-throw other errors to be handled by the component
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmPayroll = async (previewData) => {
    try {
      const response = await payrollService.confirmPayroll(
        previewData.employee.id,
        previewData.period.month,
        previewData.period.year,
        previewData.calculations
      );

      if (response.success) {
        setShowPreviewModal(false);
        setPreviewData(null);
        await fetchPayrollRecords();
        // Show success message
        console.log('✅ Payroll confirmed and saved successfully');
      } else {
        throw new Error(response.message || 'Failed to confirm payroll');
      }
    } catch (error) {
      console.error('Confirm payroll error:', error);

      // Handle specific error types
      if (error.response?.status === 409) {
        // Duplicate payroll error during confirmation
        const message = error.response.data?.message || 'Payroll already exists for this employee and period.';
        alert(`⚠️ Cannot Save Payroll\n\n${message}\n\nThe payroll may have been created by another user. Please refresh the page.`);
        return;
      }

      throw error;
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setShowPreviewModal(false);
    setShowGenerateModal(true); // Go back to generation modal
  };

  const handleProcessPayroll = async (payrollId) => {
    setProcessing(payrollId);
    try {
      await processPayroll(payrollId);
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    setMarkingAsPaid(payrollId);
    try {
      const response = await payrollService.markAsPaid(payrollId);
      if (response.success) {
        await fetchPayrollRecords(); // Refresh the list
        console.log('✅ Payroll marked as paid successfully');
      } else {
        throw new Error(response.message || 'Failed to mark payroll as paid');
      }
    } catch (error) {
      console.error('Mark as paid error:', error);
      alert(`❌ Failed to mark payroll as paid\n\n${error.message || 'Please try again.'}`);
    } finally {
      setMarkingAsPaid(null);
    }
  };

  const handleViewPayroll = (payroll) => {
    setSelectedPayroll(payroll);
    setShowPayrollModal(true);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <Card className="group hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] bg-gradient-to-br from-green-50/50 to-green-100/50 border-green-200/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 group-hover:text-green-800 transition-colors duration-200">Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors duration-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 group-hover:text-green-950 transition-colors duration-200">{summaryStats.paidCount}</div>
              <p className="text-xs text-green-600/80 mt-1">Payment completed</p>
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
              onClick={() => setShowGenerateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] border-0 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Payroll
            </Button>
          </div>
        </CardHeader>
        <CardContent>


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

            <Select value={filters.month?.toString() || 'all'} onValueChange={(value) => handleFilterChange('month', value === 'all' ? 'all' : parseInt(value))}>
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
                        <div className="flex flex-col">
                          <span className="font-medium">{payroll.employee_name || 'Unknown'}</span>
                          {payroll.employee_code && (
                            <span className="text-xs text-gray-500">Code: {payroll.employee_code}</span>
                          )}
                        </div>
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
                          {/* View Details Button - Always visible */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayroll(payroll)}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 ease-in-out hover:scale-[1.05] hover:shadow-sm border-gray-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Action Button - Changes based on status */}
                          {canProcessPayroll(payroll, user.role) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcessPayroll(payroll.id)}
                              disabled={processing === payroll.id}
                              className="hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 ease-in-out hover:scale-[1.05] hover:shadow-sm border-gray-200"
                              title="Process Payroll"
                            >
                              {processing === payroll.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          {canMarkAsPaid(payroll, user.role) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(payroll.id)}
                              disabled={markingAsPaid === payroll.id}
                              className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-300 ease-in-out hover:scale-[1.05] hover:shadow-sm border-gray-200"
                              title="Mark as Paid"
                            >
                              {markingAsPaid === payroll.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <DollarSign className="h-4 w-4" />
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

      {/* Payroll Detail Modal */}
      <PayrollDetailModal
        payroll={selectedPayroll}
        isOpen={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
      />

      {/* Simplified Payroll Generation Modal */}
      <SimplifiedPayrollGeneration
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGeneratePayroll}
      />

      {/* Payroll Preview Modal */}
      <PayrollPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        previewData={previewData}
        onConfirm={handleConfirmPayroll}
        onCancel={handleCancelPreview}
      />
    </div>
  );
};

export default PayrollManagement;
