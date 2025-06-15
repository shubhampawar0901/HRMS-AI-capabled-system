const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const AIController = require('../controllers/AIController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { body, param, query } = require('express-validator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.RESUME_PARSER_MAX_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// ==========================================
// RESUME PARSER ROUTES
// ==========================================

router.post('/parse-resume',
  authenticateToken,
  authorize('admin', 'manager'),
  upload.single('resume'),
  [
    body('employeeId').optional().isInt().withMessage('Employee ID must be a valid integer')
  ],
  validateRequest,
  AIController.parseResume
);

router.get('/resume-history/:employeeId',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    param('employeeId').isInt().withMessage('Employee ID must be a valid integer')
  ],
  validateRequest,
  AIController.getResumeParseHistory
);

// ==========================================
// ATTRITION PREDICTION ROUTES
// ==========================================

router.get('/attrition-predictions',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    query('riskThreshold').optional().isFloat({ min: 0, max: 1 }).withMessage('Risk threshold must be between 0 and 1')
  ],
  validateRequest,
  AIController.getAttritionPredictions
);

router.post('/attrition-predictions',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    body('employeeId').isInt().withMessage('Employee ID is required and must be valid')
  ],
  validateRequest,
  AIController.generateAttritionPrediction
);

// ==========================================
// SMART FEEDBACK ROUTES
// ==========================================

router.post('/smart-feedback',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    body('employeeId').isInt().withMessage('Employee ID is required'),
    body('feedbackType').isIn(['performance', 'development', 'career', 'general']).withMessage('Invalid feedback type'),
    body('performanceData').isObject().withMessage('Performance data must be an object')
  ],
  validateRequest,
  AIController.generateSmartFeedback
);

router.get('/smart-feedback/:employeeId',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    param('employeeId').isInt().withMessage('Employee ID must be valid'),
    query('feedbackType').optional().isIn(['performance', 'development', 'career', 'general']),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  validateRequest,
  AIController.getFeedbackHistory
);

// ==========================================
// ANOMALY DETECTION ROUTES
// ==========================================

router.get('/attendance-anomalies',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    query('status').optional().isIn(['active', 'resolved', 'ignored']).withMessage('Invalid status')
  ],
  validateRequest,
  AIController.getAttendanceAnomalies
);

router.post('/detect-anomalies',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    body('employeeId').optional().isInt().withMessage('Employee ID must be valid'),
    body('dateRange').isObject().withMessage('Date range is required'),
    body('dateRange.startDate').isISO8601().withMessage('Start date must be valid'),
    body('dateRange.endDate').isISO8601().withMessage('End date must be valid')
  ],
  validateRequest,
  AIController.detectAnomalies
);

// ==========================================
// CHATBOT ROUTES
// ==========================================

router.post('/chatbot/query',
  authenticateToken,
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('sessionId').optional().isUUID().withMessage('Session ID must be valid UUID')
  ],
  validateRequest,
  AIController.processChatbotQuery
);

router.get('/chatbot/history/:sessionId',
  authenticateToken,
  [
    param('sessionId').isUUID().withMessage('Session ID must be valid UUID'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validateRequest,
  AIController.getChatHistory
);

// ==========================================
// SMART REPORTS ROUTES
// ==========================================

router.post('/smart-reports',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    body('reportType').isIn(['employee', 'team']).withMessage('Report type must be "employee" or "team"'),
    body('targetId').isInt({ min: 1 }).withMessage('Target ID must be a positive integer'),
    body('reportName').optional().isLength({ min: 3, max: 200 }).withMessage('Report name must be between 3 and 200 characters'),
    body('dateRange.startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    body('dateRange.endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date')
  ],
  validateRequest,
  AIController.generateSmartReport
);

// ==========================================
// UTILITY ROUTES
// ==========================================

router.get('/feature-status',
  authenticateToken,
  AIController.getAIFeatureStatus
);

// ==========================================
// RAG KNOWLEDGE BASE ROUTES
// ==========================================

// Upload policy document
router.post('/knowledge-base/upload',
  authenticateToken,
  authorize('admin', 'manager'),
  upload.single('document'),
  [
    body('documentType').isIn(['leave_policy', 'attendance_policy', 'benefits_policy', 'employee_handbook', 'code_of_conduct', 'hr_procedures', 'company_policies', 'other']).withMessage('Invalid document type'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
    body('accessLevel').optional().isIn(['public', 'employee', 'manager', 'admin']).withMessage('Invalid access level'),
    body('departmentSpecific').optional().isInt().withMessage('Department ID must be valid integer'),
    body('tags').optional().isJSON().withMessage('Tags must be valid JSON array')
  ],
  validateRequest,
  AIController.uploadPolicyDocument
);

// Get all policy documents
router.get('/knowledge-base/documents',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    query('documentType').optional().isIn(['leave_policy', 'attendance_policy', 'benefits_policy', 'employee_handbook', 'code_of_conduct', 'hr_procedures', 'company_policies', 'other']).withMessage('Invalid document type'),
    query('processingStatus').optional().isIn(['pending', 'processing', 'completed', 'failed']).withMessage('Invalid processing status'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validateRequest,
  AIController.getPolicyDocuments
);

// Get specific policy document
router.get('/knowledge-base/documents/:id',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    param('id').isInt().withMessage('Document ID must be valid integer')
  ],
  validateRequest,
  AIController.getPolicyDocument
);

// Delete policy document
router.delete('/knowledge-base/documents/:id',
  authenticateToken,
  authorize('admin'),
  [
    param('id').isInt().withMessage('Document ID must be valid integer')
  ],
  validateRequest,
  AIController.deletePolicyDocument
);

// Reprocess policy document
router.post('/knowledge-base/documents/:id/reprocess',
  authenticateToken,
  authorize('admin', 'manager'),
  [
    param('id').isInt().withMessage('Document ID must be valid integer')
  ],
  validateRequest,
  AIController.reprocessPolicyDocument
);

// Get knowledge base statistics
router.get('/knowledge-base/stats',
  authenticateToken,
  authorize('admin', 'manager'),
  AIController.getKnowledgeBaseStats
);

// Search knowledge base
router.get('/knowledge-base/search',
  authenticateToken,
  [
    query('query').notEmpty().withMessage('Search query is required'),
    query('documentType').optional().isIn(['leave_policy', 'attendance_policy', 'benefits_policy', 'employee_handbook', 'code_of_conduct', 'hr_procedures', 'company_policies', 'other']).withMessage('Invalid document type'),
    query('topK').optional().isInt({ min: 1, max: 20 }).withMessage('topK must be between 1 and 20')
  ],
  validateRequest,
  AIController.searchKnowledgeBase
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    service: 'ai-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      resumeParser: 'active',
      attritionPredictor: 'active',
      smartFeedback: 'active',
      anomalyDetection: 'active',
      chatbot: 'active',
      smartReports: 'active',
      ragKnowledgeBase: 'active'
    }
  });
});

module.exports = router;
