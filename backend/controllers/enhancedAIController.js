// Enhanced AI Controller - Using Gemini 1.5 Flash for Complete System
const EnhancedAIService = require('../services/EnhancedAIService');
const { AIChatbotInteraction } = require('../models');

class EnhancedAIController {
  constructor() {
    try {
      console.log('Initializing EnhancedAIController...');
      this.aiService = new EnhancedAIService();
      console.log('✅ EnhancedAIService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize EnhancedAIService:', error);
      console.error('Error details:', error.stack);
      this.aiService = null;
    }
  }

  // ==========================================
  // ENHANCED CHATBOT ENDPOINT
  // ==========================================

  async chatbot(req, res) {
    const startTime = Date.now();
    let interactionId = null;

    try {
      const { message } = req.body;
      const userContext = {
        userId: req.user.id,
        employeeId: req.user.employeeId,
        employeeName: `${req.user.firstName} ${req.user.lastName}`,
        role: req.user.role || 'employee',
        departmentId: req.user.departmentId
      };

      // Validate input
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Message is required and must be a non-empty string',
          responseTime: Date.now() - startTime
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Message too long. Please keep it under 1000 characters.',
          responseTime: Date.now() - startTime
        });
      }

      console.log(`[CHATBOT] Processing query from user ${userContext.employeeId}: "${message}"`);

      // Check if AI service is available
      if (!this.aiService) {
        throw new Error('AI service is not available. Please check server configuration.');
      }

      // Process the query with enhanced AI service
      const response = await this.aiService.processChatbotQuery(message, userContext);

      // Log the interaction to database
      try {
        const interaction = await AIChatbotInteraction.create({
          userId: userContext.userId,
          employeeId: userContext.employeeId,
          sessionId: req.sessionID || `session_${Date.now()}`,
          userQuery: message,
          botResponse: response.message,
          intent: response.intent,
          confidence: response.confidence,
          responseTime: response.responseTime,
          cached: response.cached || false,
          requestId: response.requestId,
          metadata: JSON.stringify({
            type: response.type,
            dataType: response.dataType,
            sources: response.sources,
            securityLevel: response.securityLevel,
            fallback: response.fallback
          })
        });
        interactionId = interaction.id;
      } catch (dbError) {
        console.error('Failed to log chatbot interaction:', dbError);
        // Continue processing even if logging fails
      }

      // Prepare response
      const responseData = {
        success: true,
        data: {
          message: response.message,
          intent: response.intent,
          confidence: response.confidence,
          type: response.type,
          responseTime: response.responseTime,
          cached: response.cached,
          requestId: response.requestId,
          interactionId: interactionId
        }
      };

      // Add additional metadata for specific response types
      if (response.sources) {
        responseData.data.sources = response.sources;
      }
      
      if (response.dataType) {
        responseData.data.dataType = response.dataType;
      }

      if (response.securityLevel) {
        responseData.data.securityLevel = response.securityLevel;
      }

      console.log(`[CHATBOT] Query processed successfully in ${response.responseTime}ms for user ${userContext.employeeId}`);

      res.json(responseData);

    } catch (error) {
      console.error('[CHATBOT] Error processing query:', error);

      // Log error interaction if possible
      if (req.user && req.body.message) {
        try {
          await AIChatbotInteraction.create({
            userId: req.user.id,
            employeeId: req.user.employeeId,
            sessionId: req.sessionID || `session_${Date.now()}`,
            userQuery: req.body.message,
            botResponse: 'System error occurred',
            intent: 'error',
            confidence: 0.0,
            responseTime: Date.now() - startTime,
            cached: false,
            metadata: JSON.stringify({
              error: error.message,
              type: 'system_error'
            })
          });
        } catch (dbError) {
          console.error('Failed to log error interaction:', dbError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'I apologize, but I\'m experiencing technical difficulties. Please try again later or contact HR directly for assistance.',
        responseTime: Date.now() - startTime,
        requestId: `error_${Date.now()}`
      });
    }
  }

  // ==========================================
  // SYSTEM HEALTH AND METRICS
  // ==========================================

  async getSystemHealth(req, res) {
    try {
      if (!this.aiService) {
        return res.status(503).json({
          success: false,
          error: 'AI service is not available',
          status: 'unhealthy'
        });
      }

      const metrics = this.aiService.performanceMetrics;
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: {
          totalQueries: metrics.totalQueries,
          successRate: metrics.totalQueries > 0 ? 
            ((metrics.successfulQueries / metrics.totalQueries) * 100).toFixed(2) + '%' : '0%',
          averageResponseTime: Math.round(metrics.averageResponseTime) + 'ms',
          cacheHitRate: metrics.totalQueries > 0 ? 
            ((metrics.cacheHitRate / metrics.totalQueries) * 100).toFixed(2) + '%' : '0%',
          errorBreakdown: metrics.errorsByType
        },
        services: {
          gemini: 'operational',
          database: 'operational',
          vectorDatabase: 'operational',
          cache: 'operational'
        }
      };

      // Check if error rate is too high
      const errorRate = metrics.totalQueries > 0 ? 
        (Object.values(metrics.errorsByType).reduce((a, b) => a + b, 0) / metrics.totalQueries) : 0;
      
      if (errorRate > 0.1) { // More than 10% error rate
        health.status = 'degraded';
        health.warnings = ['High error rate detected'];
      }

      res.json({
        success: true,
        data: health
      });

    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        status: 'unhealthy'
      });
    }
  }

  // ==========================================
  // CONVERSATION HISTORY
  // ==========================================

  async getConversationHistory(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userContext = {
        userId: req.user.id,
        employeeId: req.user.employeeId
      };

      const offset = (page - 1) * limit;

      const interactions = await AIChatbotInteraction.findAll({
        where: {
          employeeId: userContext.employeeId
        },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
        attributes: [
          'id', 'userQuery', 'botResponse', 'intent', 'confidence', 
          'responseTime', 'cached', 'createdAt', 'metadata'
        ]
      });

      const totalCount = await AIChatbotInteraction.count({
        where: {
          employeeId: userContext.employeeId
        }
      });

      const formattedInteractions = interactions.map(interaction => ({
        id: interaction.id,
        userQuery: interaction.userQuery,
        botResponse: interaction.botResponse,
        intent: interaction.intent,
        confidence: interaction.confidence,
        responseTime: interaction.responseTime,
        cached: interaction.cached,
        timestamp: interaction.createdAt,
        metadata: interaction.metadata ? JSON.parse(interaction.metadata) : null
      }));

      res.json({
        success: true,
        data: {
          interactions: formattedInteractions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            totalCount: totalCount,
            hasNext: offset + interactions.length < totalCount,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Conversation history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve conversation history'
      });
    }
  }

  // ==========================================
  // CLEAR CONVERSATION HISTORY
  // ==========================================

  async clearConversationHistory(req, res) {
    try {
      const userContext = {
        employeeId: req.user.employeeId
      };

      const deletedCount = await AIChatbotInteraction.destroy({
        where: {
          employeeId: userContext.employeeId
        }
      });

      res.json({
        success: true,
        data: {
          message: 'Conversation history cleared successfully',
          deletedInteractions: deletedCount
        }
      });

    } catch (error) {
      console.error('Clear conversation history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear conversation history'
      });
    }
  }

  // ==========================================
  // FEEDBACK ON RESPONSES
  // ==========================================

  async submitFeedback(req, res) {
    try {
      const { interactionId, rating, feedback } = req.body;
      const userContext = {
        employeeId: req.user.employeeId
      };

      // Validate input
      if (!interactionId || !rating) {
        return res.status(400).json({
          success: false,
          error: 'Interaction ID and rating are required'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      // Find the interaction
      const interaction = await AIChatbotInteraction.findOne({
        where: {
          id: interactionId,
          employeeId: userContext.employeeId
        }
      });

      if (!interaction) {
        return res.status(404).json({
          success: false,
          error: 'Interaction not found'
        });
      }

      // Update interaction with feedback
      const metadata = interaction.metadata ? JSON.parse(interaction.metadata) : {};
      metadata.feedback = {
        rating: rating,
        comment: feedback || null,
        submittedAt: new Date().toISOString()
      };

      await interaction.update({
        metadata: JSON.stringify(metadata)
      });

      res.json({
        success: true,
        data: {
          message: 'Feedback submitted successfully',
          interactionId: interactionId
        }
      });

    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback'
      });
    }
  }

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  async clearCache(req, res) {
    try {
      // Only allow admin users to clear cache
      if (req.user.role !== 'admin' && req.user.role !== 'hr') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to clear cache'
        });
      }

      // Clear all caches in the AI service
      this.aiService.responseCache.clear();
      this.aiService.intentCache.clear();
      this.aiService.contextCache.clear();

      res.json({
        success: true,
        data: {
          message: 'All caches cleared successfully'
        }
      });

    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache'
      });
    }
  }
}

module.exports = new EnhancedAIController();
