import React from 'react';
import { AlertTriangle, Wifi, Server, Shield, Clock, RefreshCw } from 'lucide-react';

/**
 * Enhanced Error Display Component
 * Provides clear, actionable error messages for different types of errors
 */
const ErrorDisplay = ({ 
  error, 
  onRetry, 
  showRetry = true, 
  className = '',
  size = 'medium' 
}) => {
  if (!error) return null;

  // Determine error type and appropriate icon/message
  const getErrorInfo = (error) => {
    const errorType = error.type || 'UNKNOWN';
    const statusCode = error.statusCode;

    switch (errorType) {
      case 'NETWORK_ERROR':
        return {
          icon: <Wifi className="w-8 h-8 text-red-500" />,
          title: 'Connection Failed',
          message: 'Unable to connect to the server. Please check your internet connection.',
          suggestions: [
            'Check your internet connection',
            'Ensure the backend server is running',
            'Try refreshing the page'
          ],
          color: 'red'
        };

      case 'UNAUTHORIZED':
        return {
          icon: <Shield className="w-8 h-8 text-yellow-500" />,
          title: 'Authentication Required',
          message: 'Please log in again to continue.',
          suggestions: [
            'Your session may have expired',
            'Please log in again',
            'Contact support if the issue persists'
          ],
          color: 'yellow'
        };

      case 'FORBIDDEN':
        return {
          icon: <Shield className="w-8 h-8 text-orange-500" />,
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
          suggestions: [
            'Contact your administrator for access',
            'Ensure you have the required permissions',
            'Try logging in with a different account'
          ],
          color: 'orange'
        };

      case 'NOT_FOUND':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-blue-500" />,
          title: 'Resource Not Found',
          message: 'The requested resource could not be found.',
          suggestions: [
            'The resource may have been moved or deleted',
            'Check the URL and try again',
            'Contact support if you believe this is an error'
          ],
          color: 'blue'
        };

      case 'RATE_LIMITED':
        return {
          icon: <Clock className="w-8 h-8 text-purple-500" />,
          title: 'Too Many Requests',
          message: 'You have made too many requests. Please wait and try again.',
          suggestions: [
            'Wait a few minutes before trying again',
            'Reduce the frequency of your requests',
            'Contact support if you need higher limits'
          ],
          color: 'purple'
        };

      case 'SERVER_ERROR':
        return {
          icon: <Server className="w-8 h-8 text-red-600" />,
          title: 'Server Error',
          message: 'An internal server error occurred. Please try again later.',
          suggestions: [
            'The server is experiencing issues',
            'Try again in a few minutes',
            'Contact support if the problem persists'
          ],
          color: 'red'
        };

      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-gray-500" />,
          title: 'Something Went Wrong',
          message: error.message || 'An unexpected error occurred.',
          suggestions: [
            'Try refreshing the page',
            'Check your internet connection',
            'Contact support if the issue continues'
          ],
          color: 'gray'
        };
    }
  };

  const errorInfo = getErrorInfo(error);
  const sizeClasses = {
    small: 'p-3 text-sm',
    medium: 'p-4 text-base',
    large: 'p-6 text-lg'
  };

  return (
    <div className={`bg-white rounded-lg border-l-4 border-${errorInfo.color}-500 shadow-md ${sizeClasses[size]} ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {errorInfo.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-${errorInfo.color}-800 mb-2`}>
            {errorInfo.title}
          </h3>
          
          <p className="text-gray-700 mb-3">
            {errorInfo.message}
          </p>
          
          {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Suggestions:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Technical details for developers */}
          {process.env.NODE_ENV === 'development' && error.originalError && (
            <details className="mt-3 text-xs text-gray-500">
              <summary className="cursor-pointer font-medium">Technical Details</summary>
              <div className="mt-2 p-2 bg-gray-50 rounded border">
                <p><strong>Error Code:</strong> {error.statusCode || 'N/A'}</p>
                <p><strong>Timestamp:</strong> {error.timestamp}</p>
                <p><strong>Original Error:</strong> {error.originalError?.message}</p>
                {error.originalError?.stack && (
                  <pre className="mt-2 text-xs overflow-auto">
                    {error.originalError.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
          
          {/* Retry button */}
          {showRetry && onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-4 py-2 bg-${errorInfo.color}-600 text-white text-sm font-medium rounded-md hover:bg-${errorInfo.color}-700 focus:outline-none focus:ring-2 focus:ring-${errorInfo.color}-500 focus:ring-offset-2 transition-colors duration-200`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
