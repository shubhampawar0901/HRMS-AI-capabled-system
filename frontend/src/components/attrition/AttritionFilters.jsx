import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Download, 
  Loader2, 
  Search, 
  X, 
  Filter,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Filter controls for attrition predictions
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Filter change handler
 * @param {Function} props.onGeneratePredictions - Generate predictions handler
 * @param {Function} props.onExportReport - Export report handler
 * @param {Function} props.onRefresh - Refresh data handler
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.isGenerating - Generating predictions state
 * @returns {JSX.Element} Filter controls component
 */
const AttritionFilters = ({
  filters,
  onFilterChange,
  onGeneratePredictions,
  onExportReport,
  onRefresh,
  isLoading,
  isGenerating
}) => {
  const handleRiskThresholdChange = (value) => {
    onFilterChange('riskThreshold', value);
  };

  const handleDepartmentChange = (value) => {
    onFilterChange('departmentFilter', value);
  };

  const handleRiskLevelChange = (value) => {
    onFilterChange('riskLevelFilter', value);
  };

  const handleSearchChange = (e) => {
    onFilterChange('searchQuery', e.target.value);
  };

  const clearSearch = () => {
    onFilterChange('searchQuery', '');
  };

  const clearAllFilters = () => {
    onFilterChange('reset', true);
  };

  // Mock departments - in real app, this would come from props or API
  const departments = [
    { id: 'engineering', name: 'Engineering' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Sales' },
    { id: 'hr', name: 'Human Resources' },
    { id: 'finance', name: 'Finance' },
    { id: 'operations', name: 'Operations' }
  ];

  const riskThresholds = [
    { value: '0.3', label: 'Low Risk (30%+)' },
    { value: '0.5', label: 'Medium Risk (50%+)' },
    { value: '0.7', label: 'High Risk (70%+)' },
    { value: '0.9', label: 'Critical Risk (90%+)' },
    { value: 'all', label: 'All Risk Levels' }
  ];

  const riskLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical Risk' }
  ];

  const hasActiveFilters = 
    filters.riskThreshold !== '0.5' ||
    filters.departmentFilter !== 'all' ||
    filters.riskLevelFilter !== 'all' ||
    filters.searchQuery !== '';

  return (
    <div className="space-y-4 mb-6">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={filters.searchQuery || ''}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Risk Threshold Filter */}
        <div className="min-w-[200px]">
          <Select 
            value={filters.riskThreshold || '0.5'} 
            onValueChange={handleRiskThresholdChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Risk Threshold" />
            </SelectTrigger>
            <SelectContent>
              {riskThresholds.map(threshold => (
                <SelectItem key={threshold.value} value={threshold.value}>
                  {threshold.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div className="min-w-[180px]">
          <Select 
            value={filters.departmentFilter || 'all'} 
            onValueChange={handleDepartmentChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Risk Level Filter */}
        <div className="min-w-[150px]">
          <Select 
            value={filters.riskLevelFilter || 'all'} 
            onValueChange={handleRiskLevelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              {riskLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active filters:</span>
              </div>
              
              {filters.riskThreshold !== '0.5' && (
                <Badge variant="secondary" className="text-xs">
                  Risk: {(parseFloat(filters.riskThreshold) * 100).toFixed(0)}%+
                </Badge>
              )}
              
              {filters.departmentFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Dept: {departments.find(d => d.id === filters.departmentFilter)?.name || filters.departmentFilter}
                </Badge>
              )}
              
              {filters.riskLevelFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Level: {filters.riskLevelFilter}
                </Badge>
              )}
              
              {filters.searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{filters.searchQuery}"
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-6 px-2"
              >
                Clear all
              </Button>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>

          <Button 
            onClick={onGeneratePredictions} 
            disabled={isLoading || isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Predictions'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onExportReport}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="text-xs text-muted-foreground">
          Showing filtered results • {hasActiveFilters ? 'Filters active' : 'No filters applied'}
        </div>
      )}
    </div>
  );
};

export default AttritionFilters;
