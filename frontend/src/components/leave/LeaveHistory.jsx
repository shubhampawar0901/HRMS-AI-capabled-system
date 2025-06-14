import React, { useEffect, useState } from 'react';
import { useLeave } from '@/hooks/useLeave';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const LeaveHistory = () => {
  const {
    applications,
    isLoading,
    error,
    pagination,
    filters,
    loadApplications,
    cancelApplication,
    updateFilters,
    resetFilters,
    goToPage,
    getStatusColor,
    canCancelApplication,
    clearError
  } = useLeave();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    loadApplications({
      ...filters,
      page: pagination.currentPage || 1,
      limit: pagination.itemsPerPage || 10
    });
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    updateFilters({ search: value });
  };

  const handleStatusFilter = (status) => {
    updateFilters({ status });
  };

  const handleCancelApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      try {
        await cancelApplication(applicationId);
      } catch (error) {
        console.error('Failed to cancel application:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Leave History</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => {
                  clearError();
                  loadApplications({
                    ...filters,
                    page: pagination.currentPage || 1,
                    limit: pagination.itemsPerPage || 10
                  });
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
      {/* Header with Search and Filters */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Leave History
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                />
              </div>
              
              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="ghost"
                className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              {/* Refresh */}
              <Button
                onClick={() => loadApplications({
                  ...filters,
                  page: pagination.currentPage || 1,
                  limit: pagination.itemsPerPage || 10
                })}
                disabled={isLoading}
                variant="ghost"
                className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={filters.status} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={resetFilters}
                  variant="ghost"
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Loading Leave History</h3>
                <p className="text-gray-600">Please wait while we fetch your leave applications...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {!isLoading && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((application) => {
            const StatusIcon = getStatusIcon(application.status);
            
            return (
              <Card 
                key={application.id}
                className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Application Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.leaveTypeName || 'Leave Application'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(application.status)} border`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Applied on {formatDate(application.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {application.totalDays}
                          </div>
                          <div className="text-xs text-gray-500">days</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <div className="font-medium text-gray-900">
                            {formatDate(application.startDate)} - {formatDate(application.endDate)}
                          </div>
                        </div>
                        
                        {application.reason && (
                          <div>
                            <span className="text-gray-500">Reason:</span>
                            <div className="font-medium text-gray-900 truncate" title={application.reason}>
                              {application.reason}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {application.comments && (
                        <div className="text-sm">
                          <span className="text-gray-500">Comments:</span>
                          <div className="font-medium text-gray-900 bg-gray-50 p-2 rounded mt-1">
                            {application.comments}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => setSelectedApplication(application)}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {canCancelApplication(application) && (
                        <Button
                          onClick={() => handleCancelApplication(application.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && applications.length === 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Applications Found</h3>
                <p className="text-gray-600">
                  {filters.status !== 'all' || searchTerm 
                    ? 'No applications match your current filters. Try adjusting your search criteria.'
                    : 'You haven\'t submitted any leave applications yet.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && applications.length > 0 && pagination.totalPages > 1 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} applications
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => goToPage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm font-medium text-gray-900 px-3">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <Button
                  onClick={() => goToPage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="hrms-modal-overlay">
          <Card className="hrms-modal-content w-full max-w-2xl shadow-2xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">
                  Leave Application Details
                </CardTitle>
                <Button
                  onClick={() => setSelectedApplication(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Leave Type</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedApplication.leaveTypeName}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>
                    <Badge className={`${getStatusColor(selectedApplication.status)} border`}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedApplication.startDate)}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedApplication.endDate)}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Days</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedApplication.totalDays} days
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Applied On</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedApplication.createdAt)}
                  </div>
                </div>
              </div>
              
              {selectedApplication.reason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedApplication.reason}
                  </div>
                </div>
              )}
              
              {selectedApplication.comments && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager Comments</label>
                  <div className="text-gray-900 bg-blue-50 p-3 rounded-lg mt-1">
                    {selectedApplication.comments}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                {canCancelApplication(selectedApplication) && (
                  <Button
                    onClick={() => {
                      handleCancelApplication(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Application
                  </Button>
                )}
                
                <Button
                  onClick={() => setSelectedApplication(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;
