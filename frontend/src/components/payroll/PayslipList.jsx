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
  Download, 
  Eye, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import usePayroll from '@/hooks/usePayroll';
import PayslipViewer from './PayslipViewer';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { 
  formatCurrency, 
  formatPayrollPeriod, 
  getPayrollStatusColor, 
  getPayrollStatusText,
  getMonthOptions,
  getYearOptions
} from '@/utils/payrollUtils';

const PayslipList = () => {
  const { user, isAdmin, isEmployee } = useAuth();
  const {
    payrollRecords,
    payslips,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    updatePagination,
    downloadPayslip,
    fetchPayslip
  } = usePayroll();

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showPayslipViewer, setShowPayslipViewer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState(null);

  // Get the appropriate data based on user role
  const payrollData = isEmployee ? payslips : payrollRecords;

  // Filter data based on search term
  const filteredData = payrollData?.filter(item => {
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

  const handleViewPayslip = async (payroll) => {
    const payslipData = await fetchPayslip(payroll.id);
    if (payslipData) {
      setSelectedPayslip(payslipData);
      setShowPayslipViewer(true);
    }
  };

  const handleDownloadPayslip = async (payroll) => {
    setDownloading(payroll.id);
    try {
      await downloadPayslip(payroll.id);
    } finally {
      setDownloading(null);
    }
  };

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value });
  };

  const handlePageChange = (newPage) => {
    updatePagination({ page: newPage });
  };

  if (loading && !payrollData?.length) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="lg" text="Loading payslips..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search payslips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Year Filter */}
            <Select value={filters.year?.toString()} onValueChange={(value) => handleFilterChange('year', parseInt(value))}>
              <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-blue-500">
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

            {/* Month Filter */}
            <Select value={filters.month?.toString() || 'all'} onValueChange={(value) => handleFilterChange('month', value === 'all' ? null : parseInt(value))}>
              <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-blue-500">
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

            {/* Status Filter (Admin only) */}
            {isAdmin && (
              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? null : value)}>
                <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payslips Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            {isEmployee ? 'My Payslips' : 'All Payslips'}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredData.length} {filteredData.length === 1 ? 'record' : 'records'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">📄 No payslips found</div>
              <p className="text-gray-400">
                {searchTerm ? 'Try adjusting your search criteria' : 'No payslips available for the selected period'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-50">
                      {isAdmin && <TableHead className="font-semibold">Employee</TableHead>}
                      <TableHead className="font-semibold">Period</TableHead>
                      <TableHead className="font-semibold">Gross Salary</TableHead>
                      <TableHead className="font-semibold">Deductions</TableHead>
                      <TableHead className="font-semibold">Net Salary</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((payroll) => (
                      <TableRow 
                        key={payroll.id} 
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        {isAdmin && (
                          <TableCell className="font-medium">
                            {payroll.employeeName || payroll.employee?.name || 'Unknown'}
                          </TableCell>
                        )}
                        <TableCell>
                          {formatPayrollPeriod(payroll.month, payroll.year)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payroll.grossSalary)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(payroll.totalDeductions)}
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewPayslip(payroll)}
                              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPayslip(payroll)}
                              disabled={downloading === payroll.id}
                              className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                            >
                              {downloading === payroll.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="hover:bg-gray-50 transition-all duration-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="hover:bg-gray-50 transition-all duration-300"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payslip Viewer Modal */}
      {showPayslipViewer && selectedPayslip && (
        <PayslipViewer
          payslip={selectedPayslip}
          onClose={() => {
            setShowPayslipViewer(false);
            setSelectedPayslip(null);
          }}
        />
      )}
    </div>
  );
};

export default PayslipList;
