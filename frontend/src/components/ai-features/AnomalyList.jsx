/**
 * Anomaly List Component
 * Displays filtered anomalies in a responsive grid layout
 * 
 * Features:
 * - Responsive grid layout with smooth animations
 * - Individual anomaly cards with hover effects
 * - Pagination controls with smooth transitions
 * - Empty states with helpful messages
 * - Loading states with skeleton animations
 * - Mobile-optimized touch interactions
 */

import React, { useState } from 'react';
import { useAnomalyDetection } from '@/contexts/AnomalyDetectionContext';
import AnomalyCard from './AnomalyCard';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

/**
 * Pagination Component
 */
const Pagination = React.memo(({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (start > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }
      
      if (end < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={loading || page === '...'}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${currentPage === page
              ? 'ai-button text-white'
              : page === '...'
                ? 'text-gray-400 cursor-default'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

/**
 * Empty State Component
 */
const EmptyState = React.memo(({ filters, onResetFilters }) => {
  const hasActiveFilters = filters.severity !== 'all' || 
                          filters.status !== 'active' || 
                          filters.dateRange.startDate || 
                          filters.dateRange.endDate;

  return (
    <div className="ai-card p-12 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        {hasActiveFilters ? (
          <Search className="w-8 h-8 text-gray-400" />
        ) : (
          <CheckCircle className="w-8 h-8 text-green-500" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hasActiveFilters ? 'No Anomalies Found' : 'No Active Anomalies'}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {hasActiveFilters 
          ? 'No anomalies match your current filter criteria. Try adjusting your filters or running a new detection.'
          : 'Great news! No attendance anomalies have been detected. Your team\'s attendance patterns look healthy.'
        }
      </p>
      
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="ai-button px-6 py-2"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

/**
 * Loading Skeleton Component
 */
const LoadingSkeleton = React.memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="ai-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="ai-shimmer h-4 w-24 rounded"></div>
            <div className="ai-shimmer h-6 w-16 rounded-full"></div>
          </div>
          <div className="ai-shimmer h-5 w-32 rounded mb-2"></div>
          <div className="ai-shimmer h-4 w-full rounded mb-3"></div>
          <div className="ai-shimmer h-4 w-3/4 rounded mb-4"></div>
          <div className="flex space-x-2">
            <div className="ai-shimmer h-8 w-20 rounded"></div>
            <div className="ai-shimmer h-8 w-20 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

/**
 * Main Anomaly List Component
 */
const AnomalyList = React.memo(({ onViewDetails }) => {
  const {
    paginatedAnomalies,
    filteredAnomalies,
    loading,
    filters,
    pagination,
    updatePage,
    resetFilters,
    resolveAnomaly,
    ignoreAnomaly
  } = useAnomalyDetection();

  const [actionLoading, setActionLoading] = useState({});

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleResolve = async (anomalyId) => {
    setActionLoading(prev => ({ ...prev, [anomalyId]: 'resolving' }));
    try {
      await resolveAnomaly(anomalyId, 'Resolved from anomaly list');
    } catch (error) {
      console.error('Error resolving anomaly:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [anomalyId]: null }));
    }
  };

  const handleIgnore = async (anomalyId) => {
    setActionLoading(prev => ({ ...prev, [anomalyId]: 'ignoring' }));
    try {
      await ignoreAnomaly(anomalyId, 'Ignored from anomaly list');
    } catch (error) {
      console.error('Error ignoring anomaly:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [anomalyId]: null }));
    }
  };

  const handlePageChange = (newPage) => {
    updatePage(newPage);
  };

  // ==========================================
  // CALCULATE PAGINATION
  // ==========================================

  const totalItems = filteredAnomalies.length;
  const totalPages = Math.ceil(totalItems / pagination.limit);
  const currentPage = pagination.page;

  // ==========================================
  // RENDER LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Detected Anomalies
          </h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  // ==========================================
  // RENDER EMPTY STATE
  // ==========================================

  if (filteredAnomalies.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Detected Anomalies
          </h2>
        </div>
        <EmptyState filters={filters} onResetFilters={resetFilters} />
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Detected Anomalies
          </h2>
          <span className="ai-badge">
            {totalItems} {totalItems === 1 ? 'anomaly' : 'anomalies'}
          </span>
        </div>
      </div>

      {/* Anomalies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedAnomalies.map((anomaly, index) => (
          <div
            key={anomaly.id}
            className="ai-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AnomalyCard
              anomaly={anomaly}
              onViewDetails={onViewDetails}
              onResolve={handleResolve}
              onIgnore={handleIgnore}
              loading={actionLoading[anomaly.id]}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
});

AnomalyList.displayName = 'AnomalyList';

export default AnomalyList;
