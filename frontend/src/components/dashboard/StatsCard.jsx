import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatIndianNumber } from '@/utils/formatUtils';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'percentage', 
  trend, 
  icon: Icon, 
  color = 'blue',
  format = 'number',
  isLoading = false 
}) => {
  const formatValue = (val) => {
    if (val === null || val === undefined) return '0';
    
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val}%`;
      case 'number':
        return formatIndianNumber(val);
      default:
        return val.toString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getColorClasses = () => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600',
      green: 'from-green-500 to-green-600 text-green-600',
      purple: 'from-purple-500 to-purple-600 text-purple-600',
      orange: 'from-orange-500 to-orange-600 text-orange-600',
      red: 'from-red-500 to-red-600 text-red-600',
      indigo: 'from-indigo-500 to-indigo-600 text-indigo-600'
    };
    return colors[color] || colors.blue;
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          </CardTitle>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {Icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-r ${getColorClasses().split(' ')[0]} ${getColorClasses().split(' ')[1]} bg-opacity-10`}>
            <Icon className={`w-4 h-4 ${getColorClasses().split(' ')[2]}`} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {formatValue(value)}
        </div>
        {change !== undefined && change !== null && (
          <div className={`flex items-center text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">
              {changeType === 'percentage' ? `${change}%` : formatIndianNumber(change)}
              <span className="text-gray-500 ml-1">from last period</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
