import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';

/**
 * Report Status Badge Component
 * Displays the current status of a smart report with appropriate styling and animations
 */
const ReportStatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  showText = true,
  animated = true,
  className = '' 
}) => {
  
  /**
   * Get status configuration
   */
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          text: 'Completed',
          icon: CheckCircleIcon,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600'
        };
      case 'generating':
        return {
          text: 'Generating',
          icon: ClockIcon,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'failed':
        return {
          text: 'Failed',
          icon: XCircleIcon,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600'
        };
      default:
        return {
          text: 'Unknown',
          icon: QuestionMarkCircleIcon,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  /**
   * Get size classes
   */
  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3',
          gap: 'gap-1'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'h-5 w-5',
          gap: 'gap-2'
        };
      case 'md':
      default:
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'h-4 w-4',
          gap: 'gap-1.5'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = config.icon;

  /**
   * Get animation classes
   */
  const getAnimationClasses = () => {
    if (!animated) return '';
    
    if (status === 'generating') {
      return 'animate-pulse';
    }
    
    return 'transition-all duration-200 ease-in-out';
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.bgColor} 
        ${config.textColor} 
        ${config.borderColor}
        ${sizeClasses.container}
        ${sizeClasses.gap}
        ${getAnimationClasses()}
        ${className}
      `}
    >
      {showIcon && (
        <IconComponent 
          className={`
            ${sizeClasses.icon} 
            ${config.iconColor}
            ${status === 'generating' && animated ? 'animate-spin' : ''}
          `}
        />
      )}
      {showText && config.text}
    </span>
  );
};

/**
 * Report Status Indicator with Progress
 * Enhanced version with progress indication for generating reports
 */
export const ReportStatusIndicator = ({
  status,
  progress = null,
  size = 'md',
  className = ''
}) => {
  if (status === 'generating' && progress !== null) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <ReportStatusBadge 
          status={status} 
          size={size} 
          animated={true}
        />
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 font-medium">
          {Math.round(progress)}%
        </span>
      </div>
    );
  }

  return (
    <ReportStatusBadge 
      status={status} 
      size={size} 
      animated={true}
      className={className}
    />
  );
};

/**
 * Status Timeline Component
 * Shows the progression of report generation
 */
export const ReportStatusTimeline = ({ 
  status, 
  createdAt, 
  updatedAt,
  className = '' 
}) => {
  const steps = [
    { key: 'initiated', label: 'Report Initiated', timestamp: createdAt },
    { key: 'generating', label: 'Generating Report', timestamp: status === 'generating' ? updatedAt : null },
    { key: 'completed', label: status === 'failed' ? 'Generation Failed' : 'Report Completed', timestamp: ['completed', 'failed'].includes(status) ? updatedAt : null }
  ];

  const getStepStatus = (stepKey) => {
    switch (stepKey) {
      case 'initiated':
        return 'completed';
      case 'generating':
        return status === 'generating' ? 'current' : status === 'completed' ? 'completed' : 'pending';
      case 'completed':
        return ['completed', 'failed'].includes(status) ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  const getStepIcon = (stepStatus, stepKey) => {
    if (stepStatus === 'completed') {
      return stepKey === 'completed' && status === 'failed' ? 
        <XCircleIcon className="h-5 w-5 text-red-600" /> :
        <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    }
    
    if (stepStatus === 'current') {
      return <ClockIcon className="h-5 w-5 text-yellow-600 animate-spin" />;
    }
    
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div className={`flow-root ${className}`}>
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => {
          const stepStatus = getStepStatus(step.key);
          
          return (
            <li key={step.key}>
              <div className="relative pb-8">
                {stepIdx !== steps.length - 1 && (
                  <span
                    className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                      stepStatus === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    {getStepIcon(stepStatus, step.key)}
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className={`text-sm ${
                        stepStatus === 'completed' ? 'text-gray-900 font-medium' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                    {step.timestamp && (
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};



export default ReportStatusBadge;
