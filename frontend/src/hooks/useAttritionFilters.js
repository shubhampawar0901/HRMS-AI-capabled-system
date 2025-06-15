import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing attrition prediction filters
 * Handles filter state, URL synchronization, and validation
 * @returns {Object} Filter state and management functions
 */
export const useAttritionFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState(() => ({
    riskThreshold: searchParams.get('riskThreshold') || '0.5',
    departmentFilter: searchParams.get('department') || 'all',
    riskLevelFilter: searchParams.get('riskLevel') || 'all',
    sortBy: searchParams.get('sortBy') || 'riskScore',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 20,
    searchQuery: searchParams.get('search') || ''
  }));

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

  // Computed filter object for API calls
  const apiFilters = useMemo(() => ({
    riskThreshold: filters.riskThreshold !== 'all' ? parseFloat(filters.riskThreshold) : null,
    department: filters.departmentFilter !== 'all' ? filters.departmentFilter : null,
    riskLevel: filters.riskLevelFilter !== 'all' ? filters.riskLevelFilter : null,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
    search: debouncedSearchQuery || null
  }), [
    filters.riskThreshold,
    filters.departmentFilter,
    filters.riskLevelFilter,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.limit,
    debouncedSearchQuery
  ]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '' && value !== 1) {
        params.set(key, value.toString());
      }
    });

    // Only update URL if params actually changed
    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();
    
    if (newParamsString !== currentParamsString) {
      setSearchParams(params, { replace: true });
    }
  }, [filters, setSearchParams, searchParams]);

  // Update individual filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      // Reset page to 1 when changing filters (except pagination)
      const newFilters = { ...prev, [key]: value };
      if (key !== 'page' && key !== 'limit') {
        newFilters.page = 1;
      }
      return newFilters;
    });
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset page when updating multiple filters
    }));
  }, []);

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      riskThreshold: '0.5',
      departmentFilter: 'all',
      riskLevelFilter: 'all',
      sortBy: 'riskScore',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
      searchQuery: ''
    };
    setFilters(defaultFilters);
  }, []);

  // Pagination helpers
  const goToPage = useCallback((page) => {
    updateFilter('page', Math.max(1, page));
  }, [updateFilter]);

  const nextPage = useCallback(() => {
    updateFilter('page', filters.page + 1);
  }, [updateFilter, filters.page]);

  const previousPage = useCallback(() => {
    updateFilter('page', Math.max(1, filters.page - 1));
  }, [updateFilter, filters.page]);

  const changePageSize = useCallback((limit) => {
    updateFilters({ limit, page: 1 });
  }, [updateFilters]);

  // Sorting helpers
  const updateSort = useCallback((sortBy, sortOrder = null) => {
    const newSortOrder = sortOrder || (
      filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc'
    );
    updateFilters({ sortBy, sortOrder: newSortOrder });
  }, [updateFilters, filters.sortBy, filters.sortOrder]);

  // Risk threshold helpers
  const setRiskThreshold = useCallback((threshold) => {
    updateFilter('riskThreshold', threshold);
  }, [updateFilter]);

  // Department filter helpers
  const setDepartmentFilter = useCallback((department) => {
    updateFilter('departmentFilter', department);
  }, [updateFilter]);

  // Risk level filter helpers
  const setRiskLevelFilter = useCallback((riskLevel) => {
    updateFilter('riskLevelFilter', riskLevel);
  }, [updateFilter]);

  // Search helpers
  const setSearchQuery = useCallback((query) => {
    updateFilter('searchQuery', query);
  }, [updateFilter]);

  const clearSearch = useCallback(() => {
    updateFilter('searchQuery', '');
  }, [updateFilter]);

  // Validation helpers
  const isValidRiskThreshold = useCallback((threshold) => {
    const num = parseFloat(threshold);
    return !isNaN(num) && num >= 0 && num <= 1;
  }, []);

  const isValidPageSize = useCallback((size) => {
    const num = parseInt(size);
    return !isNaN(num) && num > 0 && num <= 100;
  }, []);

  // Filter summary for display
  const filterSummary = useMemo(() => {
    const active = [];
    
    if (filters.riskThreshold !== '0.5') {
      active.push(`Risk: ${(parseFloat(filters.riskThreshold) * 100).toFixed(0)}%+`);
    }
    
    if (filters.departmentFilter !== 'all') {
      active.push(`Dept: ${filters.departmentFilter}`);
    }
    
    if (filters.riskLevelFilter !== 'all') {
      active.push(`Level: ${filters.riskLevelFilter}`);
    }
    
    if (filters.searchQuery) {
      active.push(`Search: "${filters.searchQuery}"`);
    }

    return {
      active,
      count: active.length,
      hasActiveFilters: active.length > 0
    };
  }, [filters]);

  // Check if filters have changed from defaults
  const hasChangedFromDefaults = useMemo(() => {
    return (
      filters.riskThreshold !== '0.5' ||
      filters.departmentFilter !== 'all' ||
      filters.riskLevelFilter !== 'all' ||
      filters.sortBy !== 'riskScore' ||
      filters.sortOrder !== 'desc' ||
      filters.searchQuery !== ''
    );
  }, [filters]);

  return {
    // Current filter state
    filters,
    apiFilters,
    
    // Filter update functions
    updateFilter,
    updateFilters,
    resetFilters,
    
    // Specific filter setters
    setRiskThreshold,
    setDepartmentFilter,
    setRiskLevelFilter,
    setSearchQuery,
    clearSearch,
    
    // Pagination
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    
    // Sorting
    updateSort,
    
    // Validation
    isValidRiskThreshold,
    isValidPageSize,
    
    // Filter state info
    filterSummary,
    hasChangedFromDefaults,
    
    // Debounced values
    debouncedSearchQuery
  };
};

/**
 * Simple debounce hook
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
