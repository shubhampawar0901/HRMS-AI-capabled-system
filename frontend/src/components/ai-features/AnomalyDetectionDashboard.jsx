/**
 * Anomaly Detection Dashboard
 * Main dashboard component for AI-powered attendance anomaly detection
 * 
 * Features:
 * - Auto-detection on page load for Admin users
 * - Premium AI-themed UI with cool colors and animations
 * - Mobile-responsive design with touch interactions
 * - Real-time data updates and loading states
 * - Role-based functionality and data filtering
 */

import React, { useEffect, useState } from 'react';
import { useAnomalyDetection } from '@/contexts/AnomalyDetectionContext';
import { useAuthContext } from '@/contexts/AuthContext';
import AnomalySummaryCards from './AnomalySummaryCards';
import AnomalyDetectionControls from './AnomalyDetectionControls';
import AnomalyList from './AnomalyList';
import AnomalyDetailModal from './AnomalyDetailModal';
import DetectionProgressModal from './DetectionProgressModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AlertTriangle, Brain, Sparkles, RefreshCw } from 'lucide-react';

/**
 * Main Anomaly Detection Dashboard Component
 */
const AnomalyDetectionDashboard = React.memo(() => {
  const { user } = useAuthContext();
  const {
    loading,
    error,
    isDetecting,
    detectionProgress,
    selectedAnomaly,
    autoRefresh,
    fetchAnomalies,
    fetchAnomalyStats,
    refreshData,
    clearError,
    setSelectedAnomaly
  } = useAnomalyDetection();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // ==========================================
  // INITIAL DATA LOADING
  // ==========================================

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchAnomalies(),
          fetchAnomalyStats()
        ]);
        setLastRefreshTime(new Date());
      } catch (error) {
        console.error('Error initializing anomaly detection data:', error);
      }
    };

    initializeData();
  }, [fetchAnomalies, fetchAnomalyStats]);

  // ==========================================
  // MODAL HANDLERS
  // ==========================================

  const handleViewDetails = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAnomaly(null);
  };

  const handleRefresh = async () => {
    await refreshData();
    setLastRefreshTime(new Date());
  };

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  const handleRetry = () => {
    clearError();
    refreshData();
  };

  // ==========================================
  // RENDER ERROR STATE
  // ==========================================

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="ai-card max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Anomaly Data
          </h2>
          <p className="text-gray-600 mb-6">
            {typeof error === 'string' ? error : error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={handleRetry}
            className="ai-button w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER LOADING STATE
  // ==========================================

  if (loading && !isDetecting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="ai-card p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600 ai-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Anomaly Detection
            </h2>
            <p className="text-gray-600 mb-4">
              Initializing AI-powered attendance analysis...
            </p>
            <LoadingSpinner size="sm" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD RENDER
  // ==========================================

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ==========================================
            PAGE HEADER
            ========================================== */}
        <div className="ai-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center ai-icon-glow">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold ai-gradient-text">
                  Attendance Anomaly Detection
                </h1>
                <p className="text-gray-600 mt-1">
                  AI-powered analysis to identify unusual attendance patterns
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              {/* Role Badge */}
              <span className="ai-badge">
                {user?.role === 'admin' ? 'Admin Access' : 'Manager Access'}
              </span>
              
              {/* AI Badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </span>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading || isDetecting}
                className="ai-button px-4 py-2 text-sm"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Last Refresh Time */}
          <div className="text-sm text-gray-500 mb-6">
            Last updated: {lastRefreshTime.toLocaleString()}
            {autoRefresh.enabled && (
              <span className="ml-2 text-green-600">
                • Auto-refresh enabled
              </span>
            )}
          </div>
        </div>

        {/* ==========================================
            SUMMARY CARDS
            ========================================== */}
        <div className="ai-slide-in-right" style={{ animationDelay: '100ms' }}>
          <AnomalySummaryCards />
        </div>

        {/* ==========================================
            DETECTION CONTROLS
            ========================================== */}
        <div className="ai-slide-in-right" style={{ animationDelay: '200ms' }}>
          <AnomalyDetectionControls />
        </div>

        {/* ==========================================
            ANOMALIES LIST
            ========================================== */}
        <div className="ai-slide-in-right" style={{ animationDelay: '300ms' }}>
          <AnomalyList onViewDetails={handleViewDetails} />
        </div>

        {/* ==========================================
            MODALS
            ========================================== */}
        
        {/* Anomaly Detail Modal */}
        {showDetailModal && selectedAnomaly && (
          <AnomalyDetailModal
            anomaly={selectedAnomaly}
            isOpen={showDetailModal}
            onClose={handleCloseDetailModal}
          />
        )}

        {/* Detection Progress Modal */}
        {isDetecting && (
          <DetectionProgressModal
            isOpen={isDetecting}
            progress={detectionProgress}
            onClose={() => {}} // Cannot close during detection
          />
        )}
      </div>
    </div>
  );
});

AnomalyDetectionDashboard.displayName = 'AnomalyDetectionDashboard';

export default AnomalyDetectionDashboard;
