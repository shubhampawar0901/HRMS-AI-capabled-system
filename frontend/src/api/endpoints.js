// API Endpoints Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile'
  },

  // Employee endpoints
  EMPLOYEES: {
    BASE: '/employees',
    BY_ID: (id) => `/employees/${id}`,
    CREATE: '/employees',
    UPDATE: (id) => `/employees/${id}`,
    DELETE: (id) => `/employees/${id}`,
    SEARCH: '/employees/search',
    DEPARTMENTS: '/employees/departments',
    POSITIONS: '/employees/positions',
    BULK_UPLOAD: '/employees/bulk-upload',
    EXPORT: '/employees/export',
    STATISTICS: '/employees/statistics',
    DEACTIVATE: (id) => `/employees/${id}/deactivate`,
    ACTIVATE: (id) => `/employees/${id}/activate`,
    DOCUMENTS: (id) => `/employees/${id}/documents`,
    UPLOAD_DOCUMENT: (id) => `/employees/${id}/documents`
  },

  // Attendance endpoints
  ATTENDANCE: {
    BASE: '/attendance',
    CHECK_IN: '/attendance/check-in',
    CHECK_OUT: '/attendance/check-out',
    BY_EMPLOYEE: (employeeId) => `/attendance/employee/${employeeId}`,
    BY_DATE_RANGE: '/attendance/date-range',
    STATISTICS: '/attendance/statistics',
    TEAM: '/attendance/team',
    EXPORT: '/attendance/export'
  },

  // Leave endpoints
  LEAVE: {
    BASE: '/leave',
    APPLY: '/leave/apply',
    BY_ID: (id) => `/leave/${id}`,
    APPROVE: (id) => `/leave/${id}/approve`,
    REJECT: (id) => `/leave/${id}/reject`,
    CANCEL: (id) => `/leave/${id}/cancel`,
    BALANCE: '/leave/balance',
    TYPES: '/leave/types',
    HISTORY: '/leave/history',
    PENDING: '/leave/pending'
  },

  // Payroll endpoints
  PAYROLL: {
    BASE: '/payroll',
    BY_ID: (id) => `/payroll/${id}`,
    BY_EMPLOYEE: (employeeId) => `/payroll/employee/${employeeId}`,
    GENERATE: '/payroll/generate',
    PROCESS: '/payroll/process',
    PAYSLIP: (id) => `/payroll/${id}/payslip`,
    EXPORT: '/payroll/export'
  },

  // Performance endpoints
  PERFORMANCE: {
    BASE: '/performance',
    REVIEWS: '/performance/reviews',
    BY_ID: (id) => `/performance/reviews/${id}`,
    CREATE_REVIEW: '/performance/reviews',
    UPDATE_REVIEW: (id) => `/performance/reviews/${id}`,
    GOALS: '/performance/goals',
    CREATE_GOAL: '/performance/goals',
    UPDATE_GOAL: (id) => `/performance/goals/${id}`,
    FEEDBACK: '/performance/feedback',
    ANALYTICS: '/performance/analytics',
    EMPLOYEE_PERFORMANCE: (employeeId) => `/performance/employee/${employeeId}`
  },

  // AI Features endpoints
  AI: {
    CHATBOT: '/ai/chatbot/query',
    ATTRITION: '/ai/attrition/predict',
    ANOMALY: '/ai/anomaly/detect',
    SMART_REPORTS: '/ai/reports/generate',
    RESUME_PARSER: '/ai/resume/parse',
    FEEDBACK: '/ai/feedback/generate'
  },

  // Reports endpoints
  REPORTS: {
    BASE: '/reports',
    GENERATE: '/reports/generate',
    CUSTOM: '/reports/custom',
    TEMPLATES: '/reports/templates',
    EXPORT: '/reports/export',
    SCHEDULE: '/reports/schedule',
    HISTORY: '/reports/history'
  }
};

export default API_ENDPOINTS;
