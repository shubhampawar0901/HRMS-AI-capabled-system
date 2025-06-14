import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import PayrollDashboard from '@/components/payroll/PayrollDashboard';
import AdminPayrollView from '@/components/payroll/AdminPayrollView';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const PayrollPage = () => {
  const { user } = useAuth();

  // Check if user has access to payroll
  const hasPayrollAccess = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'employee';

  if (!hasPayrollAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
            <p className="text-red-600">
              You don't have permission to access the payroll section. This feature is only available to employees, managers, and administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render different views based on user role
  if (user?.role === 'admin') {
    return <AdminPayrollView />;
  }

  // For employees and managers, show the regular dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">
            View payslips and track salary information
          </p>
        </div>
      </div>

      <PayrollDashboard />
    </div>
  );
};

export default PayrollPage;
