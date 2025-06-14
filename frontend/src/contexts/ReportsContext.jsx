import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { reportService } from '@/services/reportService';
import { useAuth } from '@/hooks/useAuth';

// Initial state
const initialState = {
  // Reports data
  attendanceReport: null,
  leaveReport: null,
  payrollReport: null,
  performanceReport: null,
  smartReports: [],
  analytics: null,

  // Loading states
  loading: {
    attendance: false,
    leave: false,
    payroll: false,
    performance: false,
    smart: false,
    analytics: false
  },

  // Error states
  errors: {
    attendance: null,
    leave: null,
    payroll: null,
    performance: null,
    smart: null,
    analytics: null
  },

  // UI state
  selectedReportType: 'attendance',
  reportFilters: {
    startDate: null,
    endDate: null,
    departmentId: null,
    employeeId: null
  },
  availableReports: []
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_REPORT_DATA: 'SET_REPORT_DATA',
  SET_SELECTED_REPORT_TYPE: 'SET_SELECTED_REPORT_TYPE',
  SET_REPORT_FILTERS: 'SET_REPORT_FILTERS',
  SET_AVAILABLE_REPORTS: 'SET_AVAILABLE_REPORTS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
const reportsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.reportType]: action.payload.isLoading
        }
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.reportType]: action.payload.error
        },
        loading: {
          ...state.loading,
          [action.payload.reportType]: false
        }
      };

    case ACTIONS.SET_REPORT_DATA:
      return {
        ...state,
        [action.payload.reportType]: action.payload.data,
        loading: {
          ...state.loading,
          [action.payload.reportType.replace('Report', '').replace('smart', 'smart')]: false
        },
        errors: {
          ...state.errors,
          [action.payload.reportType.replace('Report', '').replace('smart', 'smart')]: null
        }
      };

    case ACTIONS.SET_SELECTED_REPORT_TYPE:
      return {
        ...state,
        selectedReportType: action.payload
      };

    case ACTIONS.SET_REPORT_FILTERS:
      return {
        ...state,
        reportFilters: {
          ...state.reportFilters,
          ...action.payload
        }
      };

    case ACTIONS.SET_AVAILABLE_REPORTS:
      return {
        ...state,
        availableReports: action.payload
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      };

    case ACTIONS.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Create context
const ReportsContext = createContext();

// Provider component
export const ReportsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reportsReducer, initialState);
  const { user } = useAuth();

  // Initialize available reports based on user role
  React.useEffect(() => {
    if (user?.role) {
      const availableReports = reportService.getAvailableReports(user.role);
      dispatch({
        type: ACTIONS.SET_AVAILABLE_REPORTS,
        payload: availableReports
      });
    }
  }, [user?.role]);

  // Generic report fetcher
  const fetchReport = useCallback(async (reportType, params = {}) => {
    const reportKey = reportType === 'smart' ? 'smart' : reportType;
    
    dispatch({
      type: ACTIONS.SET_LOADING,
      payload: { reportType: reportKey, isLoading: true }
    });

    try {
      let data;
      const formattedParams = reportService.formatReportParams(reportType, params);

      switch (reportType) {
        case 'attendance':
          data = await reportService.getAttendanceReport(formattedParams);
          break;
        case 'leave':
          data = await reportService.getLeaveReport(formattedParams);
          break;
        case 'payroll':
          data = await reportService.getPayrollReport(formattedParams);
          break;
        case 'performance':
          data = await reportService.getPerformanceReport(formattedParams);
          break;
        case 'smart':
          data = await reportService.generateSmartReport(params.reportType, params.parameters);
          break;
        case 'analytics':
          data = await reportService.getDashboardAnalytics();
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      const dataKey = reportType === 'analytics' ? 'analytics' : 
                     reportType === 'smart' ? 'smartReports' : 
                     `${reportType}Report`;

      dispatch({
        type: ACTIONS.SET_REPORT_DATA,
        payload: { 
          reportType: dataKey, 
          data: reportType === 'smart' ? [...state.smartReports, data] : data 
        }
      });

      return data;
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: { reportType: reportKey, error: error.message }
      });
      throw error;
    }
  }, [state.smartReports]);

  // Specific report methods
  const fetchAttendanceReport = useCallback((params) => fetchReport('attendance', params), [fetchReport]);
  const fetchLeaveReport = useCallback((params) => fetchReport('leave', params), [fetchReport]);
  const fetchPayrollReport = useCallback((params) => fetchReport('payroll', params), [fetchReport]);
  const fetchPerformanceReport = useCallback((params) => fetchReport('performance', params), [fetchReport]);
  const generateSmartReport = useCallback((reportType, parameters) => 
    fetchReport('smart', { reportType, parameters }), [fetchReport]);
  const fetchAnalytics = useCallback(() => fetchReport('analytics'), [fetchReport]);

  // UI actions
  const setSelectedReportType = useCallback((reportType) => {
    dispatch({
      type: ACTIONS.SET_SELECTED_REPORT_TYPE,
      payload: reportType
    });
  }, []);

  const setReportFilters = useCallback((filters) => {
    dispatch({
      type: ACTIONS.SET_REPORT_FILTERS,
      payload: filters
    });
  }, []);

  const clearError = useCallback((reportType) => {
    dispatch({
      type: ACTIONS.CLEAR_ERROR,
      payload: reportType
    });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_STATE });
  }, []);

  const value = {
    // State
    ...state,
    
    // Actions
    fetchAttendanceReport,
    fetchLeaveReport,
    fetchPayrollReport,
    fetchPerformanceReport,
    generateSmartReport,
    fetchAnalytics,
    setSelectedReportType,
    setReportFilters,
    clearError,
    resetState
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};

// Custom hook
export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export default ReportsContext;
