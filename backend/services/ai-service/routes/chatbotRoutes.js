const express = require('express');
const ChatbotController = require('../controllers/ChatbotController');
const { authenticateToken } = require('../../../middleware/authMiddleware');
const { validateChatbotQuery, validateSessionId } = require('../middleware/validation');
// const rateLimit = require('express-rate-limit'); // DISABLED FOR DEVELOPMENT

const router = express.Router();

// Rate limiting for chatbot queries - DISABLED FOR DEVELOPMENT
// const chatbotRateLimit = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 30, // Limit each user to 30 requests per minute
//   message: {
//     success: false,
//     message: 'Too many chatbot requests. Please try again later.',
//     retryAfter: 60
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => req.user?.id || req.ip
// });

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route POST /api/ai/chatbot/query
 * @desc Process a chatbot query with role-based security
 * @access Private (All authenticated users)
 * @body {string} message - The user's query message
 * @body {string} [sessionId] - Optional session ID for conversation continuity
 */
router.post('/query',
  // chatbotRateLimit, // DISABLED FOR DEVELOPMENT
  validateChatbotQuery,
  ChatbotController.handleQuery
);

/**
 * @route GET /api/ai/chatbot/history/:sessionId
 * @desc Get chat history for a specific session
 * @access Private (Own sessions only)
 * @params {string} sessionId - The session ID
 * @query {number} [limit=50] - Number of messages to retrieve
 * @query {number} [offset=0] - Offset for pagination
 */
router.get('/history/:sessionId',
  validateSessionId,
  ChatbotController.getChatHistory
);

/**
 * @route GET /api/ai/chatbot/sessions
 * @desc Get list of active chat sessions for the user
 * @access Private (Own sessions only)
 * @query {number} [limit=10] - Number of sessions to retrieve
 */
router.get('/sessions',
  ChatbotController.getActiveSessions
);

/**
 * @route DELETE /api/ai/chatbot/sessions/:sessionId
 * @desc Delete a chat session and all its conversations
 * @access Private (Own sessions only)
 * @params {string} sessionId - The session ID to delete
 */
router.delete('/sessions/:sessionId',
  validateSessionId,
  ChatbotController.deleteSession
);

/**
 * @route GET /api/ai/chatbot/suggestions
 * @desc Get role-based query suggestions for the user
 * @access Private (All authenticated users)
 */
router.get('/suggestions',
  ChatbotController.getQuerySuggestions
);

/**
 * @route GET /api/ai/chatbot/stats
 * @desc Get chatbot usage statistics (Admin only)
 * @access Private (Admin only)
 */
router.get('/stats',
  ChatbotController.getChatbotStats
);

module.exports = router;
