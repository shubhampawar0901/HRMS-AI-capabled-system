import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Eye, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Advanced attrition predictions table with responsive design
 * @param {Object} props - Component props
 * @param {Array} props.predictions - Prediction data
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.onViewDetails - View details callback
 * @param {Function} props.onGenerateReport - Generate report callback
 * @returns {JSX.Element} Attrition table component
 */
const AttritionTable = ({ 
  predictions = [], 
  isLoading, 
  onViewDetails, 
  onGenerateReport 
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());

  const toggleRowExpansion = (employeeId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleRowSelection = (employeeId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedRows(newSelected);
  };

  const getRiskVariant = (riskLevel) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    };
    return variants[riskLevel] || 'default';
  };

  const getRiskIcon = (riskLevel) => {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <TrendingUp className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Attrition Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-[200px] animate-pulse" />
                  <div className="h-4 bg-muted rounded w-[150px] animate-pulse" />
                </div>
                <div className="h-8 w-[100px] bg-muted rounded animate-pulse" />
                <div className="h-8 w-[80px] bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!predictions.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Attrition Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Predictions Available
            </h3>
            <p className="text-muted-foreground mb-4">
              Generate attrition predictions to see employee risk analysis here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Attrition Risk Analysis
          <Badge variant="outline" className="ml-2">
            {predictions.length} employees
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Key Factors</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction) => (
                <React.Fragment key={prediction.employeeId}>
                  <TableRow 
                    className={cn(
                      "transition-colors hover:bg-muted/50",
                      selectedRows.has(prediction.employeeId) && "bg-muted/30"
                    )}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(prediction.employeeId)}
                        className="h-8 w-8 p-0"
                      >
                        {expandedRows.has(prediction.employeeId) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {prediction.employeeName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {prediction.employeeName || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {prediction.employeeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{prediction.department}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={prediction.riskPercentage} 
                          className="w-16 h-2" 
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {prediction.riskPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getRiskVariant(prediction.riskLevel)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getRiskIcon(prediction.riskLevel)}
                        {prediction.riskLevel?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {prediction.factors?.slice(0, 2).map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {prediction.factors?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{prediction.factors.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onViewDetails?.(prediction)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onGenerateReport?.(prediction)}
                          className="h-8 w-8 p-0"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Row Content */}
                  {expandedRows.has(prediction.employeeId) && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/20">
                        <ExpandedRowContent prediction={prediction} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {predictions.map((prediction) => (
            <MobileEmployeeCard
              key={prediction.employeeId}
              prediction={prediction}
              onViewDetails={onViewDetails}
              onGenerateReport={onGenerateReport}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Expanded row content showing additional details
 */
const ExpandedRowContent = ({ prediction }) => (
  <div className="py-4 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium text-sm mb-2">All Risk Factors</h4>
        <div className="flex flex-wrap gap-1">
          {prediction.factors?.map((factor, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {factor.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium text-sm mb-2">Recommendations</h4>
        <div className="space-y-1">
          {prediction.recommendations?.map((rec, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              • {rec.replace(/_/g, ' ')}
            </p>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Get risk variant for badge styling
 */
const getRiskVariant = (riskLevel) => {
  const variants = {
    low: 'default',
    medium: 'secondary',
    high: 'destructive',
    critical: 'destructive'
  };
  return variants[riskLevel] || 'default';
};

/**
 * Mobile card view for individual employee
 */
const MobileEmployeeCard = ({ prediction, onViewDetails, onGenerateReport }) => (
  <Card className="transition-all duration-200 hover:shadow-md">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {prediction.employeeName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{prediction.employeeName || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">{prediction.department}</p>
          </div>
        </div>
        <Badge variant={getRiskVariant(prediction.riskLevel)}>
          {prediction.riskLevel?.toUpperCase()}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Risk Score</span>
            <span className="text-sm font-medium">{prediction.riskPercentage}%</span>
          </div>
          <Progress value={prediction.riskPercentage} className="h-2" />
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Key Factors</p>
          <div className="flex flex-wrap gap-1">
            {prediction.factors?.slice(0, 3).map((factor, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {factor.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onViewDetails?.(prediction)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onGenerateReport?.(prediction)}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AttritionTable;
