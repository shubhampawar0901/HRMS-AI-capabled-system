const { 
  AIAttritionPrediction, 
  AISmartFeedback, 
  AIAttendanceAnomaly, 
  AIChatbotInteraction, 
  AIResumeParser,
  Employee,
  User,
  Attendance,
  LeaveApplication,
  PerformanceReview
} = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const AIService = require('../services/AIService');

class AIController {
  constructor() {
    this.aiService = new AIService();
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
      const result = await aiService.parseResume(req.file);
      
      // Save to database
      const parserRecord = await AIResumeParser.create({
        employeeId: req.body.employeeId || null,
        fileName: req.file.originalname,
        filePath: req.file.path,
        parsedData: result.parsedData,
        extractedText: result.extractedText,
        confidence: result.confidence,
        processingTime: result.processingTime,
        status: 'processed'
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
      const { reportType, parameters } = req.body;
      
      // Generate report using AI service
      const aiService = AIController.getAIService();
      const report = await aiService.generateSmartReport(reportType, parameters);
      
      return sendSuccess(res, report, 'Smart report generated');
    } catch (error) {
      return sendError(res, error.message, 500);
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
        chatbot: { enabled: true, version: '1.0' },
        smartReports: { enabled: true, version: '1.0' }
      };

      return sendSuccess(res, status, 'AI feature status retrieved');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }
}

module.exports = AIController;
