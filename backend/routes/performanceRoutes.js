const express = require('express');
const { body, query, param } = require('express-validator');
const PerformanceController = require('../controllers/PerformanceController');
const { validateRequest } = require('../middleware/validationMiddleware');

const router = express.Router();

// ==========================================
// VALIDATION RULES
// ==========================================
const createReviewValidation = [
  body('employeeId').isInt().withMessage('Employee ID is required'),
  body('reviewPeriod').isString().withMessage('Review period is required'),
  body('overallRating').isFloat({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('comments').isLength({ min: 10 }).withMessage('Comments must be at least 10 characters long')
];

const createGoalValidation = [
  body('title').isLength({ min: 5 }).withMessage('Title must be at least 5 characters long'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('targetDate').isDate().withMessage('Valid target date is required'),
  body('employeeId').optional().isInt().withMessage('Employee ID must be valid')
];

const updateGoalProgressValidation = [
  param('id').isInt().withMessage('Valid goal ID is required'),
  body('achievementPercentage').isFloat({ min: 0, max: 100 }).withMessage('Achievement percentage must be between 0 and 100'),
  body('status').isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status')
];

const generateFeedbackValidation = [
  body('employeeId').isInt().withMessage('Employee ID is required')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// ==========================================
// PERFORMANCE REVIEWS
// ==========================================

// POST /api/performance/reviews
router.post('/reviews',
  createReviewValidation,
  validateRequest,
  PerformanceController.createReview
);

// GET /api/performance/reviews
router.get('/reviews',
  paginationValidation,
  query('status').optional().isIn(['draft', 'submitted', 'completed']).withMessage('Invalid status'),
  validateRequest,
  PerformanceController.getReviews
);

// GET /api/performance/reviews/:id
router.get('/reviews/:id',
  param('id').isInt().withMessage('Valid review ID is required'),
  validateRequest,
  PerformanceController.getReviewById
);

// PUT /api/performance/reviews/:id
router.put('/reviews/:id',
  param('id').isInt().withMessage('Valid review ID is required'),
  body('overallRating').optional().isFloat({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('comments').optional().isLength({ min: 10 }).withMessage('Comments must be at least 10 characters long'),
  validateRequest,
  PerformanceController.updateReview
);

// PUT /api/performance/reviews/:id/submit
router.put('/reviews/:id/submit',
  param('id').isInt().withMessage('Valid review ID is required'),
  validateRequest,
  PerformanceController.submitReview
);

// ==========================================
// PERFORMANCE GOALS
// ==========================================

// POST /api/performance/goals
router.post('/goals',
  createGoalValidation,
  validateRequest,
  PerformanceController.createGoal
);

// GET /api/performance/goals
router.get('/goals',
  paginationValidation,
  query('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
  validateRequest,
  PerformanceController.getGoals
);

// GET /api/performance/goals/:id
router.get('/goals/:id',
  param('id').isInt().withMessage('Valid goal ID is required'),
  validateRequest,
  PerformanceController.getGoalById
);

// PUT /api/performance/goals/:id
router.put('/goals/:id',
  param('id').isInt().withMessage('Valid goal ID is required'),
  body('title').optional().isLength({ min: 5 }).withMessage('Title must be at least 5 characters long'),
  body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('targetDate').optional().isDate().withMessage('Valid target date is required'),
  validateRequest,
  PerformanceController.updateGoal
);

// PUT /api/performance/goals/:id/progress
router.put('/goals/:id/progress',
  updateGoalProgressValidation,
  validateRequest,
  PerformanceController.updateGoalProgress
);

// ==========================================
// AI SMART FEEDBACK
// ==========================================

// POST /api/performance/feedback/generate
router.post('/feedback/generate',
  generateFeedbackValidation,
  validateRequest,
  PerformanceController.generateSmartFeedback
);

// GET /api/performance/feedback
router.get('/feedback',
  paginationValidation,
  validateRequest,
  PerformanceController.getSmartFeedback
);

// ==========================================
// TEAM PERFORMANCE (MANAGER)
// ==========================================

// GET /api/performance/team
router.get('/team',
  PerformanceController.getTeamPerformance
);

// ==========================================
// DASHBOARD
// ==========================================

// GET /api/performance/dashboard
router.get('/dashboard',
  PerformanceController.getPerformanceDashboard
);

// ==========================================
// HEALTH CHECK
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    service: 'performance-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /reviews': 'Create performance review',
      'GET /reviews': 'Get performance reviews',
      'GET /reviews/:id': 'Get review by ID',
      'PUT /reviews/:id': 'Update review',
      'PUT /reviews/:id/submit': 'Submit review',
      'POST /goals': 'Create performance goal',
      'GET /goals': 'Get performance goals',
      'GET /goals/:id': 'Get goal by ID',
      'PUT /goals/:id': 'Update goal',
      'PUT /goals/:id/progress': 'Update goal progress',
      'POST /feedback/generate': 'Generate AI feedback',
      'GET /feedback': 'Get AI feedback',
      'GET /team': 'Get team performance (manager)',
      'GET /dashboard': 'Get performance dashboard'
    }
  });
});

module.exports = router;
