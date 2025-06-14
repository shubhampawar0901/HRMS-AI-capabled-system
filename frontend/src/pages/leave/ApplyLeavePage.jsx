import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LeaveApplicationForm from '@/components/leave/LeaveApplicationForm';
import { ArrowLeft, Calendar, User, Shield } from 'lucide-react';

const ApplyLeavePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSuccess = () => {
    navigate('/leave?tab=history');
  };

  const handleCancel = () => {
    navigate('/leave');
  };

  // Check if user has permission to apply for leave
  if (user?.role !== 'employee') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
                  <p className="text-gray-600 mb-4">
                    Leave applications can only be submitted by employees.
                    {user?.role === 'manager' && ' As a manager, you can approve leave applications in the Leave Management section.'}
                    {user?.role === 'admin' && ' As an admin, you can manage all leave applications in the Leave Management section.'}
                  </p>
                  <Button
                    onClick={() => navigate('/leave')}
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-105"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go to Leave Management
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-3 mb-2">
                  <Calendar className="h-8 w-8" />
                  Apply for Leave
                </CardTitle>
                <p className="text-green-100 text-lg">
                  Submit a new leave application with all required details
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-white/30 text-white bg-white/10 px-3 py-1">
                  <User className="h-4 w-4 mr-1" />
                  Employee
                </Badge>

                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  className="text-white hover:bg-white/10 border border-white/30 hover:border-white/50 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Leave Management
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Application Form */}
        <div className="max-w-4xl mx-auto">
          <LeaveApplicationForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>

        {/* Help Card */}
        <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Application Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Before Applying:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Check your leave balance</li>
                  <li>Ensure dates don't conflict with important projects</li>
                  <li>Plan for work coverage during your absence</li>
                  <li>Submit applications at least 2 weeks in advance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Required Information:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Leave type and duration</li>
                  <li>Detailed reason for leave</li>
                  <li>Emergency contact information (if applicable)</li>
                  <li>Work handover plan (for extended leave)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplyLeavePage;
