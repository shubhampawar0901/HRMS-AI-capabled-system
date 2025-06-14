import React, { useEffect, useState } from 'react';
import { useLeave } from '@/hooks/useLeave';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';

const LeaveApprovals = () => {
  const { user } = useAuth();
  const {
    teamApplications,
    isLoading,
    isSubmitting,
    error,
    pagination,
    filters,
    loadTeamApplications,
    processApplication,
    updateFilters,
    resetFilters,
    goToPage,
    getStatusColor,
    canProcessApplication,
    clearError
  } = useLeave();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [comments, setComments] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Check if user has permission to access this component
  const hasPermission = ['manager', 'admin'].includes(user?.role);

  useEffect(() => {
    if (hasPermission) {
      loadTeamApplications({ 
        ...filters, 
        page: pagination.currentPage,
        limit: pagination.itemsPerPage 
      });
    }
  }, [hasPermission, filters, pagination.currentPage, loadTeamApplications]);

  const handleProcessApplication = async (application, action) => {
    setSelectedApplication(application);
    setProcessingAction(action);
    setComments('');
    setShowModal(true);
  };

  const confirmProcessApplication = async () => {
    if (!selectedApplication || !processingAction) return;

    try {
      await processApplication(selectedApplication.id, processingAction, comments);
      setShowModal(false);
      setSelectedApplication(null);
      setProcessingAction(null);
      setComments('');
    } catch (error) {
      console.error('Failed to process application:', error);
    }
  };

  const handleStatusFilter = (status) => {
    updateFilters({ status });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Permission check
  if (!hasPermission) {
    return (
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">
                You don't have permission to access leave approvals. This feature is only available to managers and administrators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Applications</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => {
                  clearError();
                  loadTeamApplications();
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
      {/* Header */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Leave Approvals
              {user?.role === 'admin' && (
                <Badge variant="outline" className="ml-2 border-white/30 text-white bg-white/10">
                  Admin View
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status Filter */}
              <Select value={filters.status} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Reset Filters */}
              <Button
                onClick={resetFilters}
                variant="ghost"
                className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30"
              >
                Reset
              </Button>
              
              {/* Refresh */}
              <Button
                onClick={() => loadTeamApplications()}
                disabled={isLoading}
                variant="ghost"
                className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="h-8 w-8 text-green-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Loading Applications</h3>
                <p className="text-gray-600">Please wait while we fetch team leave applications...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {!isLoading && teamApplications.length > 0 && (
        <div className="space-y-4">
          {teamApplications.map((application) => (
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
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.employeeName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {application.leaveTypeName} • {application.totalDays} days
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(application.status)} border`}>
                            <Clock className="h-3 w-3 mr-1" />
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
                        <span className="text-gray-500">Previous Comments:</span>
                        <div className="font-medium text-gray-900 bg-gray-50 p-2 rounded mt-1">
                          {application.comments}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {canProcessApplication(application) ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => handleProcessApplication(application, 'approve')}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 transform hover:scale-105"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Button
                          onClick={() => handleProcessApplication(application, 'reject')}
                          disabled={isSubmitting}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-200 transform hover:scale-105"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Badge variant="outline" className="text-gray-500">
                          {application.status === 'approved' ? 'Already Approved' :
                           application.status === 'rejected' ? 'Already Rejected' :
                           'Processed'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && teamApplications.length === 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-600">
                  {filters.status === 'pending' 
                    ? 'No pending leave applications require your approval at this time.'
                    : 'No leave applications match your current filters.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && teamApplications.length > 0 && pagination.totalPages > 1 && (
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

      {/* Process Application Modal */}
      {showModal && selectedApplication && (
        <div className="hrms-modal-overlay">
          <Card className="hrms-modal-content w-full max-w-lg shadow-2xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {processingAction === 'approve' ? 'Approve' : 'Reject'} Leave Application
                </CardTitle>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Application Details</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">Employee:</span> {selectedApplication.employeeName}</div>
                  <div><span className="text-gray-500">Leave Type:</span> {selectedApplication.leaveTypeName}</div>
                  <div><span className="text-gray-500">Duration:</span> {formatDate(selectedApplication.startDate)} - {formatDate(selectedApplication.endDate)}</div>
                  <div><span className="text-gray-500">Days:</span> {selectedApplication.totalDays}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments {processingAction === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    processingAction === 'approve' 
                      ? 'Add any comments for the employee (optional)...'
                      : 'Please provide a reason for rejection...'
                  }
                  className="min-h-[100px]"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {comments.length}/500 characters
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  disabled={isSubmitting}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={confirmProcessApplication}
                  disabled={isSubmitting || (processingAction === 'reject' && !comments.trim())}
                  className={
                    processingAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {processingAction === 'approve' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {processingAction === 'approve' ? 'Approve' : 'Reject'}
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;
