const SecureChatbotService = require('../chatbot/SecureChatbotService');
const { ChatbotConversation, ChatbotAuditLog } = require('../models');
const { sendSuccess, sendError } = require('../../../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

class ChatbotController {
  static async handleQuery(req, res, next) {
    try {
      const { message, sessionId } = req.body;
      const userContext = {
        userId: req.user.id,
        role: req.user.role,
        employeeId: req.user.employeeId
      };

      // Validate input
      if (!message || message.trim().length === 0) {
        return errorResponse(res, 'Message is required', 400);
      }

      // Generate session ID if not provided
      const currentSessionId = sessionId || uuidv4();

      // Initialize chatbot service
      const chatbotService = new SecureChatbotService();
      
      // Process query with security
      const response = await chatbotService.processQuery(message, userContext);
      
      // Save conversation to database
      await ChatbotConversation.create({
        userId: userContext.userId,
        sessionId: currentSessionId,
        userMessage: message,
        botResponse: response.message,
        intent: response.intent,
        confidenceScore: response.confidence || 0.95,
        responseTimeMs: response.responseTime
      });

      // Log conversation for audit
      await ChatbotAuditLog.create({
        userId: userContext.userId,
        userRole: userContext.role,
        action: 'chatbot_query',
        query: this.sanitizeForLogging(message),
        response: this.sanitizeForLogging(response.message),
        intent: response.intent,
        accessAttempts: JSON.stringify([]),
        securityViolations: JSON.stringify(response.type === 'access_denied' ? [response.message] : []),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      });

      // Return response with session ID
      return successResponse(res, {
        ...response,
        sessionId: currentSessionId
      }, 'Query processed successfully');

    } catch (error) {
      console.error('Chatbot query error:', error);
      next(error);
    }
  }

  static async getChatHistory(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;

      if (!sessionId) {
        return errorResponse(res, 'Session ID is required', 400);
      }

      const history = await ChatbotConversation.findAll({
        where: { userId, sessionId },
        order: [['createdAt', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: ['id', 'userMessage', 'botResponse', 'intent', 'createdAt']
      });

      return successResponse(res, {
        conversations: history,
        sessionId,
        total: history.length
      }, 'Chat history retrieved successfully');

    } catch (error) {
      console.error('Get chat history error:', error);
      next(error);
    }
  }

  static async getActiveSessions(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      // Get recent unique sessions
      const sessions = await ChatbotConversation.findAll({
        where: { userId },
        attributes: ['sessionId', 'createdAt'],
        group: ['sessionId'],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      return successResponse(res, {
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          lastActivity: session.createdAt
        }))
      }, 'Active sessions retrieved successfully');

    } catch (error) {
      console.error('Get active sessions error:', error);
      next(error);
    }
  }

  static async deleteSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      if (!sessionId) {
        return errorResponse(res, 'Session ID is required', 400);
      }

      // Delete all conversations in the session
      const deletedCount = await ChatbotConversation.destroy({
        where: { userId, sessionId }
      });

      if (deletedCount === 0) {
        return errorResponse(res, 'Session not found', 404);
      }

      // Log the deletion for audit
      await ChatbotAuditLog.create({
        userId,
        userRole: req.user.role,
        action: 'session_deleted',
        query: `Session ${sessionId} deleted`,
        response: `${deletedCount} conversations deleted`,
        intent: 'session_management',
        accessAttempts: JSON.stringify([]),
        securityViolations: JSON.stringify([]),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      });

      return successResponse(res, {
        deletedCount,
        sessionId
      }, 'Session deleted successfully');

    } catch (error) {
      console.error('Delete session error:', error);
      next(error);
    }
  }

  static async getQuerySuggestions(req, res, next) {
    try {
      const userRole = req.user.role;
      
      const suggestions = this.getRoleSuggestions(userRole);
      
      return successResponse(res, {
        suggestions,
        role: userRole
      }, 'Query suggestions retrieved successfully');

    } catch (error) {
      console.error('Get suggestions error:', error);
      next(error);
    }
  }

  static getRoleSuggestions(userRole) {
    const suggestions = {
      admin: [
        "Show me employees with high attrition risk",
        "What's the company-wide attendance rate this month?",
        "Generate a payroll summary for all departments",
        "Who has pending performance reviews?",
        "Show me leave balance reports for all employees",
        "What are the current HR policy violations?",
        "Generate employee onboarding checklist",
        "Show department-wise performance metrics"
      ],
      manager: [
        "Show my team's attendance for this week",
        "Who in my team has pending leave requests?",
        "What's my team's average performance rating?",
        "Show upcoming performance review deadlines for my team",
        "What are the leave policies for my department?",
        "How do I approve a leave request?",
        "Show my team's goal completion status",
        "What training is required for my team members?"
      ],
      employee: [
        "What's my current leave balance?",
        "How do I apply for annual leave?",
        "When is my next performance review?",
        "What are my current goals and their status?",
        "Show me my attendance summary",
        "What's the company policy on remote work?",
        "How do I update my personal information?",
        "What benefits am I eligible for?"
      ]
    };

    return suggestions[userRole] || suggestions.employee;
  }

  static async getChatbotStats(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      // Only admins can see system-wide stats
      if (userRole !== 'admin') {
        return errorResponse(res, 'Access denied', 403);
      }

      const stats = await this.calculateChatbotStats();
      
      return successResponse(res, stats, 'Chatbot statistics retrieved successfully');

    } catch (error) {
      console.error('Get chatbot stats error:', error);
      next(error);
    }
  }

  static async calculateChatbotStats() {
    const totalConversations = await ChatbotConversation.count();
    const totalUsers = await ChatbotConversation.count({
      distinct: true,
      col: 'userId'
    });
    
    const avgResponseTime = await ChatbotConversation.findOne({
      attributes: [
        [ChatbotConversation.sequelize.fn('AVG', ChatbotConversation.sequelize.col('responseTimeMs')), 'avgResponseTime']
      ]
    });

    const topIntents = await ChatbotConversation.findAll({
      attributes: [
        'intent',
        [ChatbotConversation.sequelize.fn('COUNT', ChatbotConversation.sequelize.col('intent')), 'count']
      ],
      group: ['intent'],
      order: [[ChatbotConversation.sequelize.fn('COUNT', ChatbotConversation.sequelize.col('intent')), 'DESC']],
      limit: 10
    });

    return {
      totalConversations,
      totalUsers,
      avgResponseTime: Math.round(avgResponseTime?.dataValues?.avgResponseTime || 0),
      topIntents: topIntents.map(item => ({
        intent: item.intent,
        count: parseInt(item.dataValues.count)
      }))
    };
  }

  static sanitizeForLogging(text) {
    if (!text) return '';
    
    // Remove any potential sensitive data from logs
    return text
      .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_NUMBER]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\$[\d,]+/g, '[AMOUNT]')
      .replace(/password\s*[:=]\s*\S+/gi, 'password: [REDACTED]')
      .replace(/token\s*[:=]\s*\S+/gi, 'token: [REDACTED]');
  }
}

module.exports = ChatbotController;
