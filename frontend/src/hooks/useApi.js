import { useState, useCallback, useRef, useEffect } from 'react';
import { loadingManager } from '@/api/interceptors';

/**
 * Custom hook for API calls with loading, error handling, and caching
 * @param {Function} apiFunction - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} API state and methods
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = false,
    loadingKey = null,
    cacheKey = null,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    onSuccess = null,
    onError = null
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  /**
   * Execute API call
   * @param {...any} args - Arguments to pass to API function
   * @returns {Promise} API call promise
   */
  const execute = useCallback(async (...args) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Check cache if cacheKey is provided
    if (cacheKey) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        setError(null);
        setLastFetch(new Date(cached.timestamp));
        return cached.data;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      if (loadingKey) {
        loadingManager.setLoading(loadingKey, true);
      }

      const result = await apiFunction(...args);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setData(result.data);
      setLastFetch(new Date());

      // Cache result if cacheKey is provided
      if (cacheKey) {
        cacheRef.current.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        });
      }

      if (onSuccess) {
        onSuccess(result.data);
      }

      return result.data;
    } catch (err) {
      // Don't set error if request was aborted
      if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }

      setError(err);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
      
      if (loadingKey) {
        loadingManager.setLoading(loadingKey, false);
      }
    }
  }, [apiFunction, cacheKey, cacheTime, loadingKey, onSuccess, onError]);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setLastFetch(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Refresh data (re-execute with last arguments)
   */
  const refresh = useCallback(() => {
    if (cacheKey) {
      cacheRef.current.delete(cacheKey);
    }
    return execute();
  }, [execute, cacheKey]);

  /**
   * Clear cache for this hook
   */
  const clearCache = useCallback(() => {
    if (cacheKey) {
      cacheRef.current.delete(cacheKey);
    }
  }, [cacheKey]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    data,
    error,
    isLoading,
    lastFetch,
    execute,
    reset,
    refresh,
    clearCache,
    
    // Computed values
    hasData: data !== null,
    hasError: error !== null,
    isStale: lastFetch && Date.now() - lastFetch.getTime() > cacheTime
  };
};

/**
 * Hook for paginated API calls
 * @param {Function} apiFunction - API function that accepts page parameter
 * @param {Object} options - Hook options
 * @returns {Object} Pagination state and methods
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const {
    pageSize = 10,
    immediate = false,
    ...apiOptions
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [allData, setAllData] = useState([]);

  const {
    data,
    error,
    isLoading,
    execute: executeApi,
    reset: resetApi,
    ...rest
  } = useApi(apiFunction, {
    ...apiOptions,
    immediate: false,
    onSuccess: (result) => {
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages || 0);
        setTotalItems(result.pagination.totalItems || 0);
      }
      
      if (currentPage === 1) {
        setAllData(result.data || []);
      } else {
        setAllData(prev => [...prev, ...(result.data || [])]);
      }
      
      if (apiOptions.onSuccess) {
        apiOptions.onSuccess(result);
      }
    }
  });

  const loadPage = useCallback((page = 1) => {
    setCurrentPage(page);
    return executeApi({ page, limit: pageSize });
  }, [executeApi, pageSize]);

  const loadMore = useCallback(() => {
    if (currentPage < totalPages) {
      return loadPage(currentPage + 1);
    }
  }, [currentPage, totalPages, loadPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setTotalPages(0);
    setTotalItems(0);
    setAllData([]);
    resetApi();
  }, [resetApi]);

  // Load first page if immediate is true
  useEffect(() => {
    if (immediate) {
      loadPage(1);
    }
  }, [immediate, loadPage]);

  return {
    data: allData,
    currentData: data?.data || [],
    error,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    loadPage,
    loadMore,
    reset,
    ...rest,
    
    // Computed values
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};

export default useApi;
