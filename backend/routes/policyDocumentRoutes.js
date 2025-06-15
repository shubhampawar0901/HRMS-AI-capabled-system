const express = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middleware/authMiddleware');
const PolicyDocumentController = require('../controllers/PolicyDocumentController');

const router = express.Router();

// ==========================================
// MULTER CONFIGURATION FOR FILE UPLOADS
// ==========================================
const storage = multer.memoryStorage(); // Store files in memory for processing

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// ==========================================
// POLICY DOCUMENT ROUTES (Admin Only)
// ==========================================

/**
 * @route   POST /api/ai/policy-documents/upload
 * @desc    Upload a new policy document
 * @access  Admin only
 * @body    {file, documentType, description, accessLevel, departmentSpecific, tags}
 */
router.post('/upload', 
  authMiddleware, 
  upload.single('file'), 
  PolicyDocumentController.uploadDocument
);

/**
 * @route   GET /api/ai/policy-documents
 * @desc    Get all policy documents with filtering and pagination
 * @access  Admin only
 * @query   {documentType?, status?, page?, limit?}
 */
router.get('/', 
  authMiddleware, 
  PolicyDocumentController.getAllDocuments
);

/**
 * @route   GET /api/ai/policy-documents/stats
 * @desc    Get processing and storage statistics
 * @access  Admin only
 */
router.get('/stats', 
  authMiddleware, 
  PolicyDocumentController.getProcessingStats
);

/**
 * @route   GET /api/ai/policy-documents/:id
 * @desc    Get a specific policy document by ID
 * @access  Admin only
 * @params  {id} - Document ID
 */
router.get('/:id', 
  authMiddleware, 
  PolicyDocumentController.getDocumentById
);

/**
 * @route   PUT /api/ai/policy-documents/:id
 * @desc    Update policy document metadata
 * @access  Admin only
 * @params  {id} - Document ID
 * @body    {description?, accessLevel?, departmentSpecific?, tags?}
 */
router.put('/:id', 
  authMiddleware, 
  PolicyDocumentController.updateDocument
);

/**
 * @route   DELETE /api/ai/policy-documents/:id
 * @desc    Delete a policy document
 * @access  Admin only
 * @params  {id} - Document ID
 */
router.delete('/:id', 
  authMiddleware, 
  PolicyDocumentController.deleteDocument
);

/**
 * @route   POST /api/ai/policy-documents/:id/reprocess
 * @desc    Reprocess a policy document (re-extract text and update vectors)
 * @access  Admin only
 * @params  {id} - Document ID
 */
router.post('/:id/reprocess', 
  authMiddleware, 
  PolicyDocumentController.reprocessDocument
);

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit',
        error: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        error: 'INVALID_FILE_FIELD'
      });
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed',
      error: 'INVALID_FILE_TYPE'
    });
  }

  // Pass other errors to the global error handler
  next(error);
});

module.exports = router;
