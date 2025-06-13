const express = require('express');
const { body, query, param } = require('express-validator');
const LeaveController = require('../controllers/LeaveController');
const { validateRequest } = require('../middleware/validationMiddleware');

const router = express.Router();

// ==========================================
// VALIDATION RULES
// ==========================================
const applyLeaveValidation = [
  body('leaveTypeId').isInt().withMessage('Leave type ID is required'),
  body('startDate').isDate().withMessage('Valid start date is required'),
  body('endDate').isDate().withMessage('Valid end date is required'),
  body('reason').isLength({ min: 10 }).withMessage('Reason must be at least 10 characters long')
];

const processLeaveValidation = [
  param('id').isInt().withMessage('Valid leave application ID is required'),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('comments').optional().isString().withMessage('Comments must be a string')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// ==========================================
// EMPLOYEE ROUTES
// ==========================================

// POST /api/leave/apply
router.post('/apply',
  applyLeaveValidation,
  validateRequest,
  LeaveController.applyLeave
);

// GET /api/leave/applications
router.get('/applications',
  paginationValidation,
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']).withMessage('Invalid status'),
  validateRequest,
  LeaveController.getLeaveApplications
);

// GET /api/leave/balance
router.get('/balance',
  query('year').optional().isInt({ min: 2020 }).withMessage('Year must be valid'),
  validateRequest,
  LeaveController.getLeaveBalance
);

// GET /api/leave/types
router.get('/types',
  LeaveController.getLeaveTypes
);

// PUT /api/leave/applications/:id/cancel
router.put('/applications/:id/cancel',
  param('id').isInt().withMessage('Valid leave application ID is required'),
  validateRequest,
  LeaveController.cancelLeaveApplication
);

// GET /api/leave/calendar
router.get('/calendar',
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').optional().isInt({ min: 2020 }).withMessage('Year must be valid'),
  validateRequest,
  LeaveController.getLeaveCalendar
);

// ==========================================
// MANAGER/ADMIN ROUTES
// ==========================================

// GET /api/leave/team
router.get('/team',
  paginationValidation,
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']).withMessage('Invalid status'),
  validateRequest,
  LeaveController.getTeamLeaveApplications
);

// PUT /api/leave/applications/:id/process
router.put('/applications/:id/process',
  processLeaveValidation,
  validateRequest,
  LeaveController.processLeaveApplication
);

// ==========================================
// HEALTH CHECK
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    service: 'leave-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /apply': 'Apply for leave',
      'GET /applications': 'Get leave applications',
      'GET /balance': 'Get leave balance',
      'GET /types': 'Get leave types',
      'PUT /applications/:id/cancel': 'Cancel leave application',
      'GET /calendar': 'Get leave calendar',
      'GET /team': 'Get team leave applications (managers)',
      'PUT /applications/:id/process': 'Approve/reject leave (managers)'
    }
  });
});

module.exports = router;
