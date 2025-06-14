import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PayslipViewer from '@/components/payroll/PayslipViewer';
import usePayroll from '@/hooks/usePayroll';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const PayslipDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPayslip, loading, error } = usePayroll();
  const [payslip, setPayslip] = useState(null);

  useEffect(() => {
    const loadPayslip = async () => {
      if (id) {
        const payslipData = await fetchPayslip(parseInt(id));
        setPayslip(payslipData);
      }
    };

    loadPayslip();
  }, [id, fetchPayslip]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading payslip details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/payroll')}
            className="hover:bg-gray-50 transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payroll
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-600 mb-2">⚠️ Error Loading Payslip</div>
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/payroll')}
            className="hover:bg-gray-50 transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payroll
          </Button>
        </div>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">📄 Payslip Not Found</div>
              <p className="text-gray-400">The requested payslip could not be found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/payroll')}
          className="hover:bg-gray-50 transition-colors duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payroll
        </Button>
      </div>

      <div className="relative">
        <PayslipViewer
          payslip={payslip}
          onClose={() => navigate('/payroll')}
        />
      </div>
    </div>
  );
};

export default PayslipDetailsPage;
