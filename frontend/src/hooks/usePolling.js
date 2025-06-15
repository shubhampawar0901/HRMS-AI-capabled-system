import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for polling API endpoints at regular intervals
 * Useful for checking report generation status or real-time updates
 */
export const usePolling = (
  pollFunction,
  interval = 5000,
  options = {}
) => {
  const {
    immediate = true,
    maxAttempts = null,
    stopCondition = null,
    onSuccess = null,
    onError = null,
    onStop = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  /**
   * Execute the poll function
   */
  const executePoll = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await pollFunction();
      
      if (!mountedRef.current) return;
      
      setData(result);
      setAttempts(prev => prev + 1);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Check stop condition
      if (stopCondition && stopCondition(result)) {
        stopPolling();
        return;
      }
      
      // Check max attempts
      if (maxAttempts && attempts + 1 >= maxAttempts) {
        stopPolling();
        return;
      }
      
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Polling error:', err);
      setError(err);
      
      // Call error callback
      if (onError) {
        onError(err);
      }
      
      // Stop polling on error (optional behavior)
      // stopPolling();
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [pollFunction, stopCondition, maxAttempts, attempts, onSuccess, onError]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (isPolling) return;
    
    setIsPolling(true);
    setAttempts(0);
    
    // Execute immediately if requested
    if (immediate) {
      executePoll();
    }
    
    // Set up interval
    intervalRef.current = setInterval(executePoll, interval);
  }, [isPolling, immediate, executePoll, interval]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (!isPolling) return;
    
    setIsPolling(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Call stop callback
    if (onStop) {
      onStop();
    }
  }, [isPolling, onStop]);

  /**
   * Restart polling
   */
  const restartPolling = useCallback(() => {
    stopPolling();
    setTimeout(startPolling, 100); // Small delay to ensure cleanup
  }, [stopPolling, startPolling]);

  /**
   * Execute poll once without starting interval
   */
  const pollOnce = useCallback(async () => {
    return await executePoll();
  }, [executePoll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    isPolling,
    attempts,
    startPolling,
    stopPolling,
    restartPolling,
    pollOnce
  };
};

/**
 * Custom hook specifically for polling report generation status
 */
export const useReportStatusPolling = (reportId, smartReportsService) => {
  const [reportStatus, setReportStatus] = useState(null);

  const pollFunction = useCallback(async () => {
    if (!reportId) return null;
    
    const response = await smartReportsService.getReportStatus(reportId);
    
    if (response.success) {
      setReportStatus(response.data);
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get report status');
  }, [reportId, smartReportsService]);

  const stopCondition = useCallback((data) => {
    return data && ['completed', 'failed'].includes(data.status);
  }, []);

  const polling = usePolling(pollFunction, 3000, {
    immediate: true,
    stopCondition,
    onSuccess: (data) => {
      console.log('Report status updated:', data);
    },
    onError: (error) => {
      console.error('Error polling report status:', error);
    },
    onStop: () => {
      console.log('Stopped polling report status');
    }
  });

  return {
    ...polling,
    reportStatus,
    isCompleted: reportStatus?.status === 'completed',
    isFailed: reportStatus?.status === 'failed',
    isGenerating: reportStatus?.status === 'generating'
  };
};

/**
 * Custom hook for polling multiple reports status
 */
export const useMultipleReportsPolling = (reportIds, smartReportsService) => {
  const [reportsStatus, setReportsStatus] = useState({});

  const pollFunction = useCallback(async () => {
    if (!reportIds || reportIds.length === 0) return {};
    
    const statusPromises = reportIds.map(async (id) => {
      try {
        const response = await smartReportsService.getReportStatus(id);
        return { id, status: response.success ? response.data : null };
      } catch (error) {
        return { id, status: null, error };
      }
    });
    
    const results = await Promise.all(statusPromises);
    const statusMap = {};
    
    results.forEach(({ id, status, error }) => {
      statusMap[id] = { status, error };
    });
    
    setReportsStatus(statusMap);
    return statusMap;
  }, [reportIds, smartReportsService]);

  const stopCondition = useCallback((data) => {
    if (!data || Object.keys(data).length === 0) return false;
    
    // Stop when all reports are either completed or failed
    return Object.values(data).every(({ status }) => 
      status && ['completed', 'failed'].includes(status.status)
    );
  }, []);

  const polling = usePolling(pollFunction, 5000, {
    immediate: true,
    stopCondition,
    onSuccess: (data) => {
      console.log('Multiple reports status updated:', data);
    }
  });

  const getReportStatus = useCallback((reportId) => {
    return reportsStatus[reportId]?.status || null;
  }, [reportsStatus]);

  const getGeneratingReports = useCallback(() => {
    return Object.entries(reportsStatus)
      .filter(([_, { status }]) => status?.status === 'generating')
      .map(([id]) => parseInt(id));
  }, [reportsStatus]);

  const getCompletedReports = useCallback(() => {
    return Object.entries(reportsStatus)
      .filter(([_, { status }]) => status?.status === 'completed')
      .map(([id]) => parseInt(id));
  }, [reportsStatus]);

  const getFailedReports = useCallback(() => {
    return Object.entries(reportsStatus)
      .filter(([_, { status }]) => status?.status === 'failed')
      .map(([id]) => parseInt(id));
  }, [reportsStatus]);

  return {
    ...polling,
    reportsStatus,
    getReportStatus,
    getGeneratingReports,
    getCompletedReports,
    getFailedReports
  };
};


