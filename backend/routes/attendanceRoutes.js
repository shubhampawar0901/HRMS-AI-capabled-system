const express = require('express');
const { body, query } = require('express-validator');
const AttendanceController = require('../controllers/AttendanceController');
const { validateRequest } = require('../middleware/validationMiddleware');

const router = express.Router();

// ==========================================
// VALIDATION RULES
// ==========================================
const checkInValidation = [
  body('location').optional().isString().withMessage('Location must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const checkOutValidation = [
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const markAttendanceValidation = [
  body('employeeId').isInt().withMessage('Employee ID is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('checkInTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Invalid check-in time format'),
  body('checkOutTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Invalid check-out time format'),
  body('status').isIn(['present', 'absent', 'late', 'half_day']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const historyValidation = [
  query('startDate').optional().isDate().withMessage('Invalid start date'),
  query('endDate').optional().isDate().withMessage('Invalid end date'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// ==========================================
// EMPLOYEE ROUTES
// ==========================================

// POST /api/attendance/check-in
router.post('/check-in',
  checkInValidation,
  validateRequest,
  AttendanceController.checkIn
);

// POST /api/attendance/check-out
router.post('/check-out',
  checkOutValidation,
  validateRequest,
  AttendanceController.checkOut
);

// GET /api/attendance/today
router.get('/today',
  AttendanceController.getTodayAttendance
);

// GET /api/attendance/history
router.get('/history',
  historyValidation,
  validateRequest,
  AttendanceController.getAttendanceHistory
);

// GET /api/attendance/summary
router.get('/summary',
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').optional().isInt({ min: 2020 }).withMessage('Year must be valid'),
  validateRequest,
  AttendanceController.getAttendanceSummary
);

// ==========================================
// MANAGER/ADMIN ROUTES
// ==========================================

// GET /api/attendance/team
router.get('/team',
  query('date').optional().isDate().withMessage('Invalid date'),
  validateRequest,
  AttendanceController.getTeamAttendance
);

// POST /api/attendance/mark (Admin only)
router.post('/mark',
  markAttendanceValidation,
  validateRequest,
  AttendanceController.markAttendance
);

// ==========================================
// HEALTH CHECK
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    service: 'attendance-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /check-in': 'Employee check-in',
      'POST /check-out': 'Employee check-out',
      'GET /today': 'Today\'s attendance',
      'GET /history': 'Attendance history',
      'GET /summary': 'Attendance summary',
      'GET /team': 'Team attendance (managers)',
      'POST /mark': 'Mark attendance (admin)'
    }
  });
});

module.exports = router;
