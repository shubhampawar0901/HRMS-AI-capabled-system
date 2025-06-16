const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
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
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled', 'all']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
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

// PUT /api/leave/applications/:id/cancel - VALIDATION REMOVED FOR TESTING
router.put('/applications/:id/cancel',
  LeaveController.cancelLeaveApplication
);

// GET /api/leave/calendar - VALIDATION REMOVED FOR TESTING
router.get('/calendar',
  LeaveController.getLeaveCalendar
);

// ==========================================
// MANAGER/ADMIN ROUTES
// ==========================================

// GET /api/leave/team
router.get('/team',
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled', 'all']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Team validation errors:', errors.array());
      console.log('Team query params:', req.query);
      return res.status(400).json({
        success: false,
        error: {
          message: `Validation failed: ${errors.array().map(e => e.msg).join(', ')}`,
          details: errors.array()
        }
      });
    }
    next();
  },
  LeaveController.getTeamLeaveApplications
);

// PUT /api/leave/applications/:id/process - TEMPORARILY REMOVE VALIDATION FOR DEBUGGING
router.put('/applications/:id/process',
  (req, res, next) => {
    console.log('🔍 DEBUG - Process Leave Request:');
    console.log('Request Path:', req.path);
    console.log('Request Method:', req.method);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Request Params:', JSON.stringify(req.params, null, 2));
    console.log('Content-Type:', req.get('Content-Type'));
    next();
  },
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
