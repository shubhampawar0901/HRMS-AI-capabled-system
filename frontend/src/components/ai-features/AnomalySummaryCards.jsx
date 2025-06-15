/**
 * Anomaly Summary Cards Component
 * Displays key metrics and statistics for attendance anomalies
 * 
 * Features:
 * - Animated summary cards with AI-themed styling
 * - Staggered loading animations with shimmer effects
 * - Hover effects with glow and scale transforms
 * - Trend indicators and progress visualization
 * - Mobile-responsive grid layout
 * - Real-time data updates
 */

import React, { useState, useEffect } from 'react';
import { useAnomalyDetection } from '@/contexts/AnomalyDetectionContext';
import { 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

/**
 * Individual Summary Card Component
 */
const SummaryCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  trendValue,
  description,
  loading,
  animationDelay = 0 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Animate number counting
  useEffect(() => {
    if (!loading && value !== undefined) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        let start = 0;
        const end = parseInt(value) || 0;
        const duration = 1000;
        const increment = end / (duration / 16);

        const counter = setInterval(() => {
          start += increment;
          if (start >= end) {
            setDisplayValue(end);
            clearInterval(counter);
          } else {
            setDisplayValue(Math.floor(start));
          }
        }, 16);

        return () => clearInterval(counter);
      }, animationDelay);

      return () => clearTimeout(timer);
    }
  }, [value, loading, animationDelay]);

  const colorClasses = {
    red: {
      bg: 'from-red-50 to-red-100',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-700',
      glow: 'hover:shadow-red-200/50'
    },
    yellow: {
      bg: 'from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-700',
      glow: 'hover:shadow-yellow-200/50'
    },
    green: {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-700',
      glow: 'hover:shadow-green-200/50'
    },
    blue: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-700',
      glow: 'hover:shadow-blue-200/50'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-700',
      glow: 'hover:shadow-purple-200/50'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <div className="ai-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="ai-shimmer h-4 w-24 rounded"></div>
          <div className="ai-shimmer h-8 w-8 rounded-lg"></div>
        </div>
        <div className="ai-shimmer h-8 w-16 rounded mb-2"></div>
        <div className="ai-shimmer h-3 w-32 rounded"></div>
      </div>
    );
  }

  return (
    <div
      className={`
        ai-card-glow p-6 bg-gradient-to-br ${colors.bg} border ${colors.border}
        transform transition-all duration-300 ease-in-out
        hover:scale-103 ${colors.glow} hover:shadow-xl
        ${isVisible ? 'ai-scale-in' : 'opacity-0'}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 truncate">
          {title}
        </h3>
        <div className={`p-2 rounded-lg bg-white/50 ${colors.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className={`text-3xl font-bold ${colors.text}`}>
          {displayValue.toLocaleString()}
        </span>
      </div>

      {/* Trend and Description */}
      <div className="space-y-2">
        {trend && trendValue !== undefined && (
          <div className="flex items-center space-x-1">
            <TrendingUp className={`h-3 w-3 ${trendValue >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs font-medium ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue >= 0 ? '+' : ''}{trendValue}%
            </span>
            <span className="text-xs text-gray-500">vs last week</span>
          </div>
        )}

        {description && (
          <p className="text-xs text-gray-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});

SummaryCard.displayName = 'SummaryCard';

/**
 * Main Anomaly Summary Cards Component
 */
const AnomalySummaryCards = React.memo(() => {
  const { summary, loading, filteredAnomalies } = useAnomalyDetection();

  // Calculate real-time statistics from filtered anomalies
  const stats = React.useMemo(() => {
    const activeAnomalies = filteredAnomalies.filter(a => a.status === 'active');
    const highPriorityAnomalies = activeAnomalies.filter(a => a.severity === 'high');
    
    // Calculate new anomalies this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = activeAnomalies.filter(a => 
      new Date(a.createdAt) >= oneWeekAgo
    ).length;

    // Calculate resolved this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const resolvedThisMonth = filteredAnomalies.filter(a => 
      a.status === 'resolved' && new Date(a.updatedAt) >= oneMonthAgo
    ).length;

    return {
      totalActive: activeAnomalies.length,
      newThisWeek,
      resolvedThisMonth,
      highPriority: highPriorityAnomalies.length
    };
  }, [filteredAnomalies]);

  const cards = [
    {
      title: "Active Anomalies",
      value: stats.totalActive,
      icon: AlertTriangle,
      color: "red",
      trend: true,
      trendValue: summary.trends?.weeklyChange || 0,
      description: "Anomalies requiring attention"
    },
    {
      title: "New This Week",
      value: stats.newThisWeek,
      icon: Activity,
      color: "yellow",
      trend: true,
      trendValue: 12,
      description: "Recently detected patterns"
    },
    {
      title: "Resolved This Month",
      value: stats.resolvedThisMonth,
      icon: CheckCircle,
      color: "green",
      trend: true,
      trendValue: 8,
      description: "Successfully addressed issues"
    },
    {
      title: "High Priority",
      value: stats.highPriority,
      icon: AlertCircle,
      color: "purple",
      trend: true,
      trendValue: -5,
      description: "Critical anomalies needing immediate action"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Anomaly Overview
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card, index) => (
          <SummaryCard
            key={card.title}
            {...card}
            loading={loading}
            animationDelay={index * 100}
          />
        ))}
      </div>

      {/* Additional Insights */}
      {!loading && (
        <div className="ai-card p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                AI Insights
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {stats.totalActive > 0 ? (
                  <>
                    {stats.highPriority > 0 && (
                      <>
                        <span className="font-medium text-red-600">
                          {stats.highPriority} high-priority anomalies
                        </span>
                        {' '}require immediate attention.
                      </>
                    )}
                    {stats.newThisWeek > 0 && (
                      <>
                        {stats.newThisWeek} new patterns detected this week suggest
                        potential attendance issues.
                      </>
                    )}
                    {stats.totalActive === 0 && "All anomalies have been addressed. Great work!"}
                  </>
                ) : (
                  "No active anomalies detected. Your team's attendance patterns look healthy!"
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AnomalySummaryCards.displayName = 'AnomalySummaryCards';

export default AnomalySummaryCards;
