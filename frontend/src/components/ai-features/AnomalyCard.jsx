/**
 * Anomaly Card Component
 * Individual card displaying anomaly information with actions
 * 
 * Features:
 * - Severity-based color coding and styling
 * - Smooth hover effects with glow and scale
 * - Employee information display
 * - Action buttons (View, Resolve, Ignore)
 * - Mobile-friendly touch targets
 * - Loading states for actions
 * - Accessibility features
 */

import React, { useState } from 'react';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';

/**
 * Severity Badge Component
 */
const SeverityBadge = React.memo(({ severity }) => {
  const severityConfig = {
    high: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
      border: 'border-red-200',
      label: 'High Priority'
    },
    medium: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      border: 'border-yellow-200',
      label: 'Medium Priority'
    },
    low: {
      icon: Info,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      border: 'border-blue-200',
      label: 'Low Priority'
    }
  };

  const config = severityConfig[severity] || severityConfig.low;
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${config.bg} ${config.color} ${config.border} border
      transition-all duration-200 hover:scale-105
    `}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
});

SeverityBadge.displayName = 'SeverityBadge';

/**
 * Status Badge Component
 */
const StatusBadge = React.memo(({ status }) => {
  const statusConfig = {
    active: {
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      border: 'border-orange-200',
      label: 'Active'
    },
    resolved: {
      color: 'text-green-600',
      bg: 'bg-green-100',
      border: 'border-green-200',
      label: 'Resolved'
    },
    ignored: {
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      border: 'border-gray-200',
      label: 'Ignored'
    }
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${config.bg} ${config.color} ${config.border} border
    `}>
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

/**
 * Action Button Component
 */
const ActionButton = React.memo(({ 
  onClick, 
  icon: Icon, 
  label, 
  variant = 'secondary',
  loading = false,
  disabled = false,
  size = 'sm'
}) => {
  const variants = {
    primary: 'ai-button text-white',
    secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
    success: 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100',
    danger: 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center rounded-lg font-medium transition-all duration-200
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      `}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <Icon className="w-3 h-3 mr-1" />
      )}
      {label}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

/**
 * Main Anomaly Card Component
 */
const AnomalyCard = React.memo(({ 
  anomaly, 
  onViewDetails, 
  onResolve, 
  onIgnore, 
  loading 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // ==========================================
  // SEVERITY-BASED STYLING
  // ==========================================

  const getSeverityCardClass = (severity) => {
    const classes = {
      high: 'ai-card-high-severity',
      medium: 'ai-card-medium-severity',
      low: 'ai-card-low-severity'
    };
    return classes[severity] || classes.low;
  };

  // ==========================================
  // FORMAT HELPERS
  // ==========================================

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleViewDetails = () => {
    onViewDetails(anomaly);
  };

  const handleResolve = (e) => {
    e.stopPropagation();
    onResolve(anomaly.id);
  };

  const handleIgnore = (e) => {
    e.stopPropagation();
    onIgnore(anomaly.id);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className={`
        ${getSeverityCardClass(anomaly.severity)}
        cursor-pointer transition-all duration-300 ease-in-out
        ${isHovered ? 'transform scale-102' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <SeverityBadge severity={anomaly.severity} />
            <StatusBadge status={anomaly.status} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {anomaly.anomalyType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Anomaly'}
          </h3>
        </div>
      </div>

      {/* Employee Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium truncate">
            {anomaly.employee_name || 'Unknown Employee'}
          </span>
          <span className="text-xs text-gray-500">
            ({anomaly.employee_code || 'N/A'})
          </span>
        </div>
        
        {anomaly.department_name && (
          <div className="text-xs text-gray-500">
            {anomaly.department_name}
          </div>
        )}
      </div>

      {/* Anomaly Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
          {anomaly.description || 'No description available'}
        </p>
      </div>

      {/* Detection Date */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
        <Calendar className="w-3 h-3" />
        <span>Detected: {formatDate(anomaly.detectedDate)}</span>
        <Clock className="w-3 h-3 ml-2" />
        <span>{formatTime(anomaly.createdAt)}</span>
      </div>

      {/* Action Buttons */}
      {anomaly.status === 'active' && (
        <div className="flex space-x-2 pt-3 border-t border-gray-200">
          <ActionButton
            onClick={handleViewDetails}
            icon={Eye}
            label="View Details"
            variant="primary"
            size="sm"
          />
          
          <ActionButton
            onClick={handleResolve}
            icon={CheckCircle}
            label="Resolve"
            variant="success"
            size="sm"
            loading={loading === 'resolving'}
            disabled={loading}
          />
          
          <ActionButton
            onClick={handleIgnore}
            icon={XCircle}
            label="Ignore"
            variant="danger"
            size="sm"
            loading={loading === 'ignoring'}
            disabled={loading}
          />
        </div>
      )}

      {/* Resolved/Ignored Status */}
      {anomaly.status !== 'active' && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <ActionButton
              onClick={handleViewDetails}
              icon={Eye}
              label="View Details"
              variant="secondary"
              size="sm"
            />
            
            <div className="text-xs text-gray-500">
              {anomaly.status === 'resolved' ? 'Resolved' : 'Ignored'} on{' '}
              {formatDate(anomaly.updatedAt)}
            </div>
          </div>
        </div>
      )}

      {/* Hover Glow Effect */}
      {isHovered && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/10 to-purple-400/10 pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  );
});

AnomalyCard.displayName = 'AnomalyCard';

export default AnomalyCard;
