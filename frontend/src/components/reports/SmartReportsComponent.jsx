import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Sparkles, Brain, TrendingUp, AlertTriangle, Shield } from 'lucide-react';

const SmartReportsComponent = () => {
  const { user } = useAuth();
  const {
    smartReports,
    loading,
    errors,
    generateSmartReport,
    clearError
  } = useReports();

  const [selectedReportType, setSelectedReportType] = useState('');
  const [customParameters, setCustomParameters] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { 
      id: 'employee', 
      name: 'Employee Analysis', 
      description: 'AI-powered insights on employee performance and engagement',
      icon: '👥'
    },
    { 
      id: 'attendance', 
      name: 'Attendance Insights', 
      description: 'Smart analysis of attendance patterns and anomalies',
      icon: '📊'
    },
    { 
      id: 'leave', 
      name: 'Leave Patterns', 
      description: 'Intelligent analysis of leave trends and predictions',
      icon: '🏖️'
    },
    { 
      id: 'performance', 
      name: 'Performance Intelligence', 
      description: 'AI-driven performance analysis and recommendations',
      icon: '🎯'
    },
    { 
      id: 'payroll', 
      name: 'Payroll Analytics', 
      description: 'Smart payroll insights and cost optimization',
      icon: '💰'
    }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      alert('Please select a report type');
      return;
    }

    setIsGenerating(true);
    try {
      const parameters = customParameters ? 
        JSON.parse(customParameters) : 
        { period: 'last_3_months', includeRecommendations: true };
      
      await generateSmartReport(selectedReportType, parameters);
    } catch (error) {
      console.error('Error generating smart report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderAccessDenied = () => (
    <Card className="border-yellow-200">
      <CardContent className="p-8 text-center">
        <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h3>
        <p className="text-yellow-600">
          AI Smart Reports are available to administrators and managers only.
        </p>
      </CardContent>
    </Card>
  );

  const renderReportCard = (report) => (
    <Card key={report.id} className="mb-6 border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{report.reportType === 'employee' ? '👥' : 
                                        report.reportType === 'attendance' ? '📊' : 
                                        report.reportType === 'leave' ? '🏖️' : 
                                        report.reportType === 'performance' ? '🎯' : '💰'}</div>
            <div>
              <CardTitle className="text-lg">
                {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Intelligence Report
              </CardTitle>
              <p className="text-sm text-gray-500">
                Generated on {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        {report.insights?.summary && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Summary
            </h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {report.insights.summary}
            </p>
          </div>
        )}

        {/* Key Metrics */}
        {report.insights?.keyMetrics && report.insights.keyMetrics.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Key Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.insights.keyMetrics.map((metric, index) => (
                <div key={index} className="bg-white border rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-600">{metric.name}</div>
                  <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                  {metric.change && (
                    <div className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change > 0 ? '↗' : '↘'} {Math.abs(metric.change)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends */}
        {report.insights?.trends && report.insights.trends.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Trends & Patterns</h4>
            <ul className="space-y-2">
              {report.insights.trends.map((trend, index) => (
                <li key={index} className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{trend}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alerts */}
        {report.insights?.alerts && report.insights.alerts.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Alerts & Concerns
            </h4>
            <div className="space-y-2">
              {report.insights.alerts.map((alert, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Recommendations
            </h4>
            <div className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="font-medium text-purple-900">{rec.title || `Recommendation ${index + 1}`}</div>
                  <div className="text-purple-700 text-sm mt-1">{rec.description || rec}</div>
                  {rec.priority && (
                    <Badge 
                      variant="outline" 
                      className={`mt-2 ${
                        rec.priority === 'high' ? 'border-red-300 text-red-700' :
                        rec.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                        'border-green-300 text-green-700'
                      }`}
                    >
                      {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Check if user has access to smart reports
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🤖 AI Smart Reports
            </h2>
            <p className="text-gray-600">AI-powered insights and recommendations</p>
          </div>
        </div>
        {renderAccessDenied()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🤖 AI Smart Reports
          </h2>
          <p className="text-gray-600">
            Generate AI-powered insights and recommendations for your HR data
          </p>
        </div>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate New Smart Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Report Type
              </label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Custom Parameters (Optional)
              </label>
              <Textarea
                placeholder='{"period": "last_6_months", "includeRecommendations": true}'
                value={customParameters}
                onChange={(e) => setCustomParameters(e.target.value)}
                className="text-sm"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                JSON format for custom analysis parameters
              </p>
            </div>
          </div>

          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating || !selectedReportType}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating AI Report...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Smart Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {errors.smart && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.smart}
            <Button
              variant="link"
              size="sm"
              onClick={() => clearError('smart')}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Generated Reports */}
      {smartReports && smartReports.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Generated Reports</h3>
          <div className="space-y-4">
            {smartReports.map((report, index) => renderReportCard(report))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!smartReports || smartReports.length === 0) && !loading.smart && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Smart Reports Generated</h3>
            <p className="text-gray-500 mb-4">
              Generate your first AI-powered report to get intelligent insights and recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartReportsComponent;
