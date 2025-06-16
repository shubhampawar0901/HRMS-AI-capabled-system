/**
 * Enhanced Anomaly Card Component
 * Displays meaningful anomaly data with visual indicators
 */

import React, { useState } from 'react';
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  User,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  Target
} from 'lucide-react';

const EnhancedAnomalyCard = ({ 
  anomaly, 
  onViewDetails, 
  onResolve, 
  onIgnore, 
  loading 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Extract meaningful metrics from anomaly data
  const getMetrics = (anomaly) => {
    const data = anomaly.anomalyData || {};
    const type = anomaly.anomalyType;

    switch (type) {
      case 'late_pattern':
        return {
          primaryValue: data.latePercentage || 0,
          primaryUnit: '%',
          primaryLabel: 'Late Rate',
          threshold: data.typicalLatePercentage || '20%',
          comparison: 'vs normal',
          progressValue: Math.min(data.latePercentage || 0, 100),
          details: `${data.frequency || 'Multiple days'} affected`
        };

      case 'irregular_hours':
        const variance = parseFloat(data.hours_variance || data.variance || 0);
        return {
          primaryValue: variance,
          primaryUnit: 'hrs',
          primaryLabel: 'Variance',
          threshold: data.acceptable_variance_threshold || '2 hrs',
          comparison: 'vs acceptable',
          progressValue: Math.min((variance / 10) * 100, 100),
          details: `Avg: ${data.average_hours || 'N/A'} hrs`
        };

      case 'absence_pattern':
        return {
          primaryValue: data.absentPercentage || 0,
          primaryUnit: '%',
          primaryLabel: 'Absence Rate',
          threshold: data.threshold || '10%',
          comparison: 'vs normal',
          progressValue: Math.min(data.absentPercentage || 0, 100),
          details: 'High absence pattern'
        };

      case 'weekend_holiday_work':
        return {
          primaryValue: data.weekendWorkDays || 0,
          primaryUnit: 'days',
          primaryLabel: 'Weekend Work',
          threshold: data.typicalWeekendWorkDays || '0-1',
          comparison: 'vs typical',
          progressValue: Math.min((data.weekendWorkDays || 0) * 20, 100),
          details: data.frequency || 'Weekend pattern'
        };

      case 'overtime_anomalies':
        return {
          primaryValue: data.long_work_days || 0,
          primaryUnit: 'days',
          primaryLabel: 'Long Days',
          threshold: '2-3 days',
          comparison: 'vs normal',
          progressValue: Math.min((data.long_work_days || 0) * 15, 100),
          details: `Max: ${data.max_hours || 'N/A'} hrs`
        };

      default:
        return {
          primaryValue: 'N/A',
          primaryUnit: '',
          primaryLabel: 'Anomaly',
          threshold: 'Normal',
          comparison: 'vs expected',
          progressValue: 50,
          details: 'Pattern detected'
        };
    }
  };

  // Get severity styling
  const getSeverityStyle = (severity) => {
    const styles = {
      high: {
        border: 'border-red-200',
        bg: 'bg-red-50',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-800',
        progress: 'bg-red-500',
        glow: 'shadow-red-100'
      },
      medium: {
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        icon: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-800',
        progress: 'bg-amber-500',
        glow: 'shadow-amber-100'
      },
      low: {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800',
        progress: 'bg-blue-500',
        glow: 'shadow-blue-100'
      }
    };
    return styles[severity] || styles.medium;
  };

  // Get anomaly type icon
  const getAnomalyIcon = (type) => {
    const icons = {
      'late_pattern': Clock,
      'irregular_hours': BarChart3,
      'absence_pattern': Calendar,
      'weekend_holiday_work': TrendingUp,
      'overtime_anomalies': AlertTriangle
    };
    return icons[type] || AlertTriangle;
  };

  // Format anomaly type name
  const formatAnomalyType = (type) => {
    const names = {
      'late_pattern': 'Late Arrival Pattern',
      'irregular_hours': 'Irregular Hours',
      'absence_pattern': 'High Absence Rate',
      'weekend_holiday_work': 'Weekend Work',
      'overtime_anomalies': 'Excessive Overtime'
    };
    return names[type] || 'Attendance Anomaly';
  };

  const metrics = getMetrics(anomaly);
  const style = getSeverityStyle(anomaly.severity);
  const IconComponent = getAnomalyIcon(anomaly.anomalyType);

  return (
    <div
      className={`
        relative bg-white rounded-xl border-2 ${style.border} 
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        ${isHovered ? `${style.glow} shadow-lg` : 'shadow-sm'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${style.bg} border ${style.border}`}>
              <IconComponent className={`w-6 h-6 ${style.icon}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {anomaly.employee_name || anomaly.employeeName}
              </h3>
              <p className="text-sm text-gray-600">
                {anomaly.employee_code} • {anomaly.department_name}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
            {anomaly.severity.toUpperCase()}
          </span>
        </div>

        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {formatAnomalyType(anomaly.anomalyType)}
        </h4>
      </div>

      {/* Metrics Section */}
      <div className="px-6 pb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {metrics.primaryLabel}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.primaryValue}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {metrics.primaryUnit}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {metrics.comparison} {metrics.threshold}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${style.progress} transition-all duration-500`}
              style={{ width: `${Math.min(metrics.progressValue, 100)}%` }}
            />
          </div>

          <div className="text-xs text-gray-600">
            {metrics.details}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pb-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {anomaly.description}
        </p>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Detected: {new Date(anomaly.detectedDate).toLocaleDateString()}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewDetails(anomaly)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onResolve(anomaly.id)}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Mark Resolved"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onIgnore(anomaly.id)}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Ignore"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/5 to-purple-400/5 pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  );
};

export default EnhancedAnomalyCard;
