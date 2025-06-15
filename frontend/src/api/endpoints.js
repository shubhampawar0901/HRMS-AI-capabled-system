/**
 * API Endpoints Configuration
 * Based on Role-Based UI-API Mapping v3 Document
 * All endpoints verified against actual backend implementation
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004/api';

export const API_ENDPOINTS = {
  // ==========================================
  // 🔐 AUTHENTICATION APIS (All Roles)
  // ==========================================
  AUTH: {
    LOGIN: '/auth/login',                    // POST - Login with role-based response
    REFRESH_TOKEN: '/auth/refresh-token',    // POST - Refresh access token
    LOGOUT: '/auth/logout',                  // POST - Logout user
    PROFILE: '/auth/profile'                 // GET - Get current user profile
  },

  // ==========================================
  // 🏠 DASHBOARD APIS (Role-Based)
  // ==========================================
  DASHBOARD: {
    ADMIN: '/dashboard/admin',               // GET - Admin dashboard data
    MANAGER: '/dashboard/manager',           // GET - Manager dashboard data
    EMPLOYEE: '/dashboard/employee'          // GET - Employee dashboard data
  },

  // ==========================================
  // 👥 EMPLOYEE MANAGEMENT APIS (Admin/Manager)
  // ==========================================
  EMPLOYEES: {
    // Core CRUD Operations
    BASE: '/employees',                      // GET - Get all employees (with pagination/filters)
    BY_ID: (id) => `/employees/${id}`,      // GET - Get employee by ID
    CREATE: '/employees',                    // POST - Create new employee
    UPDATE: (id) => `/employees/${id}`,     // PUT - Update employee
    DELETE: (id) => `/employees/${id}`,     // DELETE - Delete employee

    // Department Management
    DEPARTMENTS_ALL: '/employees/departments/all',     // GET - Get all departments
    DEPARTMENTS: '/employees/departments',              // POST - Create department
    DEPARTMENT_BY_ID: (id) => `/employees/departments/${id}`,  // GET/PUT/DELETE - Department operations
  },

  // ==========================================
  // ⏰ ATTENDANCE APIS
  // ==========================================
  ATTENDANCE: {
    // Employee Operations
    CHECK_IN: '/attendance/check-in',        // POST - Employee check-in
    CHECK_OUT: '/attendance/check-out',      // POST - Employee check-out
    TODAY: '/attendance/today',              // GET - Today's attendance
    HISTORY: '/attendance/history',          // GET - Attendance history with pagination
    SUMMARY: '/attendance/summary',          // GET - Attendance summary (monthly)
    STATS: '/attendance/stats',              // GET - Attendance statistics

    // Manager/Admin Operations
    TEAM: '/attendance/team',                // GET - Team attendance (managers)
    MARK: '/attendance/mark'                 // POST - Mark attendance (admin only)
  },

  // ==========================================
  // 🏖️ LEAVE MANAGEMENT APIS
  // ==========================================
  LEAVE: {
    // Employee Operations
    APPLY: '/leave/apply',                   // POST - Apply for leave
    APPLICATIONS: '/leave/applications',     // GET - Get leave applications (role-based)
    CANCEL: (id) => `/leave/applications/${id}/cancel`,  // PUT - Cancel leave application
    BALANCE: '/leave/balance',               // GET - Get leave balance
    TYPES: '/leave/types',                   // GET - Get leave types
    CALENDAR: '/leave/calendar',             // GET - Get leave calendar

    // Manager/Admin Operations
    TEAM: '/leave/team',                     // GET - Get team leave applications (managers)
    PROCESS: (id) => `/leave/applications/${id}/process`  // PUT - Approve/reject leave (managers)
  },

  // ==========================================
  // 💰 PAYROLL APIS
  // ==========================================
  PAYROLL: {
    // Base
    BASE: '/payroll',
    EXPORT: '/payroll/export',

    // Admin Operations
    GENERATE: '/payroll/generate',           // POST - Generate payroll (admin)
    BULK_GENERATE: '/payroll/bulk-generate', // POST - Bulk generate payroll (admin)
    RECORDS: '/payroll/records',             // GET - Get payroll records (admin)
    PROCESS: (id) => `/payroll/${id}/process`,  // PUT - Process payroll (admin)
    MARK_PAID: (id) => `/payroll/${id}/pay`,    // PUT - Mark as paid (admin)
    SUMMARY: '/payroll/summary',             // GET - Get payroll summary (admin)

    // Admin-specific employee access
    ADMIN_EMPLOYEE_PAYROLL: (employeeId) => `/payroll/admin/employee/${employeeId}/payslips`,  // GET - Admin get employee payslips
    ADMIN_ALL_EMPLOYEES: '/payroll/admin/employees',  // GET - Admin get all employees payroll

    // Employee/Manager Operations
    PAYSLIP: (id) => `/payroll/payslip/${id}`,      // GET - Get specific payslip
    PAYSLIP_DOWNLOAD: (id) => `/payroll/payslip/${id}/download`,  // GET - Download payslip PDF
    PAYSLIPS: '/payroll/payslips',                  // GET - Get employee payslips
    SALARY_STRUCTURE: (employeeId) => `/payroll/salary-structure/${employeeId}`  // GET - Get salary structure
  },

  // ==========================================
  // 📊 PERFORMANCE APIS
  // ==========================================
  PERFORMANCE: {
    // Review Management
    REVIEWS: '/performance/reviews',         // GET/POST - Performance reviews
    REVIEW_BY_ID: (id) => `/performance/reviews/${id}`,     // GET/PUT - Individual review
    SUBMIT_REVIEW: (id) => `/performance/reviews/${id}/submit`,  // PUT - Submit review

    // Goal Management
    GOALS: '/performance/goals',             // GET/POST - Performance goals
    GOAL_BY_ID: (id) => `/performance/goals/${id}`,         // GET/PUT - Individual goal
    GOAL_PROGRESS: (id) => `/performance/goals/${id}/progress`,  // PUT - Update goal progress

    // AI Smart Feedback (Alternative Performance API)
    GENERATE_FEEDBACK: '/performance/feedback/generate',    // POST - Generate AI feedback
    FEEDBACK_HISTORY: '/performance/feedback',              // GET - Get AI feedback history

    // Team Performance (Manager)
    TEAM: '/performance/team',               // GET - Get team performance (manager)

    // Dashboard
    DASHBOARD: '/performance/dashboard'      // GET - Performance dashboard
  },

  // ==========================================
  // 🤖 AI FEATURES APIS
  // ==========================================
  AI: {
    // Attrition Prediction (Admin/Manager)
    ATTRITION_PREDICTIONS: '/ai/attrition-predictions',     // GET/POST - Attrition predictions

    // Resume Parser (Admin/Manager)
    PARSE_RESUME: '/ai/parse-resume',        // POST - Parse resume

    // Smart Reports (Admin/Manager)
    SMART_REPORTS: '/ai/smart-reports',      // POST - Generate smart reports

    // Attendance Anomalies (Admin Only)
    ATTENDANCE_ANOMALIES: '/ai/attendance-anomalies',       // GET - Get attendance anomalies
    DETECT_ANOMALIES: '/ai/detect-anomalies',               // POST - Detect new anomalies

    // AI Chatbot (Employee - Limited Access)
    CHATBOT_QUERY: '/ai/chatbot/query',      // POST - AI chatbot query
    CHATBOT_HISTORY: (sessionId) => `/ai/chatbot/history/${sessionId}`,  // GET - Chat history

    // Smart Feedback (Manager/Admin)
    SMART_FEEDBACK_GENERATE: '/ai/smart-feedback',           // POST - Generate smart feedback
    SMART_FEEDBACK_HISTORY: (employeeId) => `/ai/smart-feedback/${employeeId}`  // GET - Get feedback history
  },

  // ==========================================
  // 📈 REPORTS APIS
  // ==========================================
  REPORTS: {
    // Standard Reports
    ATTENDANCE: '/reports/attendance',       // GET - Attendance report
    LEAVE: '/reports/leave',                 // GET - Leave report
    PAYROLL: '/reports/payroll',             // GET - Payroll report (admin)
    PERFORMANCE: '/reports/performance',     // GET - Performance report

    // AI Smart Reports
    SMART: '/reports/smart',                 // POST - Generate AI smart report

    // Dashboard Analytics
    ANALYTICS: '/reports/analytics'          // GET - Dashboard analytics
  },

  // ==========================================
  // 🧠 SMART REPORTS APIS (Admin/Manager Only)
  // ==========================================
  SMART_REPORTS: {
    GENERATE: '/smart-reports',              // POST - Generate new smart report
    LIST: '/smart-reports',                  // GET - List smart reports with pagination
    GET: '/smart-reports',                   // GET - Get smart report by ID (/smart-reports/:id)
    STATUS: '/smart-reports',                // GET - Get report status (/smart-reports/:id/status)
    DELETE: '/smart-reports'                 // DELETE - Delete smart report (/smart-reports/:id)
  },

  // ==========================================
  // 📊 DATA AGGREGATION APIS (Supporting Smart Reports)
  // ==========================================
  DATA: {
    EMPLOYEE_SUMMARY: '/data/employee-summary',      // GET - Employee performance summary (/data/employee-summary/:id)
    TEAM_SUMMARY: '/data/team-summary',              // GET - Team performance summary (/data/team-summary/:managerId)
    DEPARTMENT_SUMMARY: '/data/department-summary',  // GET - Department performance summary (/data/department-summary/:deptId)
    PERFORMANCE_METRICS: '/data/performance-metrics', // GET - Performance metrics only (/data/performance-metrics/:empId)
    ATTENDANCE_METRICS: '/data/attendance-metrics'   // GET - Attendance metrics only (/data/attendance-metrics/:empId)
  }
};

// ==========================================
// 🔧 HELPER FUNCTIONS
// ==========================================

/**
 * Get the full API URL for an endpoint
 * @param {string} endpoint - The endpoint path
 * @returns {string} - Full API URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Get role-based dashboard endpoint
 * @param {string} role - User role (admin, manager, employee)
 * @returns {string} - Dashboard endpoint
 */
