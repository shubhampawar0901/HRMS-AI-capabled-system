import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Sparkles,
  BarChart3,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * AI Insights Widget Component
 * Displays AI-powered insights and recommendations based on user role
 */
const AIInsightsWidget = ({ insights = [], userRole = 'employee' }) => {
  const navigate = useNavigate();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800';
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <BarChart3 className="w-4 h-4" />;
      case 'low':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'attrition':
        return <Users className="w-5 h-5" />;
      case 'performance':
        return <TrendingUp className="w-5 h-5" />;
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const handleInsightClick = (insight) => {
    if (insight.action) {
      navigate(insight.action);
    }
  };

  const getDefaultInsights = () => {
    const baseInsights = [
      {
        type: 'general',
        title: 'AI Features Available',
        message: 'Explore AI-powered tools to enhance your productivity',
        severity: 'low',
        action: '/ai-features'
      }
    ];

    if (userRole === 'admin') {
      baseInsights.unshift(
        {
          type: 'attrition',
          title: 'Attrition Predictor',
          message: 'Use AI to identify employees at risk of leaving',
          severity: 'medium',
          action: '/ai-features/attrition'
        },
        {
          type: 'anomaly',
          title: 'Anomaly Detection',
          message: 'Monitor attendance patterns with AI insights',
          severity: 'low',
          action: '/ai-features/anomaly-detection'
        }
      );
    } else if (userRole === 'manager') {
      baseInsights.unshift(
        {
          type: 'performance',
          title: 'Smart Feedback',
          message: 'Generate AI-powered performance feedback',
          severity: 'low',
          action: '/ai-features/smart-feedback'
        },
        {
          type: 'general',
          title: 'Smart Reports',
          message: 'Create intelligent reports with AI assistance',
          severity: 'low',
          action: '/ai-features/smart-reports'
        }
      );
    }

    return baseInsights;
  };

  const displayInsights = insights.length > 0 ? insights : getDefaultInsights();

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 mr-3">
            <Brain className="w-5 h-5 text-white" />
          </div>
          AI Insights
          {userRole === 'admin' && (
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayInsights.map((insight, index) => (
          <div
            key={index}
            className={`
              p-4 rounded-lg border transition-all duration-300 cursor-pointer
              hover:shadow-md hover:scale-102 transform
              ${getSeverityColor(insight.severity)}
            `}
            onClick={() => handleInsightClick(insight)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-shrink-0">
                    {getTypeIcon(insight.type)}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {insight.title}
                  </h4>
                  <div className="flex items-center">
                    {getSeverityIcon(insight.severity)}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {insight.message}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </div>
        ))}

        {/* AI Features Access Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={() => navigate('/ai-features')}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Brain className="w-4 h-4 mr-2" />
            Explore All AI Features
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Role-specific AI info */}
        <div className="text-xs text-gray-500 text-center bg-white/50 p-3 rounded-lg">
          {userRole === 'admin' && (
            <>
              <Sparkles className="w-3 h-3 inline mr-1" />
              Full AI suite access • Attrition prediction • Anomaly detection
            </>
          )}
          {userRole === 'manager' && (
            <>
              <Sparkles className="w-3 h-3 inline mr-1" />
              Manager AI tools • Smart feedback • Intelligent reports
            </>
          )}
          {userRole === 'employee' && (
            <>
              <Sparkles className="w-3 h-3 inline mr-1" />
              AI-powered insights for personal productivity
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(AIInsightsWidget);
