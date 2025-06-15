import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LeaveApplicationForm from '@/components/leave/LeaveApplicationForm';
import LeaveBalance from '@/components/leave/LeaveBalance';
import LeaveHistory from '@/components/leave/LeaveHistory';
import LeaveApprovals from '@/components/leave/LeaveApprovals';
import LeaveCalendar from '@/components/leave/LeaveCalendar';
import AdminLeaveManagement from '@/components/leave/AdminLeaveManagement';
import {
  Calendar,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  CalendarDays,
  User
} from 'lucide-react';

const LeavePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'management' : 'overview');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const isManager = ['manager', 'admin'].includes(user?.role);

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-3 mb-2">
                  <Calendar className="h-8 w-8" />
                  Leave Management
                </CardTitle>
                <p className="text-blue-100 text-lg">
                  {isAdmin
                    ? 'Manage all employee leave applications and approvals'
                    : 'Manage your leave applications, view balances, and track history'
                  }
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-white/30 text-white bg-white/10 px-3 py-1">
                  <User className="h-4 w-4 mr-1" />
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Badge>

                {user?.role === 'employee' && (
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Apply Leave
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="hrms-modal-overlay">
            <div className="hrms-modal-content w-full max-w-4xl">
              <LeaveApplicationForm
                onSuccess={handleApplicationSuccess}
                onCancel={() => setShowApplicationForm(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        {isAdmin ? (
          // Admin Content - Direct component without tabs
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-5 w-5" />
                  Leave Dashboard
                </CardTitle>
                <p className="text-gray-600">
                  Monitor and manage all employee leave applications
                </p>
              </CardHeader>
            </Card>
            <AdminLeaveManagement />
          </div>
        ) : (
          // Employee/Manager Content with Tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Balance</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="history"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">History</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="calendar"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span className="hidden sm:inline">Calendar</span>
                  </TabsTrigger>

                  {isManager && (
                    <TabsTrigger
                      value="approvals"
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Approvals</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </CardContent>
            </Card>

            {/* Tab Contents */}
            <TabsContent value="overview" className="space-y-6">
              <LeaveBalance />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <LeaveHistory />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <LeaveCalendar />
            </TabsContent>

            {isManager && (
              <TabsContent value="approvals" className="space-y-6">
                <LeaveApprovals />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default LeavePage;
