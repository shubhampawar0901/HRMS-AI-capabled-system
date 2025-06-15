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
  Loader2,
  Search,
  X,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Filter controls for attrition predictions
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Filter change handler
 * @param {Function} props.onGeneratePredictions - Generate predictions handler
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.isGenerating - Generating predictions state
 * @returns {JSX.Element} Filter controls component
 */
const AttritionFilters = ({
  filters,
  onFilterChange,
  onGeneratePredictions,
  isLoading,
  isGenerating
}) => {
  const handleRiskThresholdChange = (value) => {
    onFilterChange('riskThreshold', value);
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

  const riskThresholds = [
    { value: '0.3', label: 'Low Risk (30%+)' },
    { value: '0.5', label: 'Medium Risk (50%+)' },
    { value: '0.7', label: 'High Risk (70%+)' },
    { value: '0.9', label: 'Critical Risk (90%+)' },
    { value: 'all', label: 'All Risk Levels' }
  ];

  const hasActiveFilters =
    filters.riskThreshold !== '0.5' ||
    filters.searchQuery !== '';

  return (
    <div className="space-y-4 mb-6">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input and Generate Button Row */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              className="pl-10 pr-10 w-full sm:w-80"
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

          {/* Generate Predictions Button */}
          <Button
            onClick={onGeneratePredictions}
            disabled={isLoading || isGenerating}
            className="ai-button px-4 py-2 text-sm flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Predictions'}
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
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
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Active filters:</span>
          </div>

          {filters.riskThreshold !== '0.5' && (
            <Badge variant="secondary" className="text-xs">
              Risk: {(parseFloat(filters.riskThreshold) * 100).toFixed(0)}%+
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
        </div>
      )}

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
