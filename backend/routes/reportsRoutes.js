const express = require('express');
const { query, body } = require('express-validator');
const ReportsController = require('../controllers/ReportsController');
const { validateRequest } = require('../middleware/validationMiddleware');

const router = express.Router();

// ==========================================
// VALIDATION RULES
// ==========================================
const dateRangeValidation = [
  query('startDate').optional().isDate().withMessage('Start date must be valid'),
  query('endDate').optional().isDate().withMessage('End date must be valid'),
  query('departmentId').optional().isInt().withMessage('Department ID must be valid'),
  query('employeeId').optional().isInt().withMessage('Employee ID must be valid')
];

const yearValidation = [
  query('year').optional().isInt({ min: 2020 }).withMessage('Year must be valid'),
  query('departmentId').optional().isInt().withMessage('Department ID must be valid'),
  query('employeeId').optional().isInt().withMessage('Employee ID must be valid')
];

const monthYearValidation = [
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').optional().isInt({ min: 2020 }).withMessage('Year must be valid'),
  query('departmentId').optional().isInt().withMessage('Department ID must be valid')
];

const smartReportValidation = [
  body('reportType').isIn(['attendance', 'leave', 'performance', 'payroll', 'employee']).withMessage('Invalid report type'),
  body('parameters').isObject().withMessage('Parameters must be an object')
];

// ==========================================
// REPORT ROUTES
// ==========================================

// GET /api/reports/attendance
router.get('/attendance',
  dateRangeValidation,
  validateRequest,
  ReportsController.getAttendanceReport
);

// GET /api/reports/leave
router.get('/leave',
  yearValidation,
  validateRequest,
  ReportsController.getLeaveReport
);

// GET /api/reports/payroll
router.get('/payroll',
  monthYearValidation,
  validateRequest,
  ReportsController.getPayrollReport
);

// GET /api/reports/performance
router.get('/performance',
  yearValidation,
  validateRequest,
  ReportsController.getPerformanceReport
);

// POST /api/reports/smart
router.post('/smart',
  smartReportValidation,
  validateRequest,
  ReportsController.generateSmartReport
);

// GET /api/reports/analytics
router.get('/analytics',
  ReportsController.getDashboardAnalytics
);

// ==========================================
// HEALTH CHECK
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    service: 'reports-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /attendance': 'Generate attendance report',
      'GET /leave': 'Generate leave report',
      'GET /payroll': 'Generate payroll report (admin)',
      'GET /performance': 'Generate performance report',
      'POST /smart': 'Generate AI smart report',
      'GET /analytics': 'Get dashboard analytics'
    }
  });
});

module.exports = router;
