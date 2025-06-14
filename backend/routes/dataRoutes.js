const express = require('express');
const { param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const DataController = require('../controllers/DataController');

const router = express.Router();

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

const employeeIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Employee ID must be a positive integer')
];

const managerIdValidation = [
  param('managerId').isInt({ min: 1 }).withMessage('Manager ID must be a positive integer')
];

const departmentIdValidation = [
  param('departmentId').isInt({ min: 1 }).withMessage('Department ID must be a positive integer')
];

const dateRangeValidation = [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date')
];

// ==========================================
// DATA AGGREGATION ROUTES
// ==========================================

// GET /api/data/employee-summary/:id - Get comprehensive employee performance data
router.get('/employee-summary/:id',
  authenticateToken,
  employeeIdValidation,
  dateRangeValidation,
  validateRequest,
  DataController.getEmployeeSummary
);

// GET /api/data/team-summary/:managerId - Get comprehensive team performance data
router.get('/team-summary/:managerId',
  authenticateToken,
  managerIdValidation,
  dateRangeValidation,
  validateRequest,
  DataController.getTeamSummary
);

// GET /api/data/department-summary/:departmentId - Get department-wide performance data (Admin only)
router.get('/department-summary/:departmentId',
  authenticateToken,
  departmentIdValidation,
  dateRangeValidation,
  validateRequest,
  DataController.getDepartmentSummary
);

// GET /api/data/performance-metrics/:employeeId - Get only performance metrics
router.get('/performance-metrics/:employeeId',
  authenticateToken,
  param('employeeId').isInt({ min: 1 }).withMessage('Employee ID must be a positive integer'),
  dateRangeValidation,
  validateRequest,
  DataController.getPerformanceMetrics
);

// GET /api/data/attendance-metrics/:employeeId - Get only attendance metrics
router.get('/attendance-metrics/:employeeId',
  authenticateToken,
  param('employeeId').isInt({ min: 1 }).withMessage('Employee ID must be a positive integer'),
  dateRangeValidation,
  validateRequest,
  DataController.getAttendanceMetrics
);

// ==========================================
// HEALTH CHECK
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    service: 'data-aggregation-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /employee-summary/:id': 'Get employee performance summary',
      'GET /team-summary/:managerId': 'Get team performance summary',
      'GET /department-summary/:departmentId': 'Get department performance summary',
      'GET /performance-metrics/:employeeId': 'Get performance metrics only',
      'GET /attendance-metrics/:employeeId': 'Get attendance metrics only'
    }
  });
});

module.exports = router;