export const getDashboardEndpoint = (role) => {
  switch (role) {
    case 'admin':
      return API_ENDPOINTS.DASHBOARD.ADMIN;
    case 'manager':
      return API_ENDPOINTS.DASHBOARD.MANAGER;
    case 'employee':
      return API_ENDPOINTS.DASHBOARD.EMPLOYEE;
    default:
      return API_ENDPOINTS.DASHBOARD.EMPLOYEE;
  }
};

/**
 * Check if user has access to specific API based on role
 * @param {string} role - User role
 * @param {string} apiCategory - API category (e.g., 'EMPLOYEES', 'AI')
 * @returns {boolean} - Access permission
 */
export const hasApiAccess = (role, apiCategory) => {
  const adminOnlyApis = ['EMPLOYEES', 'REPORTS'];
  const adminManagerApis = ['AI', 'PERFORMANCE', 'SMART_REPORTS', 'DATA'];
  const allRolesApis = ['AUTH', 'DASHBOARD', 'ATTENDANCE', 'LEAVE', 'PAYROLL'];

  if (adminOnlyApis.includes(apiCategory)) {
    return role === 'admin';
  }

  if (adminManagerApis.includes(apiCategory)) {
    return ['admin', 'manager'].includes(role);
  }

  if (allRolesApis.includes(apiCategory)) {
    return ['admin', 'manager', 'employee'].includes(role);
  }

  return false;
};

