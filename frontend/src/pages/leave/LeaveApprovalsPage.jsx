import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LeaveApprovals from '@/components/leave/LeaveApprovals';
import { ArrowLeft, CheckCircle, User, Shield } from 'lucide-react';

const LeaveApprovalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const hasPermission = ['manager', 'admin'].includes(user?.role);

  // Check if user has permission to access approvals
  if (!hasPermission) {
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have permission to access leave approvals. This feature is only available to managers and administrators.
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-3 mb-2">
                  <CheckCircle className="h-8 w-8" />
                  Leave Approvals
                </CardTitle>
                <p className="text-purple-100 text-lg">
                  Review and process leave applications from your team members
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-white/30 text-white bg-white/10 px-3 py-1">
                  <User className="h-4 w-4 mr-1" />
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Badge>

                <Button
                  onClick={() => navigate('/leave')}
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

        {/* Approvals Component */}
        <LeaveApprovals />

        {/* Help Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Approval Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
              <div>
                <h4 className="font-medium mb-2">Before Approving:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Check team workload and project deadlines</li>
                  <li>Verify employee leave balance</li>
                  <li>Consider business impact and coverage</li>
                  <li>Review previous leave patterns</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">When Rejecting:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Provide clear and constructive feedback</li>
                  <li>Suggest alternative dates if possible</li>
                  <li>Explain business reasons for rejection</li>
                  <li>Offer to discuss alternatives with employee</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveApprovalsPage;
