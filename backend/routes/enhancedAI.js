// Enhanced AI Routes - Complete System with Gemini 2.5 Flash
const express = require('express');
const router = express.Router();
const enhancedAIController = require('../controllers/enhancedAIController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ==========================================
// ENHANCED CHATBOT ROUTES
// ==========================================

/**
 * @route POST /api/enhanced-ai/chatbot
 * @desc Process chatbot query with enhanced AI (Gemini 1.5 Flash)
 * @access Private (All authenticated users)
 * @body {string} message - User's query message
 * @returns {object} AI response with intent classification and formatted answer
 */
router.post('/chatbot', enhancedAIController.chatbot.bind(enhancedAIController));

// ==========================================
// SYSTEM MONITORING ROUTES
// ==========================================

/**
 * @route GET /api/enhanced-ai/health
 * @desc Get system health and performance metrics
 * @access Private (All authenticated users)
 * @returns {object} System health status and metrics
 */
router.get('/health', enhancedAIController.getSystemHealth.bind(enhancedAIController));

/**
 * @route POST /api/enhanced-ai/cache/clear
 * @desc Clear all AI service caches
 * @access Private (Admin/HR only)
 * @returns {object} Cache clear confirmation
 */
router.post('/cache/clear', 
  (req, res, next) => {
    // Additional authorization check for cache management
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions. Only admin and HR users can clear cache.'
      });
    }
    next();
  },
  enhancedAIController.clearCache.bind(enhancedAIController)
);

// ==========================================
// CONVERSATION MANAGEMENT ROUTES
// ==========================================

/**
 * @route GET /api/enhanced-ai/conversations
 * @desc Get user's conversation history with the chatbot
 * @access Private (Own data only)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20, max: 100)
 * @returns {object} Paginated conversation history
 */
router.get('/conversations',
  (req, res, next) => {
    // Validate pagination parameters
    const { page = 1, limit = 20 } = req.query;
    
    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        error: 'Page must be a positive number'
      });
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }
    
    next();
  },
  enhancedAIController.getConversationHistory.bind(enhancedAIController)
);

/**
 * @route DELETE /api/enhanced-ai/conversations
 * @desc Clear user's conversation history
 * @access Private (Own data only)
 * @returns {object} Deletion confirmation with count
 */
router.delete('/conversations', enhancedAIController.clearConversationHistory.bind(enhancedAIController));

// ==========================================
// FEEDBACK ROUTES
// ==========================================

/**
 * @route POST /api/enhanced-ai/feedback
 * @desc Submit feedback for a chatbot response
 * @access Private (Own interactions only)
 * @body {string} interactionId - ID of the interaction to rate
 * @body {number} rating - Rating from 1-5
 * @body {string} feedback - Optional feedback comment
 * @returns {object} Feedback submission confirmation
 */
router.post('/feedback',
  (req, res, next) => {
    // Validate feedback input
    const { interactionId, rating, feedback } = req.body;
    
    if (!interactionId) {
      return res.status(400).json({
        success: false,
        error: 'Interaction ID is required'
      });
    }
    
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be a number between 1 and 5'
      });
    }
    
    if (feedback && typeof feedback !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Feedback must be a string'
      });
    }
    
    if (feedback && feedback.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Feedback must be less than 500 characters'
      });
    }
    
    next();
  },
  enhancedAIController.submitFeedback.bind(enhancedAIController)
);

// ==========================================
// ANALYTICS ROUTES (Admin/HR Only)
// ==========================================

/**
 * @route GET /api/enhanced-ai/analytics/usage
 * @desc Get chatbot usage analytics
 * @access Private (Admin/HR only)
 * @query {string} startDate - Start date for analytics (YYYY-MM-DD)
 * @query {string} endDate - End date for analytics (YYYY-MM-DD)
 * @returns {object} Usage analytics and metrics
 */
router.get('/analytics/usage',
  (req, res, next) => {
    // Check admin/HR permissions
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions. Analytics access requires admin or HR role.'
      });
    }
    next();
  },
  async (req, res) => {
    try {
      // This would be implemented with actual analytics logic
      res.json({
        success: true,
        data: {
          message: 'Analytics endpoint - to be implemented',
          note: 'This endpoint will provide detailed usage analytics for admin/HR users'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Analytics retrieval failed'
      });
    }
  }
);

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

// Global error handler for this router
router.use((error, req, res, next) => {
  console.error('Enhanced AI Route Error:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large'
    });
  }
  
  // Generic error response
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.',
    requestId: `error_${Date.now()}`
  });
});

// ==========================================
// ROUTE DOCUMENTATION
// ==========================================

/**
 * @route GET /api/enhanced-ai/docs
 * @desc Get API documentation for enhanced AI endpoints
 * @access Private (All authenticated users)
 * @returns {object} API documentation
 */
router.get('/docs', (req, res) => {
  const documentation = {
    title: 'Enhanced AI API Documentation',
    version: '1.0.0',
    description: 'Complete HRMS AI system powered by Gemini 1.5 Flash',
    baseUrl: '/api/enhanced-ai',
    endpoints: {
      chatbot: {
        method: 'POST',
        path: '/chatbot',
        description: 'Process natural language queries with AI',
        rateLimit: '30 requests per minute',
        body: {
          message: 'string (required, max 1000 chars)'
        },
        response: {
          success: 'boolean',
          data: {
            message: 'string - AI response',
            intent: 'string - Classified intent',
            confidence: 'number - Classification confidence',
            type: 'string - Response type',
            responseTime: 'number - Processing time in ms',
            cached: 'boolean - Whether response was cached'
          }
        }
      },
      health: {
        method: 'GET',
        path: '/health',
        description: 'Get system health and performance metrics',
        response: {
          status: 'string - System status',
          metrics: 'object - Performance metrics',
          services: 'object - Service status'
        }
      },
      conversations: {
        method: 'GET',
        path: '/conversations',
        description: 'Get conversation history',
        query: {
          page: 'number - Page number (default: 1)',
          limit: 'number - Items per page (default: 20, max: 100)'
        }
      },
      feedback: {
        method: 'POST',
        path: '/feedback',
        description: 'Submit feedback for chatbot responses',
        body: {
          interactionId: 'string (required)',
          rating: 'number (required, 1-5)',
          feedback: 'string (optional, max 500 chars)'
        }
      }
    },
    features: [
      'Intent classification with Gemini 1.5 Flash',
      'Natural language understanding',
      'Database-aware query generation',
      'Policy document retrieval',
      'Multi-layer security',
      'Response caching for performance',
      'Comprehensive error handling',
      'Usage analytics and monitoring'
    ],
    security: {
      authentication: 'JWT token required',
      authorization: 'Role-based access control',
      rateLimit: 'Per-endpoint rate limiting',
      dataAccess: 'Employee can only access own data'
    }
  };
  
  res.json({
    success: true,
    data: documentation
  });
});

module.exports = router;