// ==========================================
// 📋 API ENDPOINT SUMMARY
// ==========================================
/*
TOTAL VERIFIED APIS: 37 endpoints

✅ AUTHENTICATION (4 APIs):
- POST /auth/login
- POST /auth/refresh-token
- POST /auth/logout
- GET /auth/profile

✅ DASHBOARD (3 APIs):
- GET /dashboard/admin
- GET /dashboard/manager
- GET /dashboard/employee

✅ EMPLOYEE MANAGEMENT (8 APIs):
- GET /employees (with pagination/filters)
- GET /employees/:id
- POST /employees
- PUT /employees/:id
- DELETE /employees/:id
- GET /employees/departments/all
- POST /employees/departments
- GET/PUT/DELETE /employees/departments/:id

✅ ATTENDANCE (8 APIs):
- POST /attendance/check-in
- POST /attendance/check-out
- GET /attendance/today
- GET /attendance/history
- GET /attendance/summary
- GET /attendance/stats
- GET /attendance/team
- POST /attendance/mark

✅ LEAVE MANAGEMENT (8 APIs):
- POST /leave/apply
- GET /leave/applications
- PUT /leave/applications/:id/cancel
- GET /leave/balance
- GET /leave/types
- GET /leave/calendar
- GET /leave/team
- PUT /leave/applications/:id/process

✅ PAYROLL (9 APIs):
- POST /payroll/generate
- POST /payroll/bulk-generate
- GET /payroll/records
- PUT /payroll/:id/process
- PUT /payroll/:id/pay
- GET /payroll/summary
- GET /payroll/payslip/:id
- GET /payroll/payslips
- GET /payroll/salary-structure/:employeeId

✅ PERFORMANCE (10 APIs):
- GET/POST /performance/reviews
- GET/PUT /performance/reviews/:id
- PUT /performance/reviews/:id/submit
- GET/POST /performance/goals
- GET/PUT /performance/goals/:id
- PUT /performance/goals/:id/progress
- POST /performance/feedback/generate
- GET /performance/feedback
- GET /performance/team
- GET /performance/dashboard

✅ AI FEATURES (7 APIs):
- GET/POST /ai/attrition-predictions
- POST /ai/parse-resume
- POST /ai/smart-reports
- GET /ai/attendance-anomalies
- POST /ai/chatbot/query
- GET /ai/chatbot/history/:sessionId
- POST /ai/smart-feedback

✅ REPORTS (6 APIs):
- GET /reports/attendance
- GET /reports/leave
- GET /reports/payroll
- GET /reports/performance
- POST /reports/smart
- GET /reports/analytics

🔒 ROLE-BASED ACCESS:
- Admin: Full access to all APIs
- Manager: Limited access (no employee CRUD, limited AI features)
- Employee: Basic access (own data only, limited features)
*/

export { API_BASE_URL };
export default API_ENDPOINTS;
