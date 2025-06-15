import React, { useState } from 'react';
import {
  LightBulbIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Insights Section Component
 * Displays AI-generated insights with categorization and visual indicators
 */
const InsightsSection = ({ 
  insights = [], 
  title = "Key Insights",
  collapsible = false,
  defaultExpanded = true,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  /**
   * Categorize insights based on content keywords
   */
  const categorizeInsight = (insight) => {
    const lowerInsight = insight.toLowerCase();

    if (lowerInsight.includes('improving') || lowerInsight.includes('excellent') || lowerInsight.includes('outstanding')) {
      return 'positive';
    }

    if (lowerInsight.includes('declining') || lowerInsight.includes('concerning') || lowerInsight.includes('poor')) {
      return 'negative';
    }

    if (lowerInsight.includes('attention') || lowerInsight.includes('monitor') || lowerInsight.includes('watch')) {
      return 'warning';
    }

    return 'neutral';
  };

  /**
   * Get insight icon and styling based on category
   */
  const getInsightConfig = (category) => {
    switch (category) {
      case 'positive':
        return {
          icon: ArrowTrendingUpIcon,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'negative':
        return {
          icon: ArrowTrendingDownIcon,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      default:
        return {
          icon: LightBulbIcon,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  /**
   * Render individual insight item
   */
  const renderInsight = (insight, index) => {
    const category = categorizeInsight(insight);
    const config = getInsightConfig(category);
    const IconComponent = config.icon;

    return (
      <div
        key={index}
        className={`
          p-4 rounded-lg border transition-all duration-200 ease-in-out
          hover:shadow-sm hover:scale-[1.01]
          ${config.bgColor} ${config.borderColor}
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800 leading-relaxed">
              {insight}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!insights || insights.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <LightBulbIcon className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No insights available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {insights.length}
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

      {/* Insights Content */}
      {(!collapsible || isExpanded) && (
        <div className="space-y-3">
          {insights.map((insight, index) => renderInsight(insight, index))}
        </div>
      )}
    </div>
  );
};

/**
 * Insights Summary Component
 * Provides a quick overview of insights by category
 */
export const InsightsSummary = ({
  insights = [],
  className = ''
}) => {
  // Use the exported function
  const categorizedInsights = insights.reduce((acc, insight) => {
    const category = categorizeInsight(insight);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const summaryItems = [
    {
      key: 'positive',
      label: 'Positive',
      count: categorizedInsights.positive || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      key: 'warning',
      label: 'Attention',
      count: categorizedInsights.warning || 0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      key: 'negative',
      label: 'Concerns',
      count: categorizedInsights.negative || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      key: 'neutral',
      label: 'General',
      count: categorizedInsights.neutral || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
 * Insights Filter Component
 * Allows filtering insights by category
 */
export const InsightsFilter = ({ 
  insights = [],
  onFilterChange,
  className = '' 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    
    if (category === 'all') {
      onFilterChange(insights);
    } else {
      const filtered = insights.filter(insight => 
        categorizeInsight(insight) === category
      );
      onFilterChange(filtered);
    }
  };

  const categories = [
    { key: 'all', label: 'All Insights', count: insights.length },
    { key: 'positive', label: 'Positive', count: insights.filter(i => categorizeInsight(i) === 'positive').length },
    { key: 'warning', label: 'Attention', count: insights.filter(i => categorizeInsight(i) === 'warning').length },
    { key: 'negative', label: 'Concerns', count: insights.filter(i => categorizeInsight(i) === 'negative').length },
    { key: 'neutral', label: 'General', count: insights.filter(i => categorizeInsight(i) === 'neutral').length }
  ];

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.key}
            onClick={() => handleCategoryChange(category.key)}
            className={`
              inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200 ease-in-out
              ${selectedCategory === category.key
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }
            `}
          >
            {category.label}
            {category.count > 0 && (
              <span className={`
                ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs
                ${selectedCategory === category.key
                  ? 'bg-indigo-200 text-indigo-800'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {category.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};



// Helper function for external use
export const categorizeInsight = (insight) => {
  const lowerInsight = insight.toLowerCase();

  if (lowerInsight.includes('improving') || lowerInsight.includes('excellent') || lowerInsight.includes('outstanding')) {
    return 'positive';
  }

  if (lowerInsight.includes('declining') || lowerInsight.includes('concerning') || lowerInsight.includes('poor')) {
    return 'negative';
  }

  if (lowerInsight.includes('attention') || lowerInsight.includes('monitor') || lowerInsight.includes('watch')) {
    return 'warning';
  }

  return 'neutral';
};

export default InsightsSection;
