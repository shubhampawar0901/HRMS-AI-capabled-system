/**
 * Anomaly Detail Modal Component
 * Detailed view modal for individual anomalies with advanced UI
 * 
 * Features:
 * - Slide-in animation from right with backdrop blur
 * - Detailed anomaly information display
 * - AI recommendations section with actionable insights
 * - Action buttons (Resolve, Ignore, Schedule Meeting)
 * - Mobile-responsive modal design with bottom sheet on mobile
 * - Smooth transitions and premium styling
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,

  Activity,
  Brain,
  Lightbulb
} from 'lucide-react';

/**
 * Modal Backdrop Component
 */
const ModalBackdrop = React.memo(({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative h-full flex items-center justify-center p-4 md:p-6">
        {children}
      </div>
    </div>
  );
});

ModalBackdrop.displayName = 'ModalBackdrop';

/**
 * Enhanced Recommendation Item Component
 */
const RecommendationItem = React.memo(({ recommendation, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = recommendation.length > 100;

  return (
    <div
      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 ai-fade-in hover:shadow-md transition-all duration-200"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex-shrink-0 mt-1">
          <Lightbulb className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className={`text-sm text-blue-900 leading-relaxed ${
              isLongText && !isExpanded ? 'line-clamp-2' : ''
            }`}>
              {recommendation}
            </p>
            {isLongText && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex-shrink-0"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>

          {/* Action buttons for recommendations */}
          <div className="flex items-center space-x-2 mt-3">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors duration-200">
              📋 Schedule Meeting
            </button>
            <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition-colors duration-200">
              ✅ Mark as Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

RecommendationItem.displayName = 'RecommendationItem';

/**
 * Anomaly Timeline Component
 */
const AnomalyTimeline = React.memo(({ anomaly }) => {
  const timelineEvents = [
    {
      type: 'detected',
      date: anomaly.createdAt,
      title: 'Anomaly Detected',
      description: 'AI system identified unusual attendance pattern',
      icon: Brain,
      color: 'blue'
    }
  ];

  if (anomaly.status === 'resolved') {
    timelineEvents.push({
      type: 'resolved',
      date: anomaly.updatedAt,
      title: 'Anomaly Resolved',
      description: anomaly.resolution || 'Marked as resolved',
      icon: CheckCircle,
      color: 'green'
    });
  } else if (anomaly.status === 'ignored') {
    timelineEvents.push({
      type: 'ignored',
      date: anomaly.updatedAt,
      title: 'Anomaly Ignored',
      description: anomaly.ignoreReason || 'Marked as ignored',
      icon: XCircle,
      color: 'gray'
    });
  }

  return (
    <div className="space-y-4">
      {timelineEvents.map((event, index) => {
        const Icon = event.icon;
        const colorClasses = {
          blue: 'bg-blue-100 text-blue-600 border-blue-200',
          green: 'bg-green-100 text-green-600 border-green-200',
          gray: 'bg-gray-100 text-gray-600 border-gray-200'
        };

        return (
          <div key={event.type} className="flex items-start space-x-3">
            <div className={`p-2 rounded-full border ${colorClasses[event.color]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {event.title}
                </h4>
                <span className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

AnomalyTimeline.displayName = 'AnomalyTimeline';

/**
 * Main Anomaly Detail Modal Component
 */
const AnomalyDetailModal = React.memo(({ anomaly, isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render meaningful metric cards instead of raw JSON
  const renderMetricCards = (data, anomalyType) => {
    const metrics = extractMeaningfulMetrics(data, anomalyType);

    return metrics.map((metric, index) => (
      <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{metric.label}</span>
          {metric.severity && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityBadgeClass(metric.severity)}`}>
              {metric.severity.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-end space-x-2 mb-2">
          <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
          <span className="text-sm text-gray-500 mb-1">{metric.unit}</span>
        </div>

        {metric.comparison && (
          <div className="text-xs text-gray-600 mb-2">
            vs {metric.comparison}
          </div>
        )}

        {metric.progressPercentage !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(metric.severity)}`}
              style={{ width: `${Math.min(metric.progressPercentage, 100)}%` }}
            />
          </div>
        )}

        {metric.description && (
          <p className="text-xs text-gray-600 mt-2">{metric.description}</p>
        )}
      </div>
    ));
  };

  // Extract meaningful metrics from raw data
  const extractMeaningfulMetrics = (data, anomalyType) => {
    switch (anomalyType) {
      case 'irregular_hours':
        return [
          {
            label: 'Hours Variance',
            value: parseFloat(data.hours_variance || data.variance || 0).toFixed(1),
            unit: 'hours',
            comparison: `${data.expected_variance || data.acceptable_variance_threshold || '2'} hours normal`,
            progressPercentage: Math.min((parseFloat(data.hours_variance || 0) / 10) * 100, 100),
            severity: parseFloat(data.hours_variance || 0) > 5 ? 'high' : 'medium',
            description: 'Daily work hour variation from average'
          },
          {
            label: 'Average Hours',
            value: parseFloat(data.average_hours || 0).toFixed(1),
            unit: 'hours/day',
            comparison: '8 hours standard',
            progressPercentage: (parseFloat(data.average_hours || 0) / 12) * 100,
            description: 'Average daily working hours'
          },
          {
            label: 'Range',
            value: `${data.minimum_hours || 'N/A'} - ${data.maximum_hours || 'N/A'}`,
            unit: 'hours',
            description: 'Minimum to maximum daily hours worked'
          }
        ];

      case 'late_pattern':
        return [
          {
            label: 'Late Percentage',
            value: parseFloat(data.latePercentage || 0).toFixed(1),
            unit: '%',
            comparison: `${data.typicalLatePercentage || '20%'} normal`,
            progressPercentage: Math.min(parseFloat(data.latePercentage || 0), 100),
            severity: parseFloat(data.latePercentage || 0) > 30 ? 'high' : 'medium',
            description: 'Percentage of days arriving late'
          },
          {
            label: 'Frequency',
            value: data.frequency || 'Multiple days',
            unit: '',
            description: 'Pattern frequency description'
          }
        ];

      case 'absence_pattern':
        return [
          {
            label: 'Absence Rate',
            value: parseFloat(data.absentPercentage || 0).toFixed(1),
            unit: '%',
            comparison: `${data.threshold || '10%'} threshold`,
            progressPercentage: Math.min(parseFloat(data.absentPercentage || 0), 100),
            severity: parseFloat(data.absentPercentage || 0) > 20 ? 'high' : 'medium',
            description: 'Percentage of absent days'
          }
        ];

      case 'weekend_holiday_work':
        return [
          {
            label: 'Weekend Days',
            value: parseInt(data.weekendWorkDays || 0),
            unit: 'days',
            comparison: `${data.typicalWeekendWorkDays || '0-1'} typical`,
            progressPercentage: Math.min((parseInt(data.weekendWorkDays || 0) / 7) * 100, 100),
            severity: parseInt(data.weekendWorkDays || 0) > 2 ? 'high' : 'low',
            description: 'Weekend working days detected'
          }
        ];

      default:
        // Fallback for unknown types - show key-value pairs
        return Object.entries(data)
          .filter(([key, value]) => value !== null && value !== undefined && value !== '')
          .slice(0, 4) // Limit to 4 metrics
          .map(([key, value]) => ({
            label: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
            value: typeof value === 'number' ? value.toFixed(2) : value.toString(),
            unit: '',
            description: `${key} measurement`
          }));
    }
  };

  // Get severity badge styling
  const getSeverityBadgeClass = (severity) => {
    const classes = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return classes[severity] || classes.medium;
  };

  // Get progress bar color based on severity
  const getProgressBarColor = (severity) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-amber-500',
      low: 'bg-blue-500'
    };
    return colors[severity] || colors.medium;
  };

  // Get key metric summary for header
  const getKeyMetricSummary = (anomaly) => {
    const data = anomaly.anomalyData || {};
    const type = anomaly.anomalyType;

    switch (type) {
      case 'irregular_hours':
        const variance = parseFloat(data.hours_variance || data.variance || 0);
        return `${variance.toFixed(1)}h variance`;

      case 'late_pattern':
        const latePercentage = parseFloat(data.latePercentage || 0);
        return `${latePercentage.toFixed(1)}% late rate`;

      case 'absence_pattern':
        const absentPercentage = parseFloat(data.absentPercentage || 0);
        return `${absentPercentage.toFixed(1)}% absent rate`;

      case 'weekend_holiday_work':
        const weekendDays = parseInt(data.weekendWorkDays || 0);
        return `${weekendDays} weekend days`;

      case 'overtime_anomalies':
        const overtimeDays = parseInt(data.long_work_days || 0);
        return `${overtimeDays} overtime days`;

      default:
        return 'Pattern detected';
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'text-purple-700 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200',
      medium: 'text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200',
      low: 'text-indigo-700 bg-gradient-to-r from-indigo-100 to-cyan-100 border-indigo-200'
    };
    return colors[severity] || colors.low;
  };

  if (!anomaly) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={handleClose}>
      <div 
        className={`
          relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl
          transform transition-all duration-300 ease-out overflow-hidden
          ${isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                Anomaly Details
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                {anomaly.anomalyType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>

              {/* Key Metric Summary */}
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 rounded-full border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">
                    {getKeyMetricSummary(anomaly)}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityBadgeClass(anomaly.severity)}`}>
                  {anomaly.severity?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            
            {/* Employee Information */}
            <div className="ai-card p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Employee Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Employee Name
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {anomaly.employee_name || 'Unknown Employee'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Employee Code
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {anomaly.employee_code || 'N/A'}
                  </p>
                </div>
                
                {anomaly.department_name && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Department
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {anomaly.department_name}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Severity Level
                  </label>
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1
                    ${getSeverityColor(anomaly.severity)} border
                  `}>
                    {anomaly.severity?.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
            </div>

            {/* Anomaly Details */}
            <div className="ai-card p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Anomaly Analysis</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Detection Date
                  </label>
                  <p className="text-sm text-gray-900 mt-1 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(anomaly.detectedDate)}</span>
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {anomaly.description || 'No detailed description available.'}
                  </p>
                </div>
                
                {anomaly.anomalyData && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                      📊 Pattern Analysis
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderMetricCards(anomaly.anomalyData, anomaly.anomalyType)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Recommendations */}
            {anomaly.recommendations && anomaly.recommendations.length > 0 && (
              <div className="ai-card p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI Recommendations</span>
                </h3>
                
                <div className="space-y-3">
                  {anomaly.recommendations.map((recommendation, index) => (
                    <RecommendationItem
                      key={index}
                      recommendation={recommendation}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="ai-card p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Timeline</span>
              </h3>
              
              <AnomalyTimeline anomaly={anomaly} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {anomaly.status === 'active' && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
            >
              Close
            </button>

            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md">
              <MessageSquare className="w-4 h-4" />
              <span>Schedule Meeting</span>
            </button>

            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md">
              <CheckCircle className="w-4 h-4" />
              <span>Mark Resolved</span>
            </button>
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
});

AnomalyDetailModal.displayName = 'AnomalyDetailModal';

export default AnomalyDetailModal;
