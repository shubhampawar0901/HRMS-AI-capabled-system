const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const SmartReportsController = require('../controllers/SmartReportsController');

const router = express.Router();

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

const generateReportValidation = [
  body('reportType').isIn(['employee', 'team']).withMessage('Report type must be "employee" or "team"'),
  body('targetId').isInt({ min: 1 }).withMessage('Target ID must be a positive integer'),
  body('reportName').optional().isLength({ min: 3, max: 200 }).withMessage('Report name must be between 3 and 200 characters'),
  body('dateRange.startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('dateRange.endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('reportType').optional().isIn(['employee', 'team', 'department']).withMessage('Invalid report type'),
  query('status').optional().isIn(['generating', 'completed', 'failed']).withMessage('Invalid status')
];

// ==========================================
// SMART REPORTS ROUTES
// ==========================================

// POST /api/smart-reports - Generate new smart report
router.post('/',
  authenticateToken,
  authorize('admin', 'manager'),
  generateReportValidation,
  validateRequest,
  SmartReportsController.generateSmartReport
);

// GET /api/smart-reports - List smart reports with pagination
router.get('/',
  authenticateToken,
  paginationValidation,
  validateRequest,
  SmartReportsController.getSmartReports
);

// GET /api/smart-reports/:id - Get specific smart report
router.get('/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }).withMessage('Report ID must be a positive integer'),
  validateRequest,
  SmartReportsController.getSmartReportById
);

// GET /api/smart-reports/:id/status - Get report generation status
router.get('/:id/status',
  authenticateToken,
  param('id').isInt({ min: 1 }).withMessage('Report ID must be a positive integer'),
  validateRequest,
  SmartReportsController.getReportStatus
);

// DELETE /api/smart-reports/:id - Delete smart report
router.delete('/:id',
  authenticateToken,
  authorize('admin', 'manager'),
  param('id').isInt({ min: 1 }).withMessage('Report ID must be a positive integer'),
  validateRequest,
  SmartReportsController.deleteSmartReport
);

// ==========================================
// HEALTH CHECK
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    service: 'smart-reports-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /': 'Generate smart report',
      'GET /': 'List smart reports',
      'GET /:id': 'Get smart report by ID',
      'GET /:id/status': 'Get report status',
      'DELETE /:id': 'Delete smart report'
    }
  });
});

module.exports = router;
