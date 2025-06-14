import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import PayrollDashboard from '@/components/payroll/PayrollDashboard';
import AdminPayrollView from '@/components/payroll/AdminPayrollView';
import AccessDenied from '@/components/layout/AccessDenied';

const PayrollPage = () => {
  const { user } = useAuth();

  // Check if user has access to payroll
  const hasPayrollAccess = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'employee';

  if (!hasPayrollAccess) {
    return <AccessDenied />;
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
