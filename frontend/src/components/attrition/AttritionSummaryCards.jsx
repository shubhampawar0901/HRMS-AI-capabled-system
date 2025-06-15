import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Summary cards showing attrition risk distribution
 * @param {Object} props - Component props
 * @param {Object} props.summaryData - Summary statistics
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Summary cards component
 */
const AttritionSummaryCards = ({ summaryData, isLoading }) => {
  const cards = [
    {
      title: 'Critical Risk',
      count: summaryData?.critical || 0,
      icon: AlertTriangle,
      gradient: 'from-red-50 to-red-100',
      border: 'border-red-200',
      textColor: 'text-red-600',
      iconColor: 'text-red-500',
      countColor: 'text-red-700',
      glowColor: 'hover:shadow-red-200/50'
    },
    {
      title: 'High Risk',
      count: summaryData?.high || 0,
      icon: TrendingUp,
      gradient: 'from-orange-50 to-orange-100',
      border: 'border-orange-200',
      textColor: 'text-orange-600',
      iconColor: 'text-orange-500',
      countColor: 'text-orange-700',
      glowColor: 'hover:shadow-orange-200/50'
    },
    {
      title: 'Medium Risk',
      count: summaryData?.medium || 0,
      icon: Users,
      gradient: 'from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      textColor: 'text-yellow-600',
      iconColor: 'text-yellow-500',
      countColor: 'text-yellow-700',
      glowColor: 'hover:shadow-yellow-200/50'
    },
    {
      title: 'Low Risk',
      count: summaryData?.low || 0,
      icon: Shield,
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-200',
      textColor: 'text-green-600',
      iconColor: 'text-green-500',
      countColor: 'text-green-700',
      glowColor: 'hover:shadow-green-200/50'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-12"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card
            key={card.title}
            className={cn(
              "transition-all duration-300 hover:shadow-xl hover:scale-103 cursor-pointer group",
              `bg-gradient-to-br ${card.gradient}`,
              card.border,
              card.glowColor
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className={cn("text-sm font-medium", card.textColor)}>
                    {card.title}
                  </p>
                  <div className="flex items-baseline space-x-2">
                    <p className={cn("text-3xl font-bold", card.countColor)}>
                      <AnimatedCounter
                        value={card.count}
                        duration={1000 + index * 200}
                      />
                    </p>
                    {summaryData?.total > 0 && (
                      <p className={cn("text-xs", card.textColor)}>
                        ({Math.round((card.count / summaryData.total) * 100)}%)
                      </p>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "p-3 rounded-full transition-transform duration-300 group-hover:scale-110",
                  "bg-white/50"
                )}>
                  <Icon className={cn("h-6 w-6", card.iconColor)} />
                </div>
              </div>

              {/* Progress indicator */}
              {summaryData?.total > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-1000 ease-out",
                        card.title === 'Critical Risk' && "bg-red-500",
                        card.title === 'High Risk' && "bg-orange-500",
                        card.title === 'Medium Risk' && "bg-yellow-500",
                        card.title === 'Low Risk' && "bg-green-500"
                      )}
                      style={{
                        width: `${(card.count / summaryData.total) * 100}%`,
                        transitionDelay: `${index * 200}ms`
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

/**
 * Animated counter component
 * @param {Object} props - Component props
 * @param {number} props.value - Target value
 * @param {number} props.duration - Animation duration in ms
 * @returns {JSX.Element} Animated counter
 */
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOutCubic * value);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (value > 0) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      setDisplayValue(0);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

/**
 * Additional summary info component
 * @param {Object} props - Component props
 * @param {Object} props.summaryData - Summary statistics
 * @returns {JSX.Element} Summary info component
 */
export const AttritionSummaryInfo = ({ summaryData }) => {
  if (!summaryData || summaryData.total === 0) {
    return null;
  }

  const highRiskCount = (summaryData.critical || 0) + (summaryData.high || 0);
  const highRiskPercentage = Math.round((highRiskCount / summaryData.total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 transition-all duration-300 hover:shadow-xl hover:scale-103 hover:shadow-blue-200/50">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-700">
              {summaryData.total}
            </p>
            <p className="text-sm text-blue-600">
              Total Employees Analyzed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 transition-all duration-300 hover:shadow-xl hover:scale-103 hover:shadow-purple-200/50">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-700">
              {highRiskPercentage}%
            </p>
            <p className="text-sm text-purple-600">
              High Risk Employees
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 transition-all duration-300 hover:shadow-xl hover:scale-103 hover:shadow-teal-200/50">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-700">
              {Math.round((summaryData.averageRisk || 0) * 100)}%
            </p>
            <p className="text-sm text-teal-600">
              Average Risk Score
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttritionSummaryCards;
