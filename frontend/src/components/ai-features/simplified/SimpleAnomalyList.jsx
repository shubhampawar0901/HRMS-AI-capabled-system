/**
 * Simple Anomaly List - Clean and focused anomaly display
 * Shows current anomalies with clear actions and minimal complexity
 */

import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  TrendingUp,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

const SimpleAnomalyList = ({ 
  anomalies = [], 
  loading = false, 
  onResolve, 
  onIgnore, 
  onViewDetails,
  onRefresh 
}) => {
  const [actionLoading, setActionLoading] = useState({});

  // Get icon for anomaly type
  const getAnomalyIcon = (type) => {
    const icons = {
      'late_pattern': Clock,
      'irregular_hours': TrendingUp,
      'absence_pattern': Calendar,
      'early_departure': AlertTriangle,
      'overtime_anomalies': Clock,
      'location_anomalies': MapPin,
      'weekend_holiday_work': Calendar
    };
    return icons[type] || AlertTriangle;
  };

  // Get severity styling with clean, professional colors
  const getSeverityStyle = (severity) => {
    const styles = {
      high: {
        border: 'border-gray-200',
        bg: 'bg-white',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-700'
      },
      medium: {
        border: 'border-gray-200',
        bg: 'bg-white',
        icon: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-700'
      },
      low: {
        border: 'border-gray-200',
        bg: 'bg-white',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700'
      }
    };
    return styles[severity] || styles.medium;
  };

  // Format anomaly type for display
  const formatAnomalyType = (type) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle action with loading state
  const handleAction = async (anomalyId, action, actionFn) => {
    setActionLoading(prev => ({ ...prev, [`${anomalyId}-${action}`]: true }));
    try {
      await actionFn(anomalyId);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${anomalyId}-${action}`]: false }));
    }
  };

  // Get main metric from anomaly data
  const getMainMetric = (anomaly) => {
    const data = anomaly.anomalyData || {};
    
    switch (anomaly.anomalyType) {
      case 'late_pattern':
        return `${Math.round(data.latePercentage || 0)}% late`;
      case 'irregular_hours':
        return `${(data.stdDev || 0).toFixed(1)}h variation`;
      case 'absence_pattern':
        return `${Math.round(data.absentPercentage || 0)}% absent`;
      case 'early_departure':
        return `${data.earlyDeparturePercentage || 0}% early`;
      case 'overtime_anomalies':
        return `${data.overtimePercentage || 0}% overtime`;
      case 'location_anomalies':
        return `${data.inconsistencyPercentage || 0}% inconsistent`;
      case 'weekend_holiday_work':
        return `${data.weekendDays || 0} weekend days`;
      default:
        return 'Detected';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Current Anomalies</h2>
            <div className="animate-spin">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          {/* Loading skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Current Anomalies
            </h2>
            <p className="text-sm text-gray-600">
              {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        {/* Anomalies List */}
        {anomalies.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Anomalies Detected
            </h3>
            <p className="text-gray-600">
              All attendance patterns appear normal for the selected period.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.map((anomaly) => {
              const IconComponent = getAnomalyIcon(anomaly.anomalyType);
              const style = getSeverityStyle(anomaly.severity);
              
              return (
                <div
                  key={anomaly.id}
                  className={`${style.border} ${style.bg} border rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white`}
                >
                  <div className="flex items-start justify-between">
                    {/* Left side - Anomaly info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-full ${style.bg} border ${style.border}`}>
                        <IconComponent className={`w-6 h-6 ${style.icon}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {anomaly.employee_name || anomaly.employeeName || `Employee #${anomaly.employeeId}`}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                            {anomaly.severity.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 font-medium">
                          {formatAnomalyType(anomaly.anomalyType)}
                        </p>

                        <p className="text-sm text-gray-600 mb-3">
                          {getMainMetric(anomaly)}
                        </p>

                        <div className="flex items-center space-x-6 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Detected: {formatDate(anomaly.detectedDate)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Employee ID: {anomaly.employeeId}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Action Icons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewDetails(anomaly)}
                        title="View Details"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleAction(anomaly.id, 'resolve', onResolve)}
                        disabled={actionLoading[`${anomaly.id}-resolve`]}
                        title={actionLoading[`${anomaly.id}-resolve`] ? 'Resolving...' : 'Resolve'}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleAction(anomaly.id, 'ignore', onIgnore)}
                        disabled={actionLoading[`${anomaly.id}-ignore`]}
                        title={actionLoading[`${anomaly.id}-ignore`] ? 'Ignoring...' : 'Ignore'}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAnomalyList;
