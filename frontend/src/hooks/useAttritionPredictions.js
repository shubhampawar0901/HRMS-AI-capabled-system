import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import attritionService from '@/services/attritionService';

/**
 * Custom hook for managing attrition predictions data
 * @param {Object} filters - Filter parameters
 * @returns {Object} Query state and mutation functions
 */
export const useAttritionPredictions = (filters = {}) => {
  const queryClient = useQueryClient();

  // Main predictions query
  const {
    data: rawResponse,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['attrition-predictions', filters],
    queryFn: () => attritionService.getPredictions(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes - data considered fresh
    cacheTime: 10 * 60 * 1000, // 10 minutes - cache retention
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: 3, // Retry failed requests
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Only run query if we have valid filters
    enabled: true,
    
    // Handle errors gracefully
    onError: (error) => {
      console.error('Failed to fetch attrition predictions:', error);
      toast.error(error.message || 'Failed to load predictions');
    }
  });

  // Extract predictions from response
  const predictions = useMemo(() => {
    return rawResponse?.data?.predictions || [];
  }, [rawResponse]);

  // Calculate summary data for cards
  const summaryData = useMemo(() => {
    if (!predictions.length) {
      return { critical: 0, high: 0, medium: 0, low: 0, total: 0, averageRisk: 0 };
    }

    const summary = predictions.reduce((acc, prediction) => {
      // Count by risk level
      acc.counts[prediction.riskLevel] = (acc.counts[prediction.riskLevel] || 0) + 1;
      
      // Sum risk scores for average calculation
      acc.totalRisk += prediction.riskScore;
      
      // Track highest risk employee
      if (prediction.riskScore > acc.highestRisk.score) {
        acc.highestRisk = {
          score: prediction.riskScore,
          employee: prediction.employeeName,
          id: prediction.employeeId
        };
      }

      return acc;
    }, {
      counts: { critical: 0, high: 0, medium: 0, low: 0 },
      totalRisk: 0,
      highestRisk: { score: 0, employee: null, id: null }
    });

    return {
      critical: summary.counts.critical,
      high: summary.counts.high,
      medium: summary.counts.medium,
      low: summary.counts.low,
      total: predictions.length,
      averageRisk: summary.totalRisk / predictions.length,
      highestRisk: summary.highestRisk
    };
  }, [predictions]);

  // Individual prediction generation mutation
  const generatePredictionMutation = useMutation({
    mutationFn: attritionService.generatePrediction,
    onSuccess: (response) => {
      // Optimistically update the cache
      queryClient.setQueryData(['attrition-predictions', filters], (oldData) => {
        if (!oldData) return oldData;
        
        const newPrediction = response.data.prediction;
        const existingPredictions = oldData.data.predictions || [];
        
        // Check if prediction already exists and update it, otherwise add new
        const existingIndex = existingPredictions.findIndex(
          p => p.employeeId === newPrediction.employeeId
        );
        
        let updatedPredictions;
        if (existingIndex >= 0) {
          updatedPredictions = [...existingPredictions];
          updatedPredictions[existingIndex] = newPrediction;
        } else {
          updatedPredictions = [...existingPredictions, newPrediction];
        }

        return {
          ...oldData,
          data: {
            ...oldData.data,
            predictions: updatedPredictions
          }
        };
      });

      toast.success('Prediction generated successfully');
    },
    onError: (error) => {
      console.error('Failed to generate prediction:', error);
      toast.error(error.message || 'Failed to generate prediction');
    }
  });

  // Bulk prediction generation (if needed in future)
  const generateBulkPredictionsMutation = useMutation({
    mutationFn: async (employeeIds) => {
      // For now, generate predictions one by one
      // In future, this could be optimized with a bulk API endpoint
      const results = await Promise.allSettled(
        employeeIds.map(id => attritionService.generatePrediction(id))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return { successful, failed, total: employeeIds.length };
    },
    onSuccess: (results) => {
      // Invalidate and refetch predictions
      queryClient.invalidateQueries(['attrition-predictions']);
      
      toast.success(
        `Generated ${results.successful.length} predictions successfully` +
        (results.failed > 0 ? `. ${results.failed} failed.` : '')
      );
    },
    onError: (error) => {
      console.error('Failed to generate bulk predictions:', error);
      toast.error('Failed to generate bulk predictions');
    }
  });

  // Refresh predictions
  const refreshPredictions = () => {
    return refetch();
  };

  // Invalidate and refetch predictions
  const invalidatePredictions = () => {
    queryClient.invalidateQueries(['attrition-predictions']);
  };

  return {
    // Data
    predictions,
    summaryData,
    
    // Loading states
    isLoading,
    isFetching,
    error,
    
    // Actions
    generatePrediction: generatePredictionMutation.mutate,
    generateBulkPredictions: generateBulkPredictionsMutation.mutate,
    refreshPredictions,
    invalidatePredictions,
    
    // Mutation states
    isGenerating: generatePredictionMutation.isLoading,
    isGeneratingBulk: generateBulkPredictionsMutation.isLoading,
    generateError: generatePredictionMutation.error,
    
    // Utility functions
    refetch
  };
};

/**
 * Hook for getting a single employee's prediction details
 * @param {number} employeeId - Employee ID
 * @returns {Object} Employee prediction details
 */
export const useEmployeePrediction = (employeeId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['employee-prediction', employeeId],
    queryFn: async () => {
      // Try to get from existing predictions first
      const predictions = queryClient.getQueryData(['attrition-predictions']);
      const existing = predictions?.data?.predictions?.find(
        p => p.employeeId === employeeId
      );

      if (existing) {
        return { data: { prediction: existing } };
      }

      // Generate new prediction if not found
      return attritionService.generatePrediction(employeeId);
    },
    enabled: !!employeeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      console.error('Failed to fetch employee prediction:', error);
      toast.error('Failed to load employee prediction');
    }
  });
};

/**
 * Hook for getting employee context data
 * @param {number} employeeId - Employee ID
 * @returns {Object} Employee context data
 */
export const useEmployeeContext = (employeeId) => {
  return useQuery({
    queryKey: ['employee-context', employeeId],
    queryFn: () => attritionService.getEmployeeContext(employeeId),
    enabled: !!employeeId,
    staleTime: 15 * 60 * 1000, // 15 minutes - employee data changes less frequently
    onError: (error) => {
      console.error('Failed to fetch employee context:', error);
    }
  });
};
