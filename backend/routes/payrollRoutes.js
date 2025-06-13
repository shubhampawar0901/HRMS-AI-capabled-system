const express = require('express');
const { body, query, param } = require('express-validator');
const PayrollController = require('../controllers/PayrollController');
const { validateRequest } = require('../middleware/validationMiddleware');

const router = express.Router();

// ==========================================
// VALIDATION RULES
// ==========================================
const generatePayrollValidation = [
  body('employeeId').isInt().withMessage('Employee ID is required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Year must be valid')
];

const bulkGenerateValidation = [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Year must be valid'),
  body('departmentId').optional().isInt().withMessage('Department ID must be valid')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// ==========================================
// ADMIN ROUTES
// ==========================================

// POST /api/payroll/generate
router.post('/generate',
  generatePayrollValidation,
  validateRequest,
  PayrollController.generatePayroll
);

// POST /api/payroll/bulk-generate
router.post('/bulk-generate',
  bulkGenerateValidation,
  validateRequest,
  PayrollController.bulkGeneratePayroll
);

// PUT /api/payroll/:id/process
router.put('/:id/process',
  param('id').isInt().withMessage('Valid payroll ID is required'),
  validateRequest,
  PayrollController.processPayroll
);

// PUT /api/payroll/:id/pay
router.put('/:id/pay',
  param('id').isInt().withMessage('Valid payroll ID is required'),
  validateRequest,
  PayrollController.markAsPaid
);

// GET /api/payroll/summary
router.get('/summary',
  query('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').isInt({ min: 2020 }).withMessage('Year must be valid'),
  validateRequest,
  PayrollController.getPayrollSummary
);

// ==========================================
// EMPLOYEE/ADMIN ROUTES
// ==========================================

// GET /api/payroll/records
router.get('/records',
  paginationValidation,
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').optional().isInt({ min: 2020 }).withMessage('Year must be valid'),
  validateRequest,
  PayrollController.getPayrollRecords
);

// GET /api/payroll/payslip/:id
router.get('/payslip/:id',
  param('id').isInt().withMessage('Valid payroll ID is required'),
  validateRequest,
  PayrollController.getPayslip
);

// ==========================================
// HEALTH CHECK
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    service: 'payroll-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /generate': 'Generate payroll (admin)',
      'POST /bulk-generate': 'Bulk generate payroll (admin)',
      'GET /records': 'Get payroll records',
      'GET /payslip/:id': 'Get payslip',
      'PUT /:id/process': 'Process payroll (admin)',
      'PUT /:id/pay': 'Mark as paid (admin)',
      'GET /summary': 'Get payroll summary (admin)'
    }
  });
});

module.exports = router;
