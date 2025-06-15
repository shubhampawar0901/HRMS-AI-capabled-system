/**
 * Anomaly Detection Context
 * Comprehensive state management for attendance anomaly detection features
 * 
 * Features:
 * - Centralized state management with React Context
 * - Performance optimizations with React.memo, useMemo, useCallback
 * - Auto-refresh functionality with configurable intervals
 * - Filter management with persistence
 * - Error handling and loading states
 * - Role-based data filtering
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import anomalyDetectionService from '@/services/anomalyDetectionService';
import { useAuthContext } from '@/contexts/AuthContext';

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  // Data State
  anomalies: [],
  selectedAnomaly: null,
  summary: {
    totalActive: 0,
    newThisWeek: 0,
    resolvedThisMonth: 0,
    highPriority: 0,
    trends: {
      weeklyChange: 0,
      monthlyChange: 0,
      severityDistribution: { high: 0, medium: 0, low: 0 }
    }
  },
  
  // UI State
  loading: false,
  error: null,
  isDetecting: false,
  detectionProgress: 0,
  
  // Filter State
  filters: {
    status: 'active',
    severity: 'all',
    employeeId: null,
    dateRange: {
      startDate: null,
      endDate: null
    }
  },
  
  // Pagination State
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  
  // Auto-refresh State
  autoRefresh: {
    enabled: true,
    interval: 300000, // 5 minutes
    lastRefresh: null
  }
};

// ==========================================
// ACTION TYPES
// ==========================================

const ActionTypes = {
  // Data Actions
  SET_ANOMALIES: 'SET_ANOMALIES',
  ADD_ANOMALY: 'ADD_ANOMALY',
  UPDATE_ANOMALY: 'UPDATE_ANOMALY',
  REMOVE_ANOMALY: 'REMOVE_ANOMALY',
  SET_SELECTED_ANOMALY: 'SET_SELECTED_ANOMALY',
  SET_SUMMARY: 'SET_SUMMARY',
  
  // UI Actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_DETECTING: 'SET_DETECTING',
  SET_DETECTION_PROGRESS: 'SET_DETECTION_PROGRESS',
  
  // Filter Actions
  SET_FILTERS: 'SET_FILTERS',
  UPDATE_FILTER: 'UPDATE_FILTER',
  RESET_FILTERS: 'RESET_FILTERS',
  
  // Pagination Actions
  SET_PAGINATION: 'SET_PAGINATION',
  UPDATE_PAGE: 'UPDATE_PAGE',
  
  // Auto-refresh Actions
  SET_AUTO_REFRESH: 'SET_AUTO_REFRESH',
  UPDATE_LAST_REFRESH: 'UPDATE_LAST_REFRESH'
};

// ==========================================
// REDUCER
// ==========================================

const anomalyDetectionReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_ANOMALIES:
      return {
        ...state,
        anomalies: action.payload,
        loading: false,
        error: null
      };
      
    case ActionTypes.ADD_ANOMALY:
      return {
        ...state,
        anomalies: [action.payload, ...state.anomalies]
      };
      
    case ActionTypes.UPDATE_ANOMALY:
      return {
        ...state,
        anomalies: state.anomalies.map(anomaly =>
          anomaly.id === action.payload.id ? { ...anomaly, ...action.payload } : anomaly
        )
      };
      
    case ActionTypes.REMOVE_ANOMALY:
      return {
        ...state,
        anomalies: state.anomalies.filter(anomaly => anomaly.id !== action.payload)
      };
      
    case ActionTypes.SET_SELECTED_ANOMALY:
      return {
        ...state,
        selectedAnomaly: action.payload
      };
      
    case ActionTypes.SET_SUMMARY:
      return {
        ...state,
        summary: { ...state.summary, ...action.payload }
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        isDetecting: false
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ActionTypes.SET_DETECTING:
      return {
        ...state,
        isDetecting: action.payload,
        detectionProgress: action.payload ? 0 : state.detectionProgress
      };
      
    case ActionTypes.SET_DETECTION_PROGRESS:
      return {
        ...state,
        detectionProgress: action.payload
      };
      
    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 } // Reset to first page
      };
      
    case ActionTypes.UPDATE_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value
        },
        pagination: { ...state.pagination, page: 1 } // Reset to first page
      };
      
    case ActionTypes.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
        pagination: { ...state.pagination, page: 1 }
      };
      
    case ActionTypes.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
      
    case ActionTypes.UPDATE_PAGE:
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload }
      };
      
    case ActionTypes.SET_AUTO_REFRESH:
      return {
        ...state,
        autoRefresh: { ...state.autoRefresh, ...action.payload }
      };
      
    case ActionTypes.UPDATE_LAST_REFRESH:
      return {
        ...state,
        autoRefresh: { ...state.autoRefresh, lastRefresh: action.payload }
      };
      
    default:
      return state;
  }
};

// ==========================================
// CONTEXT CREATION
// ==========================================

const AnomalyDetectionContext = createContext(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const AnomalyDetectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(anomalyDetectionReducer, initialState);
  const { user } = useAuthContext();

  // ==========================================
  // MEMOIZED SELECTORS
  // ==========================================

  const filteredAnomalies = useMemo(() => {
    return state.anomalies.filter(anomaly => {
      // Status filter
      if (state.filters.status !== 'all' && anomaly.status !== state.filters.status) {
        return false;
      }
      
      // Severity filter
      if (state.filters.severity !== 'all' && anomaly.severity !== state.filters.severity) {
        return false;
      }
      
      // Employee filter
      if (state.filters.employeeId && anomaly.employeeId !== state.filters.employeeId) {
        return false;
      }
      
      // Date range filter
      if (state.filters.dateRange.startDate || state.filters.dateRange.endDate) {
        const anomalyDate = new Date(anomaly.detectedDate);
        
        if (state.filters.dateRange.startDate) {
          const startDate = new Date(state.filters.dateRange.startDate);
          if (anomalyDate < startDate) return false;
        }
        
        if (state.filters.dateRange.endDate) {
          const endDate = new Date(state.filters.dateRange.endDate);
          if (anomalyDate > endDate) return false;
        }
      }
      
      return true;
    });
  }, [state.anomalies, state.filters]);

  const paginatedAnomalies = useMemo(() => {
    const startIndex = (state.pagination.page - 1) * state.pagination.limit;
    const endIndex = startIndex + state.pagination.limit;
    return filteredAnomalies.slice(startIndex, endIndex);
  }, [filteredAnomalies, state.pagination.page, state.pagination.limit]);

  // ==========================================
  // API ACTIONS
  // ==========================================

  const fetchAnomalies = useCallback(async (options = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const filters = { ...state.filters, ...options };
      const response = await anomalyDetectionService.getAnomalies({
        ...filters,
        page: state.pagination.page,
        limit: state.pagination.limit
      });

      if (response.success) {
        dispatch({ type: ActionTypes.SET_ANOMALIES, payload: response.data });
        
        if (response.pagination) {
          dispatch({ type: ActionTypes.SET_PAGINATION, payload: response.pagination });
        }
        
        // Update summary if provided
        if (response.summary) {
          dispatch({ type: ActionTypes.SET_SUMMARY, payload: response.summary });
        }
        
        dispatch({ type: ActionTypes.UPDATE_LAST_REFRESH, payload: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.userMessage || error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [state.filters, state.pagination.page, state.pagination.limit]);

  const detectAnomalies = useCallback(async (employeeId = null, dateRange = null) => {
    try {
      dispatch({ type: ActionTypes.SET_DETECTING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      // Use provided date range or default to last 7 days
      const analysisDateRange = dateRange || {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      };

      // Simulate progress updates
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 10, 90);
        dispatch({ type: ActionTypes.SET_DETECTION_PROGRESS, payload: currentProgress });
      }, 500);

      const response = await anomalyDetectionService.detectAnomalies(employeeId, analysisDateRange);

      clearInterval(progressInterval);
      dispatch({ type: ActionTypes.SET_DETECTION_PROGRESS, payload: 100 });

      if (response.success) {
        // Add new anomalies to the list
        if (response.data && response.data.length > 0) {
          response.data.forEach(anomaly => {
            dispatch({ type: ActionTypes.ADD_ANOMALY, payload: anomaly });
          });
        }
        
        // Refresh the full list to get updated data
        await fetchAnomalies();
      }
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.userMessage || error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_DETECTING, payload: false });
      dispatch({ type: ActionTypes.SET_DETECTION_PROGRESS, payload: 0 });
    }
  }, [fetchAnomalies]);

  const resolveAnomaly = useCallback(async (anomalyId, resolution = '') => {
    try {
      const response = await anomalyDetectionService.resolveAnomaly(anomalyId, resolution);

      if (response.success) {
        dispatch({
          type: ActionTypes.UPDATE_ANOMALY,
          payload: { id: anomalyId, status: 'resolved', resolution, resolvedAt: new Date().toISOString() }
        });
      }
    } catch (error) {
      console.error('Error resolving anomaly:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.userMessage || error.message });
    }
  }, []);

  const ignoreAnomaly = useCallback(async (anomalyId, reason = '') => {
    try {
      const response = await anomalyDetectionService.ignoreAnomaly(anomalyId, reason);

      if (response.success) {
        dispatch({
          type: ActionTypes.UPDATE_ANOMALY,
          payload: { id: anomalyId, status: 'ignored', ignoreReason: reason, ignoredAt: new Date().toISOString() }
        });
      }
    } catch (error) {
      console.error('Error ignoring anomaly:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.userMessage || error.message });
    }
  }, []);

  const fetchAnomalyStats = useCallback(async (options = {}) => {
    try {
      const response = await anomalyDetectionService.getAnomalyStats(options);

      if (response.success) {
        dispatch({ type: ActionTypes.SET_SUMMARY, payload: response.data });
      }
    } catch (error) {
      console.error('Error fetching anomaly stats:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.userMessage || error.message });
    }
  }, []);

  // ==========================================
  // FILTER ACTIONS
  // ==========================================

  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: newFilters });
  }, []);

  const updateFilter = useCallback((key, value) => {
    dispatch({ type: ActionTypes.UPDATE_FILTER, payload: { key, value } });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_FILTERS });
  }, []);

  // ==========================================
  // PAGINATION ACTIONS
  // ==========================================

  const updatePage = useCallback((page) => {
    dispatch({ type: ActionTypes.UPDATE_PAGE, payload: page });
  }, []);

  const updatePagination = useCallback((paginationData) => {
    dispatch({ type: ActionTypes.SET_PAGINATION, payload: paginationData });
  }, []);

  // ==========================================
  // UI ACTIONS
  // ==========================================

  const setSelectedAnomaly = useCallback((anomaly) => {
    dispatch({ type: ActionTypes.SET_SELECTED_ANOMALY, payload: anomaly });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchAnomalies(),
      fetchAnomalyStats()
    ]);
  }, [fetchAnomalies, fetchAnomalyStats]);

  // ==========================================
  // AUTO-REFRESH EFFECT
  // ==========================================

  useEffect(() => {
    let intervalId;

    if (state.autoRefresh.enabled && state.autoRefresh.interval > 0) {
      intervalId = setInterval(() => {
        refreshData();
      }, state.autoRefresh.interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.autoRefresh.enabled, state.autoRefresh.interval, refreshData]);

  // ==========================================
  // AUTO-DETECTION FOR ADMIN USERS
  // ==========================================

  useEffect(() => {
    if (user?.role === 'admin') {
      // Auto-run detection when admin opens the page
      const runAutoDetection = async () => {
        const lastWeek = {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        };

        await detectAnomalies(null, lastWeek);
      };

      // Run with a small delay to allow page to load
      const timer = setTimeout(runAutoDetection, 1000);
      return () => clearTimeout(timer);
    }
  }, [user?.role, detectAnomalies]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const contextValue = useMemo(() => ({
    // State
    ...state,
    filteredAnomalies,
    paginatedAnomalies,

    // Actions
    fetchAnomalies,
    detectAnomalies,
    resolveAnomaly,
    ignoreAnomaly,
    fetchAnomalyStats,

    // Filter Actions
    updateFilters,
    updateFilter,
    resetFilters,

    // Pagination Actions
    updatePage,
    updatePagination,

    // UI Actions
    setSelectedAnomaly,
    clearError,
    refreshData
  }), [
    state,
    filteredAnomalies,
    paginatedAnomalies,
    fetchAnomalies,
    detectAnomalies,
    resolveAnomaly,
    ignoreAnomaly,
    fetchAnomalyStats,
    updateFilters,
    updateFilter,
    resetFilters,
    updatePage,
    updatePagination,
    setSelectedAnomaly,
    clearError,
    refreshData
  ]);

  return (
    <AnomalyDetectionContext.Provider value={contextValue}>
      {children}
    </AnomalyDetectionContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAnomalyDetection = () => {
  const context = useContext(AnomalyDetectionContext);

  if (context === undefined) {
    throw new Error('useAnomalyDetection must be used within an AnomalyDetectionProvider');
  }

  return context;
};

// ==========================================
// PERFORMANCE OPTIMIZED COMPONENTS
// ==========================================

export const AnomalyDetectionConsumer = React.memo(({ children }) => {
  return (
    <AnomalyDetectionContext.Consumer>
      {children}
    </AnomalyDetectionContext.Consumer>
  );
});

AnomalyDetectionConsumer.displayName = 'AnomalyDetectionConsumer';

export default AnomalyDetectionContext;
