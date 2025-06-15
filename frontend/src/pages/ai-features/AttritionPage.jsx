import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAttritionPredictions } from '@/hooks/useAttritionPredictions';
import { useAttritionFilters } from '@/hooks/useAttritionFilters';
import AttritionSummaryCards, { AttritionSummaryInfo } from '@/components/attrition/AttritionSummaryCards';
import AttritionTable from '@/components/attrition/AttritionTable';
import AttritionDetailModal from '@/components/attrition/AttritionDetailModal';
import AttritionFilters from '@/components/attrition/AttritionFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp } from 'lucide-react';

/**
 * Main Attrition Predictor Page
 * Combines all attrition prediction components into a comprehensive dashboard
 */
const AttritionPage = () => {
  // Filter management
  const {
    filters,
    apiFilters,
    updateFilter,
    resetFilters
  } = useAttritionFilters();

  // Data management
  const {
    predictions,
    summaryData,
    isLoading,
    isFetching,
    error,
    refreshPredictions,
    isGenerating
  } = useAttritionPredictions(apiFilters);

  // Modal state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      resetFilters();
    } else {
      updateFilter(key, value);
    }
  };

  // Handle view employee details
  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  // Handle generate predictions
  const handleGeneratePredictions = async () => {
    try {
      // For now, we'll just refresh the existing predictions
      // In a real implementation, this might trigger bulk generation
      await refreshPredictions();
      toast.success('Predictions refreshed successfully');
    } catch (error) {
      toast.error('Failed to generate predictions');
    }
  };

  // Handle export report
  const handleExportReport = () => {
    toast.info('Export functionality coming soon');
  };

  // Handle generate individual report
  const handleGenerateReport = (employee) => {
    toast.info(`Generating report for ${employee.employeeName}`);
  };

  // Handle refresh data
  const handleRefresh = () => {
    refreshPredictions();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attrition Predictor</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered employee attrition risk analysis and predictions
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'Failed to load attrition predictions. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Filter Controls */}
      <AttritionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onGeneratePredictions={handleGeneratePredictions}
        isLoading={isLoading || isFetching}
        isGenerating={isGenerating}
      />

      {/* Summary Information */}
      <AttritionSummaryInfo summaryData={summaryData} />

      {/* Summary Cards */}
      <AttritionSummaryCards
        summaryData={summaryData}
        isLoading={isLoading}
      />

      {/* Main Data Table */}
      <AttritionTable
        predictions={predictions}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />

      {/* Employee Detail Modal */}
      <AttritionDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        employee={selectedEmployee}
        isLoading={false}
      />

      {/* Empty State for No Data */}
      {!isLoading && !error && predictions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Predictions Available
            </h3>
            <p className="text-muted-foreground mb-4">
              Generate attrition predictions to see employee risk analysis here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttritionPage;
