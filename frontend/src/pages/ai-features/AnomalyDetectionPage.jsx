import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AnomalyDetectionProvider } from '@/contexts/AnomalyDetectionContext';
import AnomalyDetectionDashboard from '@/components/ai-features/AnomalyDetectionDashboard';

/**
 * Anomaly Detection Page - AI-powered attendance anomaly detection
 * Role-based access: Admin and Manager only
 *
 * Main page wrapper that provides context and renders the dashboard
 */
const AnomalyDetectionPage = () => {
  const { user } = useAuthContext();

  // Double-check role-based access (additional security layer)
  if (!user || !['admin', 'manager'].includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <AnomalyDetectionProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <AnomalyDetectionDashboard />
      </div>
    </AnomalyDetectionProvider>
  );
};

export default AnomalyDetectionPage;
