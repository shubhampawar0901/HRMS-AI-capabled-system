import React from 'react';

/**
 * Loading Spinner Component
 * Reusable loading spinner with different sizes and styles
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'indigo', 
  text = null,
  className = '',
  fullScreen = false 
}) => {
  
  /**
   * Get size classes
   */
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-12 w-12';
      case 'md':
      default:
        return 'h-6 w-6';
    }
  };

  /**
   * Get color classes
   */
  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white';
      case 'gray':
        return 'border-gray-600';
      case 'blue':
        return 'border-blue-600';
      case 'green':
        return 'border-green-600';
      case 'red':
        return 'border-red-600';
      case 'yellow':
        return 'border-yellow-600';
      case 'purple':
        return 'border-purple-600';
      case 'indigo':
      default:
        return 'border-indigo-600';
    }
  };

  /**
   * Get text size classes
   */
  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      case 'xl':
        return 'text-lg';
      case 'md':
      default:
        return 'text-sm';
    }
  };

  const spinnerClasses = `
    animate-spin rounded-full border-2 border-t-transparent
    ${getSizeClasses()}
    ${getColorClasses()}
    ${className}
  `;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={spinnerClasses} />
      {text && (
        <p className={`text-gray-600 ${getTextSizeClasses()}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Inline Loading Spinner
 * Small spinner for inline use (buttons, etc.)
 */
export const InlineSpinner = ({ 
  size = 'sm', 
  color = 'white',
  className = '' 
}) => (
  <LoadingSpinner 
    size={size} 
    color={color} 
    className={className}
  />
);

/**
 * Page Loading Spinner
 * Full page loading state
 */
export const PageLoader = ({ 
  text = 'Loading...',
  className = '' 
}) => (
  <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
    <LoadingSpinner 
      size="xl" 
      color="indigo" 
      text={text}
    />
  </div>
);

/**
 * Card Loading Spinner
 * Loading state for cards and containers
 */
export const CardLoader = ({ 
  text = null,
  className = '' 
}) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <LoadingSpinner 
      size="lg" 
      color="indigo" 
      text={text}
    />
  </div>
);

/**
 * Button Loading Spinner
 * Loading state for buttons
 */
export const ButtonLoader = ({ 
  color = 'white',
  className = '' 
}) => (
  <LoadingSpinner 
    size="sm" 
    color={color} 
    className={className}
  />
);

/**
 * Skeleton Loading Component
 * Alternative to spinner for content placeholders
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    {[...Array(lines)].map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

/**
 * Table Skeleton Loader
 */
export const TableSkeletonLoader = ({ 
  rows = 5, 
  columns = 4,
  className = '' 
}) => (
  <div className={`animate-pulse ${className}`}>
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4 py-3 border-b border-gray-200" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, colIndex) => (
          <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

/**
 * Card Skeleton Loader
 */
export const CardSkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse bg-white rounded-lg shadow p-6 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="mt-6 flex justify-between">
      <div className="h-8 bg-gray-200 rounded w-20"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export default LoadingSpinner;
