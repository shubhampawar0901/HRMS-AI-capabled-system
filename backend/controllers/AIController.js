const {
  AIAttritionPrediction,
  AISmartFeedback,
  AIAttendanceAnomaly,
  AIChatbotInteraction,
  AIResumeParser,
  AISmartReport,
  AIPolicyDocument,
  Employee,
  User,
  Attendance,
  LeaveApplication,
  PerformanceReview
} = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const AIService = require('../services/AIService');
const DocumentProcessingService = require('../services/DocumentProcessingService');

class AIController {
  constructor() {
    this.aiService = new AIService();
    this.documentService = new DocumentProcessingService();
  }

  // Get singleton instance
  static getAIService() {
    if (!this.aiServiceInstance) {
      this.aiServiceInstance = new AIService();
    }
    return this.aiServiceInstance;
  }
  // ==========================================
  // RESUME PARSER ENDPOINTS
  // ==========================================
  
  static async parseResume(req, res) {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      const aiService = AIController.getAIService();

      // Store original file info before processing (since file gets deleted during processing)
      const originalFileName = req.file.originalname;
      const originalFilePath = req.file.path;

      const result = await aiService.parseResume(req.file);

      // Save to database
      const parserRecord = await AIResumeParser.create({
        employeeId: req.body.employeeId || null,
        fileName: originalFileName,
        filePath: originalFilePath, // Store original path for reference
        parsedData: result.parsedData,
        extractedText: result.extractedText,
        confidence: result.confidence,
        processingTime: result.processingTime,
        status: 'processed',
        errorMessage: null  // Explicitly set to null instead of undefined
      });

      return sendCreated(res, {
        id: parserRecord.id,
        parsedData: result.parsedData,
        confidence: result.confidence
      }, 'Resume parsed successfully');
    } catch (error) {
      console.error('Resume parsing error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async getResumeParseHistory(req, res) {
    try {
      const { employeeId } = req.params;
      const history = await AIResumeParser.findByEmployee(employeeId);
      return sendSuccess(res, history, 'Resume parse history retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // ATTRITION PREDICTION ENDPOINTS
  // ==========================================
  
  static async getAttritionPredictions(req, res) {
    try {
      const { riskThreshold = 0.7 } = req.query;
      const predictions = await AIAttritionPrediction.getHighRiskEmployees(riskThreshold);
      return sendSuccess(res, predictions, 'Attrition predictions retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async generateAttritionPrediction(req, res) {
    try {
      const { employeeId } = req.body;
      
      // Get employee data for prediction
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      // Generate prediction using AI service
      const aiService = AIController.getAIService();
      const prediction = await aiService.predictAttrition(employeeId);
      
      // Save prediction
      const predictionRecord = await AIAttritionPrediction.create({
        employeeId,
        riskScore: prediction.riskScore,
        riskLevel: prediction.riskLevel,
        factors: prediction.factors,
        recommendations: prediction.recommendations,
        predictionDate: new Date(),
        modelVersion: '1.0'
      });

      return sendCreated(res, predictionRecord, 'Attrition prediction generated');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // SMART FEEDBACK ENDPOINTS
  // ==========================================
  
  static async generateSmartFeedback(req, res) {
    try {
      const { employeeId, feedbackType, performanceData } = req.body;
      const userId = req.user.id;

      // Generate feedback using AI service
      const aiService = AIController.getAIService();
      const feedback = await aiService.generateSmartFeedback({
        employeeId,
        feedbackType,
        performanceData
      });

      // Save feedback
      const feedbackRecord = await AISmartFeedback.create({
        employeeId,
        feedbackType,
        generatedFeedback: feedback.feedback,
        performanceData,
        suggestions: feedback.suggestions,
        confidence: feedback.confidence,
        generatedBy: userId
      });

      return sendCreated(res, feedbackRecord, 'Smart feedback generated');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getFeedbackHistory(req, res) {
    try {
      const { employeeId } = req.params;
      const { feedbackType, limit = 10 } = req.query;
      
      const feedback = await AISmartFeedback.findByEmployee(employeeId, {
        feedbackType,
        limit: parseInt(limit)
      });

      return sendSuccess(res, feedback, 'Feedback history retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // ANOMALY DETECTION ENDPOINTS
  // ==========================================
  
  static async getAttendanceAnomalies(req, res) {
    try {
      const { status = 'active' } = req.query;
      const anomalies = await AIAttendanceAnomaly.getActiveAnomalies();
      return sendSuccess(res, anomalies, 'Attendance anomalies retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getAttendanceAnomalyStats(req, res) {
    try {
      const { period = 'month', employeeId } = req.query;
      const { role } = req.user;

      console.log(`📊 Getting anomaly stats for ${role} user, employeeId: ${employeeId}, period: ${period}`);

      // For admin users, get system-wide statistics
      // For managers, get their team statistics (if implemented)
      // employeeId parameter is optional for filtering

      // Get actual statistics from database
      const AIAttendanceAnomaly = require('../models/AIAttendanceAnomaly');

      // Calculate date range based on period
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default: // month
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get anomaly counts (mock data for now - replace with actual queries)
      const stats = {
        totalActive: 0,
        newThisWeek: 0,
        resolvedThisMonth: 0,
        highPriority: 0,
        trends: {
          weeklyChange: 0,
          monthlyChange: 0,
          severityDistribution: {
            high: 0,
            medium: 0,
            low: 0
          }
        },
        period: period,
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }
      };

      console.log(`✅ Anomaly stats calculated for period: ${period}`);

      return sendSuccess(res, stats, 'Attendance anomaly statistics retrieved');
    } catch (error) {
      console.error('Get anomaly stats error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async detectAnomalies(req, res) {
    try {
      const { employeeId, dateRange } = req.body;
      
      // Run anomaly detection
      const aiService = AIController.getAIService();
      const anomalies = await aiService.detectAttendanceAnomalies(employeeId, dateRange);
      
      // Save detected anomalies
      const savedAnomalies = [];
      for (const anomaly of anomalies) {
        const record = await AIAttendanceAnomaly.create({
          employeeId: anomaly.employeeId,
          anomalyType: anomaly.type,
          detectedDate: anomaly.date,
          anomalyData: anomaly.data,
          severity: anomaly.severity,
          description: anomaly.description,
          recommendations: anomaly.recommendations,
          status: 'active'
        });
        savedAnomalies.push(record);
      }

      return sendCreated(res, savedAnomalies, 'Anomalies detected and saved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // CHATBOT ENDPOINTS
  // ==========================================
  
  static async processChatbotQuery(req, res) {
    try {
      const { message, sessionId } = req.body;
      const userContext = {
        userId: req.user.id,
        role: req.user.role,
        employeeId: req.user.employeeId
      };

      if (!message || message.trim().length === 0) {
        return sendError(res, 'Message is required', 400);
      }

      // Process query with AI service
      const aiService = AIController.getAIService();
      const response = await aiService.processChatbotQuery(message, userContext);
      
      // Save conversation
      await AIChatbotInteraction.create({
        userId: userContext.userId,
        sessionId: sessionId || require('uuid').v4(),
        userQuery: message,
        botResponse: response.message,
        intent: response.intent,
        confidence: response.confidence,
        responseTime: response.responseTime
      });

      return sendSuccess(res, response, 'Query processed successfully');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getChatHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { limit = 50 } = req.query;

      const history = await AIChatbotInteraction.findBySession(sessionId);
      
      // Filter by user for security
      const userHistory = history.filter(chat => chat.userId === userId);

      return sendSuccess(res, userHistory.slice(0, limit), 'Chat history retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // SMART REPORTS ENDPOINTS
  // ==========================================
  
  static async generateSmartReport(req, res) {
    try {
      const { role, userId, employeeId } = req.user;
      const { reportType, targetId, dateRange, reportName } = req.body;

      // Check permissions
      if (role !== 'admin' && role !== 'manager') {
        return sendError(res, 'Access denied. Only admin and manager roles can generate smart reports.', 403);
      }

      // For team reports, ensure targetId is the manager's employee ID
      if (reportType === 'team') {
        if (role === 'manager' && targetId !== employeeId) {
          return sendError(res, 'Managers can only generate reports for their own team.', 403);
        }
      }

      // For employee reports, check if manager can access this employee
      if (reportType === 'employee' && role === 'manager') {
        const employee = await Employee.findById(targetId);
        if (!employee) {
          return sendError(res, 'Employee not found.', 404);
        }
        if (employee.managerId !== employeeId) {
          return sendError(res, 'Managers can only generate reports for their team members.', 403);
        }
      }

      // Generate report using AI service
      const aiService = AIController.getAIService();
      const reportData = await aiService.generateSmartReport(reportType, {
        targetId,
        dateRange,
        reportName,
        userId
      });

      // Save report to database
      const savedReport = await AISmartReport.create({
        reportType,
        targetId,
        reportName: reportData.reportName,
        aiSummary: reportData.aiSummary,
        insights: reportData.insights,
        recommendations: reportData.recommendations,
        dataSnapshot: reportData.dataSnapshot,
        generatedBy: userId,
        status: 'completed'
      });

      return sendCreated(res, savedReport, 'Smart report generated successfully');
    } catch (error) {
      console.error('Generate smart report error:', error);
      return sendError(res, 'Failed to generate smart report', 500);
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================
  
  static async getAIFeatureStatus(req, res) {
    try {
      const status = {
        resumeParser: { enabled: true, version: '1.0' },
        attritionPredictor: { enabled: true, version: '1.0' },
        smartFeedback: { enabled: true, version: '1.0' },
        anomalyDetection: { enabled: true, version: '1.0' },
        chatbot: { enabled: true, version: '2.0', features: ['RAG', 'Policy Search', 'Employee Data'] },
        smartReports: { enabled: true, version: '1.0' },
        ragKnowledgeBase: { enabled: true, version: '1.0' }
      };

      return sendSuccess(res, status, 'AI feature status retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // DOCUMENT MANAGEMENT ENDPOINTS (RAG)
  // ==========================================

  static async uploadPolicyDocument(req, res) {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      const { documentType, description, accessLevel, departmentSpecific, tags } = req.body;

      // Validate file
      const documentService = new DocumentProcessingService();
      documentService.validateFile(req.file);

      // Process document
      const result = await documentService.processDocument(
        req.file,
        {
          documentType: documentType || 'other',
          description,
          accessLevel: accessLevel || 'employee',
          departmentSpecific: departmentSpecific ? parseInt(departmentSpecific) : null,
          tags: tags ? JSON.parse(tags) : []
        },
        req.user.id
      );

      return sendCreated(res, result, 'Policy document uploaded and processed successfully');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getPolicyDocuments(req, res) {
    try {
      const { documentType, processingStatus, limit } = req.query;

      const documents = await AIPolicyDocument.findAll({
        documentType,
        processingStatus,
        limit: limit ? parseInt(limit) : undefined
      });

      return sendSuccess(res, documents, 'Policy documents retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getPolicyDocument(req, res) {
    try {
      const { id } = req.params;
      const document = await AIPolicyDocument.findById(id);

      if (!document) {
        return sendError(res, 'Document not found', 404);
      }

      return sendSuccess(res, document, 'Policy document retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async deletePolicyDocument(req, res) {
    try {
      const { id } = req.params;
      const documentService = new DocumentProcessingService();

      await documentService.deleteDocument(id);
      return sendSuccess(res, null, 'Policy document deleted successfully');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async reprocessPolicyDocument(req, res) {
    try {
      const { id } = req.params;
      const documentService = new DocumentProcessingService();

      const result = await documentService.reprocessDocument(id);
      return sendSuccess(res, result, 'Policy document reprocessed successfully');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async getKnowledgeBaseStats(req, res) {
    try {
      const documentService = new DocumentProcessingService();
      const processingStats = await documentService.getProcessingStats();

      // Get RAG service stats
      const aiService = AIController.getAIService();
      const ragStats = await aiService.ragService.getIndexStats();

      const stats = {
        documents: processingStats,
        vectorDatabase: ragStats,
        lastUpdated: new Date().toISOString()
      };

      return sendSuccess(res, stats, 'Knowledge base statistics retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }

  static async searchKnowledgeBase(req, res) {
    try {
      const { query, documentType, topK = 5 } = req.query;

      if (!query) {
        return sendError(res, 'Search query is required', 400);
      }

      const aiService = AIController.getAIService();
      let searchResults;

      if (documentType) {
        searchResults = await aiService.ragService.searchByDocumentType(
          query,
          documentType,
          { topK: parseInt(topK) }
        );
      } else {
        searchResults = await aiService.ragService.searchWithAccessControl(
          query,
          req.user.role,
          { topK: parseInt(topK) }
        );
      }

      return sendSuccess(res, searchResults, 'Knowledge base search completed');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }
}

module.exports = AIController;
