import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  User,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Building,
  Mail,
  Phone,
  FileText,
  Download,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Employee attrition detail modal with comprehensive analysis
 * @param {Object} props - Component props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onOpenChange - Modal state change handler
 * @param {Object} props.employee - Selected employee data
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Employee detail modal
 */
const AttritionDetailModal = ({ 
  open, 
  onOpenChange, 
  employee, 
  isLoading 
}) => {
  if (!employee && !isLoading) return null;

  const getRiskVariant = (riskLevel) => {
    const variants = {
      low: 'default',
      medium: 'secondary', 
      high: 'destructive',
      critical: 'destructive'
    };
    return variants[riskLevel] || 'default';
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      low: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      high: 'text-orange-600 dark:text-orange-400',
      critical: 'text-red-600 dark:text-red-400'
    };
    return colors[riskLevel] || 'text-gray-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFactorLabel = (factor) => {
    return factor
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRecommendationDescription = (recommendation) => {
    const descriptions = {
      schedule_one_on_one: 'Schedule a private meeting to discuss career goals and concerns',
      review_workload: 'Assess current workload and redistribute tasks if necessary',
      career_development: 'Provide opportunities for skill development and career advancement',
      workload_adjustment: 'Reduce or redistribute workload to prevent burnout',
      performance_improvement: 'Implement a structured performance improvement plan',
      team_integration: 'Improve team dynamics and collaboration opportunities'
    };
    
    return descriptions[recommendation] || 'Take appropriate action based on risk factors';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Attrition Risk Analysis
            {employee && (
              <span className="font-normal text-muted-foreground">
                - {employee.employeeName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-muted rounded-lg" />
                <div className="h-24 bg-muted rounded-lg" />
              </div>
              <div className="h-48 bg-muted rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Employee Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {employee?.employeeName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {employee?.employeeName || 'Unknown Employee'}
                        </h3>
                        <p className="text-muted-foreground">
                          {employee?.position || 'N/A'} • {employee?.department || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Employee ID: {employee?.employeeId}
                        </p>
                      </div>
                      <Badge 
                        variant={getRiskVariant(employee?.riskLevel)}
                        className="text-sm px-3 py-1"
                      >
                        {employee?.riskLevel?.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Risk Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className={cn("font-bold text-lg", getRiskColor(employee?.riskLevel))}>
                        {employee?.riskPercentage || 0}%
                      </span>
                    </div>
                    <Progress 
                      value={employee?.riskPercentage || 0} 
                      className="h-3"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Level</span>
                      <Badge variant={getRiskVariant(employee?.riskLevel)}>
                        {employee?.riskLevel?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Prediction Date</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(employee?.predictionDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Model Version</span>
                      <span className="text-sm text-muted-foreground">
                        {employee?.modelVersion || '1.0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((employee?.confidence || 0.85) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contributing Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Contributing Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {employee?.factors?.length > 0 ? (
                      employee.factors.map((factor, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <span className="text-sm font-medium">
                            {formatFactorLabel(factor)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            High Impact
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No specific risk factors identified
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee?.recommendations?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <h4 className="font-medium text-sm">
                          {formatFactorLabel(rec)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {getRecommendationDescription(rec)}
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                          Take Action
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No specific recommendations available at this time
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Analysis
              </Button>
              <Button variant="outline" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttritionDetailModal;
