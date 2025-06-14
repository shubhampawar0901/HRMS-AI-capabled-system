import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Recommendations Section Component
 * Displays AI-generated recommendations with priority levels and action tracking
 */
const RecommendationsSection = ({ 
  recommendations = [], 
  title = "Recommendations",
  collapsible = false,
  defaultExpanded = true,
  onActionTaken,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [completedActions, setCompletedActions] = useState(new Set());

  /**
   * Categorize recommendations based on content keywords
   */
  const categorizeRecommendation = (recommendation) => {
    const lowerRec = recommendation.toLowerCase();
    
    if (lowerRec.includes('urgent') || lowerRec.includes('immediate') || lowerRec.includes('critical')) {
      return 'high';
    }
    
    if (lowerRec.includes('consider') || lowerRec.includes('explore') || lowerRec.includes('opportunity')) {
      return 'medium';
    }
    
    if (lowerRec.includes('maintain') || lowerRec.includes('continue') || lowerRec.includes('monitor')) {
      return 'low';
    }
    
    return 'medium'; // default
  };

  /**
   * Get recommendation configuration based on priority
   */
  const getRecommendationConfig = (priority) => {
    switch (priority) {
      case 'high':
        return {
          icon: ExclamationCircleIcon,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          priorityLabel: 'High Priority',
          priorityColor: 'text-red-700 bg-red-100'
        };
      case 'medium':
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          priorityLabel: 'Medium Priority',
          priorityColor: 'text-yellow-700 bg-yellow-100'
        };
      case 'low':
        return {
          icon: StarIcon,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          priorityLabel: 'Low Priority',
          priorityColor: 'text-green-700 bg-green-100'
        };
      default:
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          priorityLabel: 'Standard',
          priorityColor: 'text-blue-700 bg-blue-100'
        };
    }
  };

  /**
   * Handle marking recommendation as completed
   */
  const handleMarkCompleted = (index) => {
    const newCompleted = new Set(completedActions);
    if (completedActions.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedActions(newCompleted);
    
    if (onActionTaken) {
      onActionTaken(index, !completedActions.has(index));
    }
  };

  /**
   * Render individual recommendation item
   */
  const renderRecommendation = (recommendation, index) => {
    const priority = categorizeRecommendation(recommendation);
    const config = getRecommendationConfig(priority);
    const IconComponent = config.icon;
    const isCompleted = completedActions.has(index);

    return (
      <div
        key={index}
        className={`
          p-4 rounded-lg border transition-all duration-200 ease-in-out
          hover:shadow-sm hover:scale-[1.01]
          ${config.bgColor} ${config.borderColor}
          ${isCompleted ? 'opacity-75' : ''}
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Priority Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${config.priorityColor}
              `}>
                {config.priorityLabel}
              </span>
              
              {/* Action Button */}
              <button
                onClick={() => handleMarkCompleted(index)}
                className={`
                  inline-flex items-center px-2 py-1 text-xs font-medium rounded-md
                  transition-all duration-200 ease-in-out
                  ${isCompleted
                    ? 'text-green-700 bg-green-100 hover:bg-green-200'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }
                `}
              >
                {isCompleted ? (
                  <>
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Completed
                  </>
                ) : (
                  <>
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Mark Done
                  </>
                )}
              </button>
            </div>
            
            {/* Recommendation Text */}
            <p className={`
              text-sm leading-relaxed
              ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-800'}
            `}>
              {recommendation}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <StarIcon className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No recommendations available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <StarIcon className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {recommendations.length}
          </span>
        </div>
        
        {collapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="
              flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900
              transition-colors duration-200
            "
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Progress Summary */}
      {(!collapsible || isExpanded) && completedActions.size > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              {completedActions.size} of {recommendations.length} recommendations completed
            </span>
          </div>
          <div className="mt-2 w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(completedActions.size / recommendations.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Recommendations Content */}
      {(!collapsible || isExpanded) && (
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => 
            renderRecommendation(recommendation, index)
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Recommendations Summary Component
 * Provides a quick overview of recommendations by priority
 */
export const RecommendationsSummary = ({ 
  recommendations = [],
  className = '' 
}) => {
  const categorizedRecs = recommendations.reduce((acc, rec) => {
    const priority = categorizeRecommendation(rec);
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const summaryItems = [
    {
      key: 'high',
      label: 'High Priority',
      count: categorizedRecs.high || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      key: 'medium',
      label: 'Medium Priority',
      count: categorizedRecs.medium || 0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      key: 'low',
      label: 'Low Priority',
      count: categorizedRecs.low || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-3 gap-4">
        {summaryItems.map(item => (
          <div
            key={item.key}
            className="text-center p-3 rounded-lg border border-gray-200"
          >
            <div className={`
              inline-flex items-center justify-center w-8 h-8 rounded-full mb-2
              ${item.bgColor}
            `}>
              <span className={`text-sm font-bold ${item.color}`}>
                {item.count}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Action Plan Component
 * Converts recommendations into an actionable plan
 */
export const ActionPlan = ({ 
  recommendations = [],
  className = '' 
}) => {
  const prioritizedRecs = recommendations
    .map((rec, index) => ({
      text: rec,
      priority: categorizeRecommendation(rec),
      index
    }))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  return (
    <div className={`${className}`}>
      <h4 className="text-md font-semibold text-gray-900 mb-4">Action Plan</h4>
      <div className="space-y-3">
        {prioritizedRecs.map((rec, index) => {
          const config = getRecommendationConfig(rec.priority);
          
          return (
            <div
              key={rec.index}
              className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${config.priorityColor}
                  `}>
                    {config.priorityLabel}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{rec.text}</p>
              </div>
              <div className="flex-shrink-0">
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function moved outside for reuse
const categorizeRecommendation = (recommendation) => {
  const lowerRec = recommendation.toLowerCase();
  
  if (lowerRec.includes('urgent') || lowerRec.includes('immediate') || lowerRec.includes('critical')) {
    return 'high';
  }
  
  if (lowerRec.includes('consider') || lowerRec.includes('explore') || lowerRec.includes('opportunity')) {
    return 'medium';
  }
  
  if (lowerRec.includes('maintain') || lowerRec.includes('continue') || lowerRec.includes('monitor')) {
    return 'low';
  }
  
  return 'medium'; // default
};

const getRecommendationConfig = (priority) => {
  switch (priority) {
    case 'high':
      return {
        icon: ExclamationCircleIcon,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        priorityLabel: 'High Priority',
        priorityColor: 'text-red-700 bg-red-100'
      };
    case 'medium':
      return {
        icon: InformationCircleIcon,
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        priorityLabel: 'Medium Priority',
        priorityColor: 'text-yellow-700 bg-yellow-100'
      };
    case 'low':
      return {
        icon: StarIcon,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        priorityLabel: 'Low Priority',
        priorityColor: 'text-green-700 bg-green-100'
      };
    default:
      return {
        icon: InformationCircleIcon,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        priorityLabel: 'Standard',
        priorityColor: 'text-blue-700 bg-blue-100'
      };
  }
};

export default RecommendationsSection;
