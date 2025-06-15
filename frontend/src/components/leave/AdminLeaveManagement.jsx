import React, { useState, useEffect } from 'react';
import { useLeave } from '@/hooks/useLeave';
import { employeeService } from '@/services/employeeService';
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
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

const AdminLeaveManagement = () => {
  const {
    teamApplications,
    isLoading,
    error,
    loadTeamApplications,
    processApplication,
    clearError,
    leaveTypes,
    loadLeaveTypes
  } = useLeave();

  const [filters, setFilters] = useState({
    status: 'all',
    leaveType: 'all',
    search: '',
    page: 1,
    limit: 10
  });

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processAction, setProcessAction] = useState('');
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Load employees data
  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const response = await employeeService.getAllEmployees();
      if (response && response.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadLeaveTypes();
    loadEmployees();
    loadTeamApplications(filters);
  }, [loadLeaveTypes, loadTeamApplications]);

  // Reload data when filters change
  useEffect(() => {
    loadTeamApplications(filters);
  }, [filters, loadTeamApplications]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleProcessApplication = async (application, action) => {
    setSelectedApplication(application);
    setProcessAction(action);
    setShowProcessModal(true);
  };

  const confirmProcessApplication = async () => {
    if (!selectedApplication || !processAction) return;

    setIsProcessing(true);
    try {
      await processApplication(selectedApplication.id, processAction, comments);
      setShowProcessModal(false);
      setSelectedApplication(null);
      setProcessAction('');
      setComments('');
      // Reload data to reflect changes
      loadTeamApplications(filters);
    } catch (error) {
      console.error('Failed to process application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Helper function to get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      return `${employee.firstName} ${employee.lastName}`.trim();
    }
    return `Employee ${employeeId}`;
  };

  // Helper function to get leave type name by ID
  const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.find(type => type.id === leaveTypeId);
    return leaveType ? leaveType.name : 'Unknown Leave Type';
  };

  if (error) {
    return (
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Leave Data</h3>
              <p className="text-gray-600 mb-4">{typeof error === 'string' ? error : error?.message || 'An unexpected error occurred'}</p>
              <Button 
                onClick={() => {
                  clearError();
                  loadTeamApplications(filters);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Filters and Search */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by employee name, leave type..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-[140px] border-gray-300 focus:border-purple-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Leave Type Filter */}
              <Select value={filters.leaveType} onValueChange={(value) => handleFilterChange('leaveType', value)}>
                <SelectTrigger className="w-[140px] border-gray-300 focus:border-purple-500">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Refresh Button */}
              <Button
                onClick={() => loadTeamApplications(filters)}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Applications Table */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Loading Leave Applications</h3>
              <p className="text-gray-600">Please wait while we fetch the data...</p>
            </div>
          ) : teamApplications?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Employee</TableHead>
                    <TableHead className="font-semibold text-gray-900">Leave Type</TableHead>
                    <TableHead className="font-semibold text-gray-900">Duration</TableHead>
                    <TableHead className="font-semibold text-gray-900">Start Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">End Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Days</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Applied</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamApplications.map((application) => (
                    <TableRow
                      key={application.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-purple-600">
                              {application.employeeName?.charAt(0) || application.employeeId?.toString().charAt(0) || 'E'}
                            </span>
                          </div>
                          <div className="font-medium text-gray-900">
                            {application.employeeName || `Employee ${application.employeeId}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                          {application.leaveTypeName || application.leaveType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {calculateDuration(application.startDate, application.endDate)} days
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(application.startDate)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(application.endDate)}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {application.totalDays || calculateDuration(application.startDate, application.endDate)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getStatusColor(application.status)} capitalize`}>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(application.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          {application.status === 'pending' ? (
                            <>
                              <Button
                                onClick={() => handleProcessApplication(application, 'approve')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 transform hover:scale-105"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleProcessApplication(application, 'reject')}
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => setSelectedApplication(application)}
                              size="sm"
                              variant="outline"
                              className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Applications Found</h3>
              <p className="text-gray-600">
                No leave applications match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {teamApplications?.pagination && teamApplications.pagination.pages > 1 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((teamApplications.pagination.page - 1) * teamApplications.pagination.limit) + 1} to{' '}
                {Math.min(teamApplications.pagination.page * teamApplications.pagination.limit, teamApplications.pagination.total)} of{' '}
                {teamApplications.pagination.total} applications
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePageChange(teamApplications.pagination.page - 1)}
                  disabled={teamApplications.pagination.page <= 1}
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm font-medium text-gray-700 px-3">
                  Page {teamApplications.pagination.page} of {teamApplications.pagination.pages}
                </span>

                <Button
                  onClick={() => handlePageChange(teamApplications.pagination.page + 1)}
                  disabled={teamApplications.pagination.page >= teamApplications.pagination.pages}
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Application Modal */}
      {showProcessModal && selectedApplication && (
        <div className="hrms-modal-overlay">
          <Card className="hrms-modal-content w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">
                {processAction === 'approve' ? 'Approve' : 'Reject'} Leave Application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Employee:</strong> {selectedApplication.employeeName}</div>
                  <div><strong>Leave Type:</strong> {selectedApplication.leaveTypeName || selectedApplication.leaveType}</div>
                  <div><strong>Duration:</strong> {formatDate(selectedApplication.startDate)} to {formatDate(selectedApplication.endDate)}</div>
                  <div><strong>Days:</strong> {selectedApplication.totalDays || calculateDuration(selectedApplication.startDate, selectedApplication.endDate)}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments {processAction === 'reject' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={`Add comments for ${processAction}ing this application...`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-200 resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button
                onClick={() => {
                  setShowProcessModal(false);
                  setSelectedApplication(null);
                  setProcessAction('');
                  setComments('');
                }}
                variant="outline"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmProcessApplication}
                disabled={isProcessing || (processAction === 'reject' && !comments.trim())}
                className={processAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                }
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : processAction === 'approve' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? 'Processing...' : (processAction === 'approve' ? 'Approve' : 'Reject')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveManagement;
