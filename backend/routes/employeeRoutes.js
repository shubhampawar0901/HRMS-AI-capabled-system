const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const EmployeeController = require('../controllers/EmployeeController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { body, param, query } = require('express-validator');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// ==========================================
// EMPLOYEE ROUTES
// ==========================================

// Get all employees
router.get('/',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('departmentId').optional().isInt().withMessage('Department ID must be valid'),
    query('status').optional().isIn(['active', 'inactive', 'terminated']).withMessage('Invalid status'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be 1-100 characters')
  ],
  validateRequest,
  EmployeeController.getAllEmployees
);

// Get employee by ID
router.get('/:id',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    param('id').isInt().withMessage('Employee ID must be a valid integer')
  ],
  validateRequest,
  EmployeeController.getEmployeeById
);

// Create new employee
router.post('/',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    body('firstName').notEmpty().isLength({ min: 1, max: 50 }).withMessage('First name is required (1-50 characters)'),
    body('lastName').notEmpty().isLength({ min: 1, max: 50 }).withMessage('Last name is required (1-50 characters)'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('departmentId').isInt().withMessage('Valid department ID is required'),
    body('position').notEmpty().isLength({ min: 1, max: 100 }).withMessage('Position is required (1-100 characters)'),
    body('hireDate').isISO8601().withMessage('Valid hire date is required'),
    body('basicSalary').optional().isFloat({ min: 0 }).withMessage('Basic salary must be positive'),
    body('managerId').optional().isInt().withMessage('Manager ID must be valid'),
    body('emergencyContact').optional().isLength({ max: 100 }).withMessage('Emergency contact max 100 characters'),
    body('emergencyPhone').optional().isMobilePhone().withMessage('Valid emergency phone required')
  ],
  validateRequest,
  EmployeeController.createEmployee
);

// Update employee
router.put('/:id',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    param('id').isInt().withMessage('Employee ID must be valid'),
    body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('departmentId').optional().isInt().withMessage('Valid department ID required'),
    body('position').optional().isLength({ min: 1, max: 100 }).withMessage('Position must be 1-100 characters'),
    body('basicSalary').optional().isFloat({ min: 0 }).withMessage('Basic salary must be positive'),
    body('status').optional().isIn(['active', 'inactive', 'terminated']).withMessage('Invalid status'),
    body('managerId').optional().isInt().withMessage('Manager ID must be valid')
  ],
  validateRequest,
  EmployeeController.updateEmployee
);

// Delete employee
router.delete('/:id',
  authenticateToken,
  authorize('admin'),
  [
    param('id').isInt().withMessage('Employee ID must be valid')
  ],
  validateRequest,
  EmployeeController.deleteEmployee
);

// ==========================================
// EMPLOYEE PROFILE ROUTES
// ==========================================

// Get current user's employee profile
router.get('/profile/me',
  authenticateToken,
  EmployeeController.getEmployeeProfile
);

// Update current user's employee profile
router.put('/profile/me',
  authenticateToken,
  [
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('address').optional().isLength({ max: 500 }).withMessage('Address max 500 characters'),
    body('emergencyContact').optional().isLength({ max: 100 }).withMessage('Emergency contact max 100 characters'),
    body('emergencyPhone').optional().isMobilePhone().withMessage('Valid emergency phone required')
  ],
  validateRequest,
  EmployeeController.updateEmployeeProfile
);

// ==========================================
// DEPARTMENT ROUTES
// ==========================================

// Get all departments
router.get('/departments/all',
  authenticateToken,
  [
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be 1-100 characters')
  ],
  validateRequest,
  EmployeeController.getAllDepartments
);

// Get department by ID
router.get('/departments/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('Department ID must be valid')
  ],
  validateRequest,
  EmployeeController.getDepartmentById
);

// Create new department
router.post('/departments',
  authenticateToken,
  authorize('admin'),
  [
    body('name').notEmpty().isLength({ min: 1, max: 100 }).withMessage('Department name is required (1-100 characters)'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 characters'),
    body('managerId').optional().isInt().withMessage('Manager ID must be valid')
  ],
  validateRequest,
  EmployeeController.createDepartment
);

// Update department
router.put('/departments/:id',
  authenticateToken,
  authorize('admin'),
  [
    param('id').isInt().withMessage('Department ID must be valid'),
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Department name must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 characters'),
    body('managerId').optional().isInt().withMessage('Manager ID must be valid')
  ],
  validateRequest,
  EmployeeController.updateDepartment
);

// Delete department
router.delete('/departments/:id',
  authenticateToken,
  authorize('admin'),
  [
    param('id').isInt().withMessage('Department ID must be valid')
  ],
  validateRequest,
  EmployeeController.deleteDepartment
);

// ==========================================
// DOCUMENT ROUTES
// ==========================================

// Upload employee document
router.post('/:id/documents',
  authenticateToken,
  authorize('admin', 'manager'),
  upload.single('document'),
  [
    param('id').isInt().withMessage('Employee ID must be valid'),
    body('documentType').isIn(['resume', 'id_proof', 'address_proof', 'education', 'experience', 'other']).withMessage('Invalid document type')
  ],
  validateRequest,
  EmployeeController.uploadEmployeeDocument
);

// Get employee documents
router.get('/:id/documents',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    param('id').isInt().withMessage('Employee ID must be valid'),
    query('documentType').optional().isIn(['resume', 'id_proof', 'address_proof', 'education', 'experience', 'other']).withMessage('Invalid document type')
  ],
  validateRequest,
  EmployeeController.getEmployeeDocuments
);

// ==========================================
// STATISTICS ROUTES
// ==========================================

// Get employee statistics
router.get('/stats/employees',
  authenticateToken,
  authorize('admin', 'manager'),
  EmployeeController.getEmployeeStats
);

// Get department statistics
router.get('/stats/departments',
  authenticateToken,
  authorize('admin', 'manager'),
  EmployeeController.getDepartmentStats
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    service: 'employee-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
