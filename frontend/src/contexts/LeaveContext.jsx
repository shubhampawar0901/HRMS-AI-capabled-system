import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { leaveService } from '@/services/leaveService';
import { useAuth } from '@/hooks/useAuth';

// Create contexts
const LeaveContext = createContext(null);
const LeaveDispatchContext = createContext(null);

// Action types
const LEAVE_ACTIONS = {
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Leave applications
  SET_APPLICATIONS: 'SET_APPLICATIONS',
  ADD_APPLICATION: 'ADD_APPLICATION',
  UPDATE_APPLICATION: 'UPDATE_APPLICATION',
  REMOVE_APPLICATION: 'REMOVE_APPLICATION',
  
  // Leave balance
  SET_BALANCE: 'SET_BALANCE',
  UPDATE_BALANCE: 'UPDATE_BALANCE',
  
  // Leave types
  SET_LEAVE_TYPES: 'SET_LEAVE_TYPES',
  
  // Leave calendar
  SET_CALENDAR: 'SET_CALENDAR',
  
  // Team data (managers/admin)
  SET_TEAM_APPLICATIONS: 'SET_TEAM_APPLICATIONS',
  UPDATE_TEAM_APPLICATION: 'UPDATE_TEAM_APPLICATION',
  
  // Pagination
  SET_PAGINATION: 'SET_PAGINATION',
  
  // Filters
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS'
};

// Initial state
const initialState = {
  // Loading states
  isLoading: false,
  isSubmitting: false,
  error: null,
  
  // Leave applications
  applications: [],
  currentApplication: null,
  
  // Leave balance
  balance: [],
  
  // Leave types
  leaveTypes: [],
  
  // Leave calendar
  calendar: [],
  
  // Team data (for managers/admin)
  teamApplications: [],
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  
  // Filters
  filters: {
    status: 'all',
    leaveType: 'all',
    dateRange: null,
    employeeId: null
  }
};

// Reducer function
function leaveReducer(state, action) {
  switch (action.type) {
    case LEAVE_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
        isSubmitting: action.payload.isSubmitting || state.isSubmitting
      };
      
    case LEAVE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSubmitting: false
      };
      
    case LEAVE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case LEAVE_ACTIONS.SET_APPLICATIONS:
      return {
        ...state,
        applications: action.payload.applications || [],
        pagination: action.payload.pagination || state.pagination,
        isLoading: false
      };
      
    case LEAVE_ACTIONS.ADD_APPLICATION:
      return {
        ...state,
        applications: [action.payload, ...state.applications],
        isSubmitting: false
      };
      
    case LEAVE_ACTIONS.UPDATE_APPLICATION:
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id ? { ...app, ...action.payload } : app
        ),
        teamApplications: state.teamApplications.map(app =>
          app.id === action.payload.id ? { ...app, ...action.payload } : app
        ),
        isSubmitting: false
      };
      
    case LEAVE_ACTIONS.REMOVE_APPLICATION:
      return {
        ...state,
        applications: state.applications.filter(app => app.id !== action.payload),
        teamApplications: state.teamApplications.filter(app => app.id !== action.payload)
      };
      
    case LEAVE_ACTIONS.SET_BALANCE:
      return {
        ...state,
        balance: action.payload,
        isLoading: false
      };
      
    case LEAVE_ACTIONS.UPDATE_BALANCE:
      return {
        ...state,
        balance: state.balance.map(item =>
          item.leaveTypeId === action.payload.leaveTypeId
            ? { ...item, ...action.payload }
            : item
        )
      };
      
    case LEAVE_ACTIONS.SET_LEAVE_TYPES:
      return {
        ...state,
        leaveTypes: action.payload,
        isLoading: false
      };
      
    case LEAVE_ACTIONS.SET_CALENDAR:
      return {
        ...state,
        calendar: action.payload,
        isLoading: false
      };
      
    case LEAVE_ACTIONS.SET_TEAM_APPLICATIONS:
      return {
        ...state,
        teamApplications: action.payload.applications || [],
        pagination: action.payload.pagination || state.pagination,
        isLoading: false
      };
      
    case LEAVE_ACTIONS.UPDATE_TEAM_APPLICATION:
      return {
        ...state,
        teamApplications: state.teamApplications.map(app =>
          app.id === action.payload.id ? { ...app, ...action.payload } : app
        )
      };
      
    case LEAVE_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
      
    case LEAVE_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
      
    case LEAVE_ACTIONS.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters
      };
      
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

// Provider component
export function LeaveProvider({ children }) {
  const [state, dispatch] = useReducer(leaveReducer, initialState);
  const { user } = useAuth();

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => state, [state]);
  const dispatchValue = useMemo(() => dispatch, [dispatch]);

  return (
    <LeaveContext.Provider value={contextValue}>
      <LeaveDispatchContext.Provider value={dispatchValue}>
        {children}
      </LeaveDispatchContext.Provider>
    </LeaveContext.Provider>
  );
}

// Custom hooks for consuming context
export function useLeaveState() {
  const context = useContext(LeaveContext);
  if (context === null) {
    throw new Error('useLeaveState must be used within a LeaveProvider');
  }
  return context;
}

export function useLeaveDispatch() {
  const context = useContext(LeaveDispatchContext);
  if (context === null) {
    throw new Error('useLeaveDispatch must be used within a LeaveProvider');
  }
  return context;
}

// Export action types for use in components
export { LEAVE_ACTIONS };
