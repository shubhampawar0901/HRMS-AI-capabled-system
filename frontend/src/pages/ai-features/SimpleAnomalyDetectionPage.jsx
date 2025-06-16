/**
 * Simple Anomaly Detection Page
 * Simplified, self-explanatory anomaly detection interface
 * 
 * Features:
 * - Clear explanation of how detection works
 * - Simple anomaly list with actions
 * - Minimal UI complexity
 * - Self-explanatory thresholds and calculations
 */

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import AnomalyExplanationCard from '@/components/ai-features/simplified/AnomalyExplanationCard';
import SimpleAnomalyList from '@/components/ai-features/simplified/SimpleAnomalyList';
import AnomalyDetailModal from '@/components/ai-features/AnomalyDetailModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import anomalyDetectionService from '@/services/anomalyDetectionService';
import {
  Brain,
  RefreshCw,
  AlertTriangle,
  Clock
} from 'lucide-react';

const SimpleAnomalyDetectionPage = () => {
  const { user } = useAuthContext();
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState(null);

  // Auto-detect on page load
  useEffect(() => {
    handleAutoDetection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-detection for last 30 days
  const handleAutoDetection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const dateRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      console.log('🤖 Running auto-detection for last 30 days:', dateRange);

      // Run detection (null = all employees for admin)
      const detectionResult = await anomalyDetectionService.detectAnomalies(
        user?.role === 'admin' ? null : user?.employeeId,
        dateRange
      );

      console.log('✅ Detection completed:', detectionResult);

      // Fetch updated anomalies
      await fetchAnomalies();
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('❌ Auto-detection failed:', error);
      setError(error.message || 'Failed to detect anomalies');
    } finally {
      setLoading(false);
    }
  };

  // Fetch current anomalies
  const fetchAnomalies = async () => {
    try {
      const response = await anomalyDetectionService.getAnomalies({
        status: 'active'
      });
      
      if (response.success) {
        setAnomalies(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch anomalies');
      }
    } catch (error) {
      console.error('❌ Failed to fetch anomalies:', error);
      setError(error.message || 'Failed to fetch anomalies');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await handleAutoDetection();
    setRefreshing(false);
  };

  // Handle resolve anomaly
  const handleResolve = async (anomalyId) => {
    try {
      await anomalyDetectionService.updateAnomalyStatus(anomalyId, 'resolved');
      await fetchAnomalies();
    } catch (error) {
      console.error('❌ Failed to resolve anomaly:', error);
      setError('Failed to resolve anomaly');
    }
  };

  // Handle ignore anomaly
  const handleIgnore = async (anomalyId) => {
    try {
      await anomalyDetectionService.updateAnomalyStatus(anomalyId, 'ignored');
      await fetchAnomalies();
    } catch (error) {
      console.error('❌ Failed to ignore anomaly:', error);
      setError('Failed to ignore anomaly');
    }
  };

  // Handle view details
  const handleViewDetails = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setShowDetailModal(true);
  };

  // Handle close detail modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAnomaly(null);
  };

  // Get summary stats
  const getSummaryStats = () => {
    const total = anomalies.length;
    const high = anomalies.filter(a => a.severity === 'high').length;
    const medium = anomalies.filter(a => a.severity === 'medium').length;
    const low = anomalies.filter(a => a.severity === 'low').length;
    
    return { total, high, medium, low };
  };

  const stats = getSummaryStats();

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            Analyzing attendance patterns with AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AI Anomaly Detection
                </h1>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {stats.total} Total
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Last 30 days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Error:</span>
                <span className="text-red-600">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Last Refresh Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Last analysis: {lastRefresh.toLocaleString()}
            </span>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Analyzing...' : 'Refresh Analysis'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* How It Works Section */}
          <AnomalyExplanationCard />

          {/* Anomalies List */}
          <SimpleAnomalyList
            anomalies={anomalies}
            loading={refreshing}
            onResolve={handleResolve}
            onIgnore={handleIgnore}
            onViewDetails={handleViewDetails}
            onRefresh={handleRefresh}
          />

        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedAnomaly && (
          <AnomalyDetailModal
            anomaly={selectedAnomaly}
            isOpen={showDetailModal}
            onClose={handleCloseDetailModal}
          />
        )}

      </div>
    </div>
  );
};

export default SimpleAnomalyDetectionPage;
