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
  TrendingUp,
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
 * Recommendation Item Component
 */
const RecommendationItem = React.memo(({ recommendation, index }) => {
  return (
    <div 
      className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 ai-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-1 bg-blue-100 rounded-full">
        <Lightbulb className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-blue-900 leading-relaxed">
          {recommendation}
        </p>
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

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'text-red-600 bg-red-100 border-red-200',
      medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      low: 'text-blue-600 bg-blue-100 border-blue-200'
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
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Anomaly Details
              </h2>
              <p className="text-sm text-gray-600">
                {anomaly.anomalyType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
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
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Pattern Analysis
                    </label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(anomaly.anomalyData, null, 2)}
                      </pre>
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
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
            
            <button className="ai-button px-4 py-2 text-sm flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Schedule Meeting</span>
            </button>
            
            <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
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
