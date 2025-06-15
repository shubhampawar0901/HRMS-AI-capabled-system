const { GoogleGenerativeAI } = require('@google/generative-ai');
const RAGService = require('./RAGService');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const {
  Employee,
  Attendance,
  LeaveApplication,
  PerformanceReview,
  Payroll,
  LeaveBalance,
  AIPolicyDocument
} = require('../models');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Fast model for quick responses (Gemini 1.5 Flash)
    this.fastModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    // Advanced model for complex analysis (Gemini 1.5 Pro)
    this.advancedModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro'
    });

    // Smart Reports model - Gemini 1.5 Flash for efficient analysis (avoiding quota limits)
    this.smartReportsModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    // Gemini 2.0 Pro model for resume parsing
    this.resumeParserModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp' // Using the most advanced available model
    });

    // Default to advanced model for backward compatibility
    this.model = this.advancedModel;

    this.ragService = new RAGService();

    // Response cache for frequently asked questions
    this.responseCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes

    // Performance tracking
    this.performanceMetrics = {
      fastResponses: 0,
      advancedResponses: 0,
      cacheHits: 0,
      averageResponseTime: 0
    };
  }

  // ==========================================
  // RESUME PARSER
  // ==========================================
  
  async parseResume(file) {
    try {
      const startTime = Date.now();

      // Extract text from file (simplified - would use actual PDF/DOC parser)
      const extractedText = await this.extractTextFromFile(file);

      // Use Gemini 2.0 Pro to parse resume data with employee form-specific fields
      const prompt = `
        Parse the following resume text and extract structured information in JSON format.
        Extract ONLY the information that is clearly present in the resume text.

        Resume Text:
        ${extractedText}

        Please extract and return ONLY a valid JSON object with these exact fields.
        IMPORTANT: Use null for any field where the information is not clearly available in the resume:

        {
          "firstName": null,
          "lastName": null,
          "email": null,
          "phone": null,
          "address": null,
          "position": null,
          "emergencyContact": null,
          "emergencyPhone": null,
          "experience": [],
          "education": [],
          "skills": [],
          "summary": null
        }

        Instructions:
        - firstName: Extract only the first name from the resume
        - lastName: Extract only the last name from the resume
        - email: Extract email address if clearly mentioned
        - phone: Extract primary phone/mobile number if available
        - address: Extract current address if mentioned
        - position: Extract the most recent or current job title
        - emergencyContact: Extract emergency contact name if mentioned
        - emergencyPhone: Extract emergency contact phone if mentioned
        - experience: Array of work experience with company, position, duration
        - education: Array of educational qualifications
        - skills: Array of technical/professional skills
        - summary: Brief professional summary if available

        CRITICAL: Return null (not empty string) for any field where information is not found.
        Do not make assumptions or generate placeholder data.
        Return only valid JSON without any markdown formatting.
      `;

      const result = await this.resumeParserModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      let parsedData;
      try {
        parsedData = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (parseError) {
        console.warn('JSON parsing failed, using fallback parser:', parseError);
        parsedData = this.fallbackResumeParser(extractedText);
      }

      // Calculate confidence based on how many fields were extracted
      const confidence = this.calculateParsingConfidence(parsedData);

      const processingTime = Date.now() - startTime;

      // Clean up uploaded file after processing
      try {
        await fs.unlink(file.path);
        console.log('Cleaned up uploaded file:', file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError.message);
      }

      return {
        parsedData,
        extractedText,
        confidence,
        processingTime
      };
    } catch (error) {
      console.error('Resume parsing error:', error);

      // Clean up file even if parsing failed
      try {
        await fs.unlink(file.path);
        console.log('Cleaned up uploaded file after error:', file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file after error:', cleanupError.message);
      }

      throw new Error('Failed to parse resume');
    }
  }

  async extractTextFromFile(file) {
    try {
      console.log('Extracting text from file:', file.originalname, 'at path:', file.path);

      // Ensure uploads directory exists
      const path = require('path');
      const uploadsDir = path.dirname(file.path);
      try {
        await fs.access(uploadsDir);
      } catch (dirError) {
        console.log('Creating uploads directory:', uploadsDir);
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      // Check if file exists
      try {
        await fs.access(file.path);
      } catch (fileError) {
        throw new Error(`File not found at path: ${file.path}. Upload may have failed.`);
      }

      const fileBuffer = await fs.readFile(file.path);

      // Extract text based on file type
      if (file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(fileBuffer);
        console.log('PDF text extracted, length:', pdfData.text.length);

        // Clean up the uploaded file after processing
        try {
          await fs.unlink(file.path);
          console.log('Temporary file cleaned up:', file.path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temporary file:', cleanupError.message);
        }

        return pdfData.text;
      } else if (file.mimetype === 'application/msword' ||
                 file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For Word documents, we'll use a simple fallback for now
        // In production, you'd use mammoth.js or similar
        console.log('Word document detected, using fallback text extraction');

        // Clean up the uploaded file
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temporary file:', cleanupError.message);
        }

        return `Word document content from ${file.originalname}. Please convert to PDF for better text extraction.`;
      } else {
        console.log('Unsupported file type:', file.mimetype);

        // Clean up the uploaded file
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temporary file:', cleanupError.message);
        }

        return `Unsupported file type: ${file.mimetype}. Please upload a PDF file for best results.`;
      }
    } catch (error) {
      console.error('Text extraction error:', error);

      // Try to clean up the file even if processing failed
      if (file.path) {
        try {
          await fs.unlink(file.path);
          console.log('Cleaned up failed upload file:', file.path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup failed upload file:', cleanupError.message);
        }
      }

      // Return a fallback that includes the error info for debugging
      return `Error extracting text from ${file.originalname}: ${error.message}. Please try uploading a different file.`;
    }
  }

  fallbackResumeParser(text) {
    // Extract basic information using regex patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

    const email = text.match(emailRegex)?.[0] || null;
    const phone = text.match(phoneRegex)?.[0] || null;

    return {
      firstName: null,
      lastName: null,
      email: email,
      phone: phone,
      address: null,
      position: null,
      emergencyContact: null,
      emergencyPhone: null,
      experience: [],
      education: [],
      skills: [],
      summary: text.length > 200 ? text.substring(0, 200) : null
    };
  }

  // Calculate confidence score based on extracted data
  calculateParsingConfidence(parsedData) {
    let score = 0;
    let maxScore = 0;

    // Core personal information (higher weight)
    if (parsedData.firstName) { score += 20; }
    if (parsedData.lastName) { score += 20; }
    if (parsedData.email) { score += 25; }
    if (parsedData.phone) { score += 20; }
    maxScore += 85;

    // Additional information (lower weight)
    if (parsedData.address) { score += 5; }
    if (parsedData.position) { score += 10; }
    maxScore += 15;

    return Math.min(score / maxScore, 1.0);
  }

  // ==========================================
  // ATTRITION PREDICTION
  // ==========================================
  
  async predictAttrition(employeeId) {
    try {
      // Get employee data
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Get related data for prediction
      const attendanceData = await Attendance.findByEmployee(employeeId, {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        endDate: new Date()
      });

      const leaveData = await LeaveApplication.findByEmployee(employeeId, {
        year: new Date().getFullYear()
      });

      const performanceData = await PerformanceReview.findByEmployee(employeeId, {
        limit: 3
      });

      // Prepare data for AI analysis
      const analysisData = {
        employee: {
          tenure: this.calculateTenure(employee.hireDate),
          department: employee.departmentId,
          position: employee.position,
          salary: employee.basicSalary
        },
        attendance: {
          averageHours: this.calculateAverageHours(attendanceData),
          lateCount: attendanceData.filter(a => a.status === 'late').length,
          absentCount: attendanceData.filter(a => a.status === 'absent').length
        },
        leave: {
          totalDays: leaveData.reduce((sum, l) => sum + l.totalDays, 0),
          frequency: leaveData.length
        },
        performance: {
          averageRating: this.calculateAverageRating(performanceData),
          trendDirection: this.calculatePerformanceTrend(performanceData)
        }
      };

      // Use Gemini for attrition prediction
      const prompt = `
        Analyze the following employee data and predict attrition risk:
        
        Employee Data: ${JSON.stringify(analysisData)}
        
        Please provide a JSON response with:
        {
          "riskScore": 0.0-1.0,
          "riskLevel": "low|medium|high|critical",
          "factors": ["factor1", "factor2"],
          "recommendations": ["recommendation1", "recommendation2"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let prediction;
      try {
        prediction = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (parseError) {
        // Fallback prediction
        prediction = this.fallbackAttritionPrediction(analysisData);
      }

      return prediction;
    } catch (error) {
      console.error('Attrition prediction error:', error);
      throw new Error('Failed to predict attrition');
    }
  }

  fallbackAttritionPrediction(data) {
    const riskScore = Math.min(
      (data.attendance.lateCount * 0.1 + 
       data.attendance.absentCount * 0.2 + 
       (5 - data.performance.averageRating) * 0.2) / 3,
      1.0
    );

    return {
      riskScore,
      riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      factors: ['attendance_issues', 'performance_concerns'],
      recommendations: ['schedule_one_on_one', 'review_workload']
    };
  }

  // ==========================================
  // SMART FEEDBACK
  // ==========================================
  
  async generateSmartFeedback({ employeeId, feedbackType, performanceData }) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const prompt = `
        Generate constructive feedback for an employee based on the following data:
        
        Employee: ${employee.firstName} ${employee.lastName}
        Position: ${employee.position}
        Feedback Type: ${feedbackType}
        Performance Data: ${JSON.stringify(performanceData)}
        
        Please provide a JSON response with:
        {
          "feedback": "detailed constructive feedback",
          "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
          "confidence": 0.0-1.0
        }
        
        Make the feedback specific, actionable, and encouraging.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let feedback;
      try {
        feedback = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (parseError) {
        feedback = this.fallbackSmartFeedback(feedbackType);
      }

      return feedback;
    } catch (error) {
      console.error('Smart feedback error:', error);
      throw new Error('Failed to generate smart feedback');
    }
  }

  fallbackSmartFeedback(feedbackType) {
    const templates = {
      performance: {
        feedback: "Your recent performance shows areas of strength and opportunities for growth.",
        suggestions: ["Focus on key objectives", "Seek feedback regularly", "Develop new skills"],
        confidence: 0.7
      },
      development: {
        feedback: "Consider focusing on skill development to advance your career.",
        suggestions: ["Identify skill gaps", "Take relevant courses", "Find a mentor"],
        confidence: 0.7
      }
    };

    return templates[feedbackType] || templates.performance;
  }

  // ==========================================
  // ANOMALY DETECTION
  // ==========================================
  
  async detectAttendanceAnomalies(employeeId, dateRange) {
    try {
      let anomalies = [];

      // If employeeId is null (admin analyzing all employees), get all employees
      if (employeeId === null || employeeId === undefined) {
        console.log('🔍 Admin user - analyzing all employees for anomalies');

        // Get all active employees
        const Employee = require('../models/Employee');
        const allEmployees = await Employee.findAll({ status: 'active' });

        console.log(`📊 Found ${allEmployees.length} active employees to analyze`);

        // Analyze each employee
        for (const employee of allEmployees) {
          const employeeAnomalies = await this.detectEmployeeAnomalies(employee.id, dateRange);
          anomalies = anomalies.concat(employeeAnomalies);
        }

        console.log(`🎯 Total anomalies detected across all employees: ${anomalies.length}`);
      } else {
        // Analyze specific employee
        console.log(`🔍 Analyzing specific employee: ${employeeId}`);
        anomalies = await this.detectEmployeeAnomalies(employeeId, dateRange);
      }

      return anomalies;
    } catch (error) {
      console.error('Anomaly detection error:', error);
      throw new Error('Failed to detect anomalies');
    }
  }

  async detectEmployeeAnomalies(employeeId, dateRange) {
    try {
      const attendanceData = await Attendance.findByEmployee(employeeId, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      console.log(`📊 Employee ${employeeId}: Found ${attendanceData.length} attendance records`);

      const anomalies = [];

      // Skip analysis if no attendance data
      if (attendanceData.length === 0) {
        console.log(`⚠️ Employee ${employeeId}: No attendance data found for the period`);
        return anomalies;
      }

      // Use AI-powered anomaly detection instead of hardcoded rules
      const aiAnomalies = await this.detectAnomaliesWithAI(employeeId, attendanceData);

      // Convert AI results to our format
      for (const aiAnomaly of aiAnomalies) {
        anomalies.push({
          employeeId,
          type: aiAnomaly.type,
          date: new Date(),
          data: aiAnomaly.data,
          severity: aiAnomaly.severity,
          description: aiAnomaly.description,
          recommendations: aiAnomaly.recommendations
        });
      }

      console.log(`🎯 Employee ${employeeId}: AI detected ${anomalies.length} anomalies`);
      return anomalies;
    } catch (error) {
      console.error(`Anomaly detection error for employee ${employeeId}:`, error);

      // Fallback to rule-based detection if AI fails
      console.log(`🔄 Falling back to rule-based detection for employee ${employeeId}`);
      const attendanceData = await Attendance.findByEmployee(employeeId, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      return await this.detectEmployeeAnomaliesFallback(employeeId, attendanceData);
    }
  }

  async detectAnomaliesWithAI(employeeId, attendanceData) {
    try {
      // Prepare attendance data for AI analysis
      const analysisData = {
        employeeId,
        totalRecords: attendanceData.length,
        dateRange: {
          start: attendanceData[0]?.date,
          end: attendanceData[attendanceData.length - 1]?.date
        },
        patterns: {
          statusDistribution: this.calculateStatusDistribution(attendanceData),
          hoursAnalysis: this.calculateHoursAnalysis(attendanceData),
          timePatterns: this.calculateTimePatterns(attendanceData),
          weeklyTrends: this.calculateWeeklyTrends(attendanceData)
        },
        rawData: attendanceData.map(record => ({
          date: record.date,
          status: record.status,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          totalHours: record.totalHours,
          location: record.location
        }))
      };

      // Create AI prompt for anomaly detection
      const prompt = `
        You are an advanced HR analytics AI specializing in attendance anomaly detection.
        Analyze the following employee attendance data and identify any anomalous patterns that require attention.

        Employee Attendance Data:
        ${JSON.stringify(analysisData, null, 2)}

        Instructions:
        1. Look for patterns that deviate significantly from normal attendance behavior
        2. Consider context like gradual changes vs sudden shifts
        3. Identify different types of anomalies (late patterns, irregular hours, absence patterns, location anomalies)
        4. Assess severity based on impact and frequency
        5. Provide actionable recommendations

        Return a JSON array of anomalies in this exact format:
        [
          {
            "type": "late_pattern|irregular_hours|absence_pattern|location_anomaly|early_departure",
            "severity": "low|medium|high",
            "confidence": 0.0-1.0,
            "description": "Clear description of the anomaly",
            "data": {
              "metric": "specific_value",
              "threshold": "what_constitutes_normal",
              "deviation": "how_much_it_deviates"
            },
            "recommendations": ["actionable_recommendation_1", "actionable_recommendation_2"]
          }
        ]

        Only return anomalies with confidence > 0.7. If no significant anomalies found, return empty array [].
      `;

      console.log(`🤖 Sending attendance data to Gemini for AI analysis...`);

      const result = await this.fastModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log(`✅ Received AI analysis response`);

      // Parse AI response
      let aiAnomalies;
      try {
        // Clean the response text
        const cleanedText = text.replace(/```json|```/g, '').trim();
        aiAnomalies = JSON.parse(cleanedText);

        if (!Array.isArray(aiAnomalies)) {
          throw new Error('AI response is not an array');
        }

        console.log(`🎯 AI identified ${aiAnomalies.length} potential anomalies`);

        // Filter by confidence threshold
        const highConfidenceAnomalies = aiAnomalies.filter(anomaly =>
          anomaly.confidence && anomaly.confidence > 0.7
        );

        console.log(`✅ ${highConfidenceAnomalies.length} high-confidence anomalies after filtering`);

        return highConfidenceAnomalies;

      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.log('Raw AI response:', text);
        throw new Error('Invalid AI response format');
      }

    } catch (error) {
      console.error('AI anomaly detection failed:', error);
      throw error;
    }
  }

  // Helper methods for AI analysis
  calculateStatusDistribution(attendanceData) {
    const distribution = {};
    attendanceData.forEach(record => {
      distribution[record.status] = (distribution[record.status] || 0) + 1;
    });
    return distribution;
  }

  calculateHoursAnalysis(attendanceData) {
    const hours = attendanceData.map(a => parseFloat(a.totalHours) || 0).filter(h => h > 0);
    if (hours.length === 0) return { avgHours: 0, stdDev: 0, variance: 0 };

    const avgHours = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const variance = hours.reduce((sum, h) => sum + Math.pow(h - avgHours, 2), 0) / hours.length;
    const stdDev = Math.sqrt(variance);

    return { avgHours, stdDev, variance, minHours: Math.min(...hours), maxHours: Math.max(...hours) };
  }

  calculateTimePatterns(attendanceData) {
    const checkInTimes = [];
    const checkOutTimes = [];

    attendanceData.forEach(record => {
      if (record.checkInTime) {
        const time = new Date(`1970-01-01T${record.checkInTime}`);
        checkInTimes.push(time.getHours() + time.getMinutes() / 60);
      }
      if (record.checkOutTime) {
        const time = new Date(`1970-01-01T${record.checkOutTime}`);
        checkOutTimes.push(time.getHours() + time.getMinutes() / 60);
      }
    });

    return {
      avgCheckInTime: checkInTimes.length > 0 ? checkInTimes.reduce((sum, t) => sum + t, 0) / checkInTimes.length : 0,
      avgCheckOutTime: checkOutTimes.length > 0 ? checkOutTimes.reduce((sum, t) => sum + t, 0) / checkOutTimes.length : 0,
      checkInVariance: this.calculateVariance(checkInTimes),
      checkOutVariance: this.calculateVariance(checkOutTimes)
    };
  }

  calculateWeeklyTrends(attendanceData) {
    const weeklyData = {};
    attendanceData.forEach(record => {
      const date = new Date(record.date);
      const weekDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (!weeklyData[weekDay]) weeklyData[weekDay] = [];
      weeklyData[weekDay].push(record);
    });

    return weeklyData;
  }

  calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    return numbers.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / numbers.length;
  }

  // Fallback rule-based detection (original logic)
  async detectEmployeeAnomaliesFallback(employeeId, attendanceData) {
    const anomalies = [];

    // Detect patterns using original rule-based logic
    const latePattern = this.detectLatePattern(attendanceData);
    const irregularHours = this.detectIrregularHours(attendanceData);
    const absencePattern = this.detectAbsencePattern(attendanceData);

    if (latePattern.isAnomaly) {
      anomalies.push({
        employeeId,
        type: 'late_pattern',
        date: new Date(),
        data: latePattern.data,
        severity: latePattern.severity,
        description: latePattern.description,
        recommendations: latePattern.recommendations
      });
    }

    if (irregularHours.isAnomaly) {
      anomalies.push({
        employeeId,
        type: 'irregular_hours',
        date: new Date(),
        data: irregularHours.data,
        severity: irregularHours.severity,
        description: irregularHours.description,
        recommendations: irregularHours.recommendations
      });
    }

    if (absencePattern.isAnomaly) {
      anomalies.push({
        employeeId,
        type: 'absence_pattern',
        date: new Date(),
        data: absencePattern.data,
        severity: absencePattern.severity,
        description: absencePattern.description,
        recommendations: absencePattern.recommendations
      });
    }

    console.log(`🔄 Fallback detection found ${anomalies.length} anomalies for employee ${employeeId}`);
    return anomalies;
  }

  // ==========================================
  // RAG-ENHANCED CHATBOT
  // ==========================================

  async processChatbotQuery(message, userContext) {
    try {
      const startTime = Date.now();

      // Check cache first for fast responses
      const cacheKey = this.generateCacheKey(message, userContext.role);
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        this.performanceMetrics.cacheHits++;
        return {
          ...cachedResponse,
          responseTime: Date.now() - startTime,
          cached: true
        };
      }

      // Role-based access control
      if (!this.hasAccess(message, userContext.role)) {
        return {
          message: "I'm sorry, but you don't have access to that information.",
          type: 'access_denied',
          intent: 'unauthorized',
          confidence: 1.0,
          responseTime: Date.now() - startTime
        };
      }

      // Determine query intent and route accordingly
      const intent = await this.detectQueryIntent(message);
      let response;

      switch (intent.type) {
        case 'greeting':
          response = await this.handleGreeting(message, userContext);
          break;
        case 'out_of_scope':
          response = await this.handleOutOfScope(message, userContext);
          break;
        case 'unauthorized_access':
          response = await this.handleUnauthorizedAccess(message, userContext);
          break;
        case 'ambiguous':
          response = await this.handleAmbiguousQuery(message, userContext);
          break;
        case 'leave_balance':
          response = await this.handleLeaveBalanceQuery(message, userContext);
          break;
        case 'policy_question':
          response = await this.handlePolicyQuery(message, userContext);
          break;
        case 'employee_data':
          response = await this.handleEmployeeDataQuery(message, userContext);
          break;
        case 'general_hr':
          response = await this.handleGeneralHRQuery(message, userContext);
          break;
        default:
          response = await this.handleGeneralQuery(message, userContext);
      }

      response.responseTime = Date.now() - startTime;
      response.intent = intent.type;
      response.confidence = intent.confidence;

      // Cache frequently asked questions (non-personal data only)
      if (this.shouldCache(intent.type, response)) {
        this.setCachedResponse(cacheKey, response);
      }

      // Update performance metrics
      this.updatePerformanceMetrics(response.responseTime, intent.type);

      return response;
    } catch (error) {
      console.error('Chatbot query error:', error);
      return {
        message: "I'm experiencing technical difficulties. Please try again later or contact HR directly.",
        intent: 'error',
        confidence: 0.0,
        type: 'error',
        responseTime: Date.now() - startTime
      };
    }
  }

  async detectQueryIntent(message) {
    const lowerMessage = message.toLowerCase().trim();

    // 1. GREETING DETECTION - Highest Priority (with fuzzy matching)
    const greetingPatterns = [
      'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
      'namaste', 'greetings', 'hola', 'howdy', 'what\'s up', 'whatsup'
    ];

    // Enhanced greeting patterns with common misspellings
    const greetingVariations = [
      'hi', 'hii', 'hiii', 'hello', 'helo', 'hallo', 'hey', 'heyyy',
      'good morning', 'gud morning', 'good mrng', 'gud mrng', 'gd morning',
      'good afternoon', 'gud afternoon', 'good evening', 'gud evening',
      'namaste', 'namaskar', 'greetings', 'greeting'
    ];

    if (greetingPatterns.some(pattern => lowerMessage === pattern || lowerMessage.startsWith(pattern + ' ')) ||
        greetingVariations.some(pattern => lowerMessage === pattern || lowerMessage.startsWith(pattern + ' '))) {
      return { type: 'greeting', confidence: 0.95 };
    }

    // 2. OUT-OF-SCOPE DETECTION - High Priority
    const outOfScopePatterns = [
      'weather', 'joke', 'story', 'recipe', 'sports', 'cricket', 'football', 'movie',
      'sachin tendulkar', 'virat kohli', 'bollywood', 'politics', 'news', 'stock market',
      'bitcoin', 'cryptocurrency', 'travel', 'restaurant', 'food', 'music', 'game',
      'what is 2+2', 'what\'s 2+2', 'solve', 'calculate', 'math', 'physics', 'chemistry', 'history',
      'geography', 'who is', 'what is the capital', 'tell me about', 'explain quantum',
      'entertainment', 'celebrity', 'personal life', 'dating', 'relationship', 'hobby'
    ];

    // Enhanced out-of-scope patterns with common misspellings
    const outOfScopeVariations = [
      'weather', 'wether', 'wheather', 'joke', 'jok', 'joks', 'story', 'storys',
      'recipe', 'recepie', 'sports', 'sport', 'cricket', 'criket', 'football', 'footbal',
      'movie', 'movies', 'moive', 'politics', 'politcs', 'news', 'newz',
      'travel', 'travle', 'restaurant', 'resturant', 'food', 'fud', 'music', 'muzic',
      'game', 'games', 'gam', 'entertainment', 'entertanment'
    ];

    // Enhanced mathematical/calculation detection
    const mathPatterns = [
      /\b\d+\s*[\+\-\*\/\=]\s*\d+/,  // Mathematical expressions: 2+2, 5*3, etc.
      /what['']?s\s+\d+[\+\-\*\/]/i,   // "What's 2+", "What's 5*"
      /\d+\s+(divided\s+by|plus|minus|times|multiplied\s+by)\s+\d+/i, // "15 divided by 3"
      /calculate|solve|math|equation|formula/i,
      /\b(add|subtract|multiply|divide|plus|minus|times)\b/i
    ];

    // Check for out-of-scope patterns (but exclude HR-related unauthorized access)
    const isOutOfScope = outOfScopePatterns.some(pattern => lowerMessage.includes(pattern)) ||
                        outOfScopeVariations.some(pattern => lowerMessage.includes(pattern)) ||
                        mathPatterns.some(pattern => pattern.test(message));

    // Don't classify as out-of-scope if it's about employees/colleagues (should be unauthorized_access)
    // or company policies/rules/benefits (should be policy_question or general_hr)
    const isAboutEmployees = /tell me about (other|another)\s+(employee|colleague|coworker|person|staff)/i.test(message);
    const isAboutCompanyPolicy = /tell me about (the\s+)?(company|office|hr)\s+(rule|policy|procedure)/i.test(message);
    const isAboutHRTopics = /(compensation|benefits|pf|provident|gratuity|insurance|salary|payroll|leave|policy|hr)/i.test(message);

    if (isOutOfScope && !isAboutEmployees && !isAboutCompanyPolicy && !isAboutHRTopics) {
      return { type: 'out_of_scope', confidence: 0.9 };
    }

    // 3. UNAUTHORIZED DATA ACCESS DETECTION
    const unauthorizedPatterns = [
      'other employee', 'other employee\'s', 'someone else', 'colleague', 'colleague\'s', 'coworker', 'coworker\'s', 'team member', 'team member\'s',
      'raj\'s salary', 'priya\'s leave', 'amit\'s performance', 'manager\'s data',
      'everyone\'s', 'all employees', 'team salary', 'department salary', 'staff salary',
      'tell me about other', 'show me other', 'give me other', 'what about other',
      'other people', 'other staff', 'other workers', 'another employee', 'another person'
    ];

    // Enhanced patterns for indirect unauthorized requests
    const indirectUnauthorizedPatterns = [
      /tell me about (?!my|mine)\w+['']?s?\s+(salary|leave|performance|data|information|profile|details)/i,
      /tell me about (other|another)\s+(employee|colleague|coworker|person|staff)/i,
      /show me (?!my|mine)\w+['']?s?\s+(salary|leave|performance|data|information|profile|details)/i,
      /what['']?s (?!my|mine)\w+['']?s?\s+(salary|leave|performance|data|information|profile|details)/i,
      /(?!my|mine)\w+['']?s\s+(salary|leave|performance|data|information|profile|details)/i,
      /other\s+employee['']?s?\s+(salary|leave|performance|data|information|profile|details)/i,
      /(other|another)\s+employee['']?s?\s+(performance|data|information|profile|details)/i
    ];

    // Check for unauthorized access patterns
    if (unauthorizedPatterns.some(pattern => lowerMessage.includes(pattern)) ||
        indirectUnauthorizedPatterns.some(pattern => pattern.test(message))) {
      return { type: 'unauthorized_access', confidence: 0.85 };
    }

    // 4. LEAVE BALANCE QUERIES (specific to balance/quota, not application process)
    const leaveBalancePatterns = [
      'leave balance', 'remaining leave', 'leave days left', 'leave quota',
      'how many leave', 'my leave balance', 'my remaining leave'
    ];

    // Enhanced leave balance patterns with common misspellings
    const leaveBalanceVariations = [
      'leave balance', 'leav balance', 'leave balence', 'leav balence', 'leave balanc',
      'remaining leave', 'remaining leav', 'remaning leave', 'remaning leav',
      'leave days left', 'leav days left', 'leave day left',
      'leave quota', 'leav quota', 'my leave balance', 'my leav balance',
      'my leave balence', 'my leav balence', 'how many leave', 'how many leav'
    ];

    // Check both exact and fuzzy patterns
    const isLeaveBalance = leaveBalancePatterns.some(pattern => lowerMessage.includes(pattern)) ||
                          leaveBalanceVariations.some(pattern => lowerMessage.includes(pattern));
    const isAboutApplication = /how.*(submit|apply|file|request).*leave/i.test(message);

    if (isLeaveBalance && !isAboutApplication) {
      return { type: 'leave_balance', confidence: 0.9 };
    }

    // 5. POLICY QUESTIONS (Check before leave balance to avoid conflicts)
    const policyPatterns = [
      'policy', 'procedure', 'rule', 'regulation', 'guideline',
      'how to apply', 'how do i apply', 'how can i apply', 'how should i apply',
      'how to', 'how do i', 'how can i', 'how should i',
      'what is the rule', 'what are the rules', 'what\'s the rule', 'what\'s the process',
      'what is the process', 'what are the steps', 'what\'s the procedure',
      'company rule', 'company rules', 'hr policy', 'company policy', 'office policy',
      'maternity leave', 'paternity leave', 'working hours', 'office hours',
      'dress code', 'code of conduct', 'leave policy', 'attendance policy',
      'what\'s the', 'what is the', 'explain the'
    ];

    // Enhanced procedural question patterns
    const proceduralPatterns = [
      /how\s+(do\s+i|can\s+i|should\s+i|to)\s+(apply|request|get|obtain|submit)/i,
      /what['']?s\s+the\s+(process|procedure|steps|way)\s+(for|to)/i,
      /how\s+(do\s+i|can\s+i|should\s+i)\s+(submit|file|request)/i,
      /(what|how)\s+.*(policy|procedure|rule|process|steps)/i,
      /tell\s+me\s+about\s+(the\s+)?(company|office|hr)\s+(rule|policy|procedure)/i,
      /tell\s+me\s+about\s+the\s+company\s+rules/i
    ];

    if (policyPatterns.some(pattern => lowerMessage.includes(pattern)) ||
        proceduralPatterns.some(pattern => pattern.test(message))) {
      return { type: 'policy_question', confidence: 0.8 };
    }

    // 6. EMPLOYEE DATA QUERIES
    if (lowerMessage.includes('my profile') ||
        lowerMessage.includes('my information') ||
        lowerMessage.includes('my details') ||
        lowerMessage.includes('my data') ||
        lowerMessage.includes('my attendance') ||
        lowerMessage.includes('my performance') ||
        lowerMessage.includes('my goals') ||
        lowerMessage.includes('my payroll')) {
      return { type: 'employee_data', confidence: 0.8 };
    }

    // 7. GENERAL HR QUERIES
    if (lowerMessage.includes('hr') ||
        lowerMessage.includes('human resource') ||
        lowerMessage.includes('benefits') ||
        lowerMessage.includes('payroll') ||
        lowerMessage.includes('compensation') ||
        lowerMessage.includes('training') ||
        lowerMessage.includes('appraisal')) {
      return { type: 'general_hr', confidence: 0.7 };
    }

    // 8. AMBIGUOUS OR MIXED QUERIES
    const hrKeywords = ['leave', 'policy', 'hr', 'employee', 'work', 'office', 'company'];
    const nonHrKeywords = ['weather', 'food', 'movie', 'sports', 'politics'];
    const hasHrKeywords = hrKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasNonHrKeywords = nonHrKeywords.some(keyword => lowerMessage.includes(keyword));

    if (hasHrKeywords && hasNonHrKeywords) {
      return { type: 'ambiguous', confidence: 0.6 };
    }

    return { type: 'general', confidence: 0.5 };
  }

  // ==========================================
  // SHUBH CHATBOT PERSONALITY HANDLERS
  // ==========================================

  async handleGreeting(message, userContext) {
    const employeeName = userContext.employeeName || 'there';
    return {
      message: `Hello ${employeeName}! I'm Shubh, your HR assistant. I can help with company policies and your personal HR information like leave, payroll, goals, and attendance. What would you like to know today?`,
      type: 'response',
      intent: 'greeting'
    };
  }

  async handleOutOfScope(message, userContext) {
    return {
      message: "I'm here to help with company policies and your personal HR records. I cannot assist with that. Please ask me about HR-related topics like leave policies, your attendance, or company procedures.",
      type: 'response',
      intent: 'out_of_scope'
    };
  }

  async handleUnauthorizedAccess(message, userContext) {
    return {
      message: "For privacy reasons, I can only share your own information. I cannot provide details about other employees. Would you like to know about your own HR data instead?",
      type: 'response',
      intent: 'unauthorized_access'
    };
  }

  async handleAmbiguousQuery(message, userContext) {
    return {
      message: "Can you please rephrase your question related to company policies or your HR information? I'm here to help with topics like leave policies, your attendance, payroll, or company procedures.",
      type: 'response',
      intent: 'ambiguous'
    };
  }

  async handleLeaveBalanceQuery(message, userContext) {
    try {
      if (!userContext.employeeId) {
        return {
          message: "I couldn't find your employee information. Please contact HR for assistance.",
          type: 'error'
        };
      }

      // Get employee's leave balance
      const leaveBalances = await LeaveBalance.findByEmployee(userContext.employeeId);
      const currentYear = new Date().getFullYear();
      const currentYearBalances = leaveBalances.filter(lb => lb.year === currentYear);

      if (currentYearBalances.length === 0) {
        return {
          message: "I couldn't find your leave balance information for this year. Please contact HR for assistance.",
          type: 'response'
        };
      }

      let balanceText = "Here's your current leave balance:\n\n";
      currentYearBalances.forEach(balance => {
        balanceText += `• ${balance.leaveTypeName || 'Leave'}: ${balance.remainingDays} days remaining (${balance.usedDays} used out of ${balance.allocatedDays} allocated)\n`;
      });

      return {
        message: balanceText,
        type: 'response',
        data: currentYearBalances
      };
    } catch (error) {
      console.error('Error handling leave balance query:', error);
      return {
        message: "I'm having trouble accessing your leave balance. Please contact HR directly.",
        type: 'error'
      };
    }
  }

  async handlePolicyQuery(message, userContext) {
    try {
      // Search for relevant policy documents using RAG
      const relevantChunks = await this.ragService.searchWithAccessControl(
        message,
        userContext.role,
        { topK: 2 } // Reduced from 3 to 2 for faster responses
      );

      if (relevantChunks.length === 0) {
        return {
          message: "I couldn't find specific policy information related to your question. Please contact HR for detailed policy information.",
          type: 'response'
        };
      }

      // Combine relevant chunks and limit context size for fast responses
      let context = relevantChunks.map(chunk => chunk.text).join('\n\n');

      // Truncate context if too large for fast model
      const maxFastContextSize = 1500;
      if (context.length > maxFastContextSize) {
        context = context.substring(0, maxFastContextSize) + '...';
      }

      // Select optimal model based on context size
      const selectedModel = await this.selectOptimalModel('policy_question', context.length);

      // Generate response using optimal LLM with context
      const prompt = `
        You are Shubh, a professional HR chatbot assistant. Answer the employee's question using the provided policy information.

        Employee Question: ${message}
        Employee Role: ${userContext.role}

        Relevant Policy Information:
        ${context}

        Provide a clear, helpful answer based on the policy information. If the policy information doesn't fully answer the question, mention that they should contact HR for more details.

        Keep the response professional, concise, and helpful. Start responses naturally without saying "I'm Shubh" unless it's a greeting.
      `;

      const result = await selectedModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      return {
        message: responseText,
        type: 'response',
        sources: relevantChunks.map(chunk => ({
          document: chunk.filename,
          relevance: chunk.score
        })),
        modelUsed: selectedModel === this.fastModel ? 'fast' : 'advanced'
      };
    } catch (error) {
      console.error('Error handling policy query:', error);
      return {
        message: "I'm having trouble accessing policy information. Please contact HR directly.",
        type: 'error'
      };
    }
  }

  async handleEmployeeDataQuery(message, userContext) {
    try {
      if (!userContext.employeeId) {
        return {
          message: "I couldn't find your employee information. Please contact HR for assistance.",
          type: 'error'
        };
      }

      // Get employee information
      const employee = await Employee.findById(userContext.employeeId);
      if (!employee) {
        return {
          message: "I couldn't find your employee profile. Please contact HR for assistance.",
          type: 'error'
        };
      }

      // Generate response with employee data (filtered for privacy)
      const employeeInfo = `
        Here's your basic profile information:

        • Name: ${employee.firstName} ${employee.lastName}
        • Employee Code: ${employee.employeeCode}
        • Department: ${employee.departmentName || 'Not assigned'}
        • Position: ${employee.position || 'Not specified'}
        • Hire Date: ${employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'Not available'}

        For any updates to your profile, please contact HR.
      `;

      return {
        message: employeeInfo,
        type: 'response'
      };
    } catch (error) {
      console.error('Error handling employee data query:', error);
      return {
        message: "I'm having trouble accessing your profile information. Please contact HR directly.",
        type: 'error'
      };
    }
  }

  async handleGeneralHRQuery(message, userContext) {
    try {
      // Search for relevant information using RAG
      const relevantChunks = await this.ragService.searchWithAccessControl(
        message,
        userContext.role,
        { topK: 2 }
      );

      let context = '';
      if (relevantChunks.length > 0) {
        context = relevantChunks.map(chunk => chunk.text).join('\n\n');
      }

      // Select optimal model based on context size
      const selectedModel = await this.selectOptimalModel('general_hr', context.length);

      // Generate response
      const prompt = `
        You are Shubh, a professional HR chatbot assistant. Answer the employee's HR-related question.

        Employee Question: ${message}
        Employee Role: ${userContext.role}

        ${context ? `Relevant Information:\n${context}\n\n` : ''}

        Provide a helpful, professional response. If you don't have specific information, guide them to contact HR directly.
        Keep the response concise and actionable. Start responses naturally without saying "I'm Shubh" unless it's a greeting.
      `;

      const result = await selectedModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      return {
        message: responseText,
        type: 'response',
        hasContext: relevantChunks.length > 0,
        modelUsed: selectedModel === this.fastModel ? 'fast' : 'advanced'
      };
    } catch (error) {
      console.error('Error handling general HR query:', error);
      return {
        message: "I'm here to help with HR questions. Please contact HR directly for specific assistance.",
        type: 'error'
      };
    }
  }

  async handleGeneralQuery(message, userContext) {
    return {
      message: "I'm Shubh, your HR assistant. I can help you with:\n\n• Leave balance inquiries\n• HR policy questions\n• General HR procedures\n• Employee information\n• Attendance records\n• Payroll information\n• Performance goals\n\nPlease ask me about any HR-related topics, or contact HR directly for specific assistance.",
      type: 'response'
    };
  }

  hasAccess(message, role) {
    const restrictedKeywords = ['salary', 'payroll', 'confidential', 'private'];
    const hasRestrictedContent = restrictedKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );

    if (hasRestrictedContent && role === 'employee') {
      return false;
    }

    return true;
  }

  // ==========================================
  // PERFORMANCE OPTIMIZATION METHODS
  // ==========================================

  generateCacheKey(message, role) {
    // Create a simple hash for caching (normalize message)
    const normalizedMessage = message.toLowerCase().trim().replace(/[^\w\s]/g, '');
    return `${normalizedMessage}_${role}`;
  }

  getCachedResponse(cacheKey) {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.response;
    }
    if (cached) {
      this.responseCache.delete(cacheKey); // Remove expired cache
    }
    return null;
  }

  setCachedResponse(cacheKey, response) {
    this.responseCache.set(cacheKey, {
      response: { ...response },
      timestamp: Date.now()
    });
  }

  shouldCache(intentType, response) {
    // Cache policy questions, greetings, and out-of-scope responses
    // Don't cache personal data like leave balance or employee data
    const cacheableIntents = ['policy_question', 'greeting', 'out_of_scope', 'unauthorized_access', 'ambiguous', 'general_hr'];
    return cacheableIntents.includes(intentType) && response.type !== 'error';
  }

  updatePerformanceMetrics(responseTime, intentType) {
    // Track which model was used based on response time
    if (responseTime < 500) {
      this.performanceMetrics.fastResponses++;
    } else {
      this.performanceMetrics.advancedResponses++;
    }

    // Update average response time
    const totalResponses = this.performanceMetrics.fastResponses + this.performanceMetrics.advancedResponses;
    this.performanceMetrics.averageResponseTime =
      (this.performanceMetrics.averageResponseTime * (totalResponses - 1) + responseTime) / totalResponses;
  }

  async selectOptimalModel(intentType, contextSize = 0) {
    // Use fast model for simple queries and small contexts
    // Use advanced model for complex analysis and large contexts

    const fastModelIntents = ['greeting', 'out_of_scope', 'unauthorized_access', 'ambiguous'];
    const simpleContextThreshold = 1500; // characters - threshold for fast model

    // Always use fast model for simple intents
    if (fastModelIntents.includes(intentType)) {
      return this.fastModel;
    }

    // For policy and HR queries, use fast model if context is small
    if (contextSize > 0 && contextSize < simpleContextThreshold) {
      console.log(`🚀 Using fast model for ${intentType} (context: ${contextSize} chars)`);
      return this.fastModel;
    }

    // Use advanced model for complex queries or large contexts
    console.log(`🧠 Using advanced model for ${intentType} (context: ${contextSize} chars)`);
    return this.advancedModel;
  }

  // ==========================================
  // SMART REPORTS
  // ==========================================

  async generateSmartReport(reportType, parameters) {
    try {
      const SmartReportsDataService = require('./SmartReportsDataService');
      const dataService = new SmartReportsDataService();

      // Collect comprehensive data based on report type
      let reportData;
      if (reportType === 'employee') {
        reportData = await dataService.getEmployeePerformanceData(parameters.targetId, parameters.dateRange);
      } else if (reportType === 'team') {
        reportData = await dataService.getTeamPerformanceData(parameters.targetId, parameters.dateRange);
      } else {
        throw new Error(`Unsupported report type: ${reportType}`);
      }

      // Generate natural language summary using Gemini
      const aiSummary = await this.generateNaturalLanguageSummary(reportType, reportData);

      return {
        reportType,
        targetId: parameters.targetId,
        reportName: parameters.reportName || `${reportType} Report - ${new Date().toLocaleDateString()}`,
        aiSummary: aiSummary.reportDocument || aiSummary.summary || 'Report generated successfully',
        insights: aiSummary.keyMetrics || aiSummary.insights || [],
        recommendations: aiSummary.recommendations || [],
        dataSnapshot: reportData,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Smart report error:', error);
      throw new Error('Failed to generate smart report');
    }
  }

  async generateNaturalLanguageSummary(reportType, data) {
    try {
      const prompt = this.buildSmartReportPrompt(reportType, data);

      // Use Gemini 1.5 Flash for Smart Reports (efficient and avoids quota limits)
      const result = await this.smartReportsModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (parseError) {
        console.error('JSON parse error in Smart Reports:', parseError);
        // Fallback to structured response
        return this.fallbackSmartReportSummary(reportType, data);
      }
    } catch (error) {
      console.error('Natural language summary error:', error);
      // Check if it's a quota error and provide specific fallback
      if (error.status === 429 || error.message?.includes('quota')) {
        console.warn('API quota exceeded, using fallback Smart Report generation');
      }
      return this.fallbackSmartReportSummary(reportType, data);
    }
  }

  async generateReportRecommendations(insights) {
    return [
      "Review key performance indicators",
      "Address identified issues",
      "Monitor trends closely"
    ];
  }

  // Helper function to safely format dates
  formatDateSafely(dateValue) {
    if (!dateValue) return 'N/A';

    // If it's already a string in a readable format, return as is
    if (typeof dateValue === 'string') {
      // Try to parse it as a date and format it
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toDateString();
        }
        // If parsing fails, return the original string
        return dateValue;
      } catch (error) {
        return dateValue;
      }
    }

    // If it's a Date object, use toDateString
    if (dateValue instanceof Date) {
      return dateValue.toDateString();
    }

    // Fallback
    return String(dateValue);
  }

  buildSmartReportPrompt(reportType, data) {
    switch(reportType) {
      case 'employee':
        return `
          You are a senior HR analytics expert tasked with creating a comprehensive, professional-grade performance analysis report. Generate a detailed, insightful report that provides real value to managers and administrators.

          EMPLOYEE PROFILE:
          - Name: ${data.employee.name}
          - Position: ${data.employee.position}
          - Department: ${data.employee.department}
          - Tenure: ${data.employee.tenure} years
          - Employee ID: ${data.employee.id}
          - Hire Date: ${data.employee.hireDate}

          ANALYSIS PERIOD: ${this.formatDateSafely(data.dateRange.startDate)} to ${this.formatDateSafely(data.dateRange.endDate)}

          COMPREHENSIVE PERFORMANCE DATA:

          Performance Reviews:
          - Average Rating: ${data.performance.averageRating}/5.0
          - Total Reviews Completed: ${data.performance.totalReviews}
          - Performance Trend: ${data.performance.ratingTrend}
          - Recent Review Scores: ${JSON.stringify(data.performance.recentScores || [])}
          - Goal Achievement Rate: ${data.performance.goalAchievementRate || 'N/A'}%

          Attendance & Punctuality Analysis:
          - Overall Attendance Rate: ${data.attendance.attendanceRate}%
          - Punctuality Rate: ${data.attendance.punctualityRate}%
          - Total Working Hours: ${data.attendance.totalHours}
          - Average Daily Hours: ${data.attendance.averageDailyHours || 'N/A'}
          - Late Arrivals: ${data.attendance.lateCount || 0} instances
          - Early Departures: ${data.attendance.earlyDepartureCount || 0} instances
          - Attendance Pattern: ${data.attendance.pattern || 'Regular'}

          Goal Management & Achievement:
          - Goal Completion Rate: ${data.goals.completionRate}%
          - Average Achievement Score: ${data.goals.averageAchievement}%
          - Active Goals: ${data.goals.activeGoals}
          - Completed Goals: ${data.goals.completedGoals || 0}
          - Overdue Goals: ${data.goals.overdueGoals || 0}
          - Goal Categories: ${JSON.stringify(data.goals.categories || [])}

          Leave Management:
          - Total Leave Days Used: ${data.leave.approvedDays}
          - Leave Utilization Rate: ${data.leave.utilizationRate}%
          - Sick Leave Days: ${data.leave.sickDays || 0}
          - Vacation Days: ${data.leave.vacationDays || 0}
          - Personal Leave: ${data.leave.personalDays || 0}
          - Leave Pattern Analysis: ${data.leave.pattern || 'Normal'}

          INSTRUCTIONS FOR COMPREHENSIVE ANALYSIS:

          Create a detailed, professional report (minimum 1000-1500 words) that includes:

          1. EXECUTIVE SUMMARY (200-300 words)
             - Overall performance assessment with specific metrics
             - Key highlights and concerns
             - Strategic recommendations summary

          2. DETAILED PERFORMANCE ANALYSIS (300-400 words)
             - In-depth review of performance ratings and trends
             - Comparison with department/organizational benchmarks
             - Analysis of performance consistency and growth trajectory
             - Identification of peak performance periods and contributing factors

          3. ATTENDANCE & PRODUCTIVITY INSIGHTS (250-300 words)
             - Comprehensive attendance pattern analysis
             - Punctuality trends and impact on productivity
             - Working hours analysis and efficiency metrics
             - Correlation between attendance and performance outcomes

          4. GOAL ACHIEVEMENT & DEVELOPMENT (200-250 words)
             - Detailed goal completion analysis
             - Assessment of goal-setting effectiveness
             - Development trajectory and skill progression
             - Alignment with career advancement objectives

          5. RISK ASSESSMENT & OPPORTUNITIES (150-200 words)
             - Identification of potential retention risks
             - Performance improvement opportunities
             - Career development potential assessment
             - Succession planning considerations

          6. STRATEGIC RECOMMENDATIONS (200-250 words)
             - Specific, actionable development recommendations
             - Performance improvement strategies
             - Career advancement pathways
             - Management intervention suggestions

          Return ONLY a JSON object with this structure:
          {
            "reportDocument": "A comprehensive, well-formatted report document (1200-1800 words) that flows as a single unified document with proper headings, sections, and professional formatting. Include:\n\n# EMPLOYEE PERFORMANCE ANALYSIS REPORT\n\n## Executive Summary\n[200-300 words comprehensive overview]\n\n## Performance Analysis\n[300-400 words detailed performance review]\n\n## Attendance & Productivity Assessment\n[250-300 words attendance and productivity analysis]\n\n## Goal Achievement & Development\n[200-250 words goal management and development analysis]\n\n## Risk Assessment & Opportunities\n[150-200 words risk evaluation and growth opportunities]\n\n## Strategic Recommendations\n[200-250 words actionable recommendations with implementation guidance]\n\n## Key Insights\n[Bullet points of critical insights]\n\n## Conclusion\n[Summary and next steps]\n\nUse proper markdown formatting with headers, bullet points, and emphasis where appropriate.",
            "keyMetrics": {
              "overallScore": "Calculated overall performance score (0-100)",
              "strengthAreas": ["Primary strength 1", "Primary strength 2", "Primary strength 3"],
              "improvementAreas": ["Improvement area 1", "Improvement area 2", "Improvement area 3"],
              "retentionRisk": "low|medium|high",
              "developmentPotential": "low|medium|high|exceptional"
            }
          }

          CRITICAL REQUIREMENTS:
          - Use professional, analytical language appropriate for senior management
          - Include specific data points and metrics throughout the analysis
          - Provide actionable insights with clear business impact
          - Ensure each section meets the minimum word count requirements
          - Focus on strategic value and decision-making support
          - Maintain objectivity while highlighting both strengths and areas for improvement
        `;

      case 'team':
        return `
          You are a senior HR analytics expert specializing in team performance analysis. Generate a comprehensive, strategic team performance report that provides actionable insights for senior management and team development.

          TEAM PROFILE:
          - Manager: ${data.manager.name}
          - Department: ${data.manager.department}
          - Team Size: ${data.team.size} employees
          - Manager ID: ${data.manager.id}
          - Department Code: ${data.manager.departmentCode || 'N/A'}

          ANALYSIS PERIOD: ${this.formatDateSafely(data.dateRange.startDate)} to ${this.formatDateSafely(data.dateRange.endDate)}

          COMPREHENSIVE TEAM METRICS:

          Overall Team Performance:
          - Average Performance Rating: ${data.teamMetrics.averageRating}/5.0
          - Team Goal Achievement Rate: ${data.teamMetrics.averageGoalAchievement}%
          - Team Attendance Rate: ${data.teamMetrics.averageAttendanceRate}%
          - Performance Distribution: ${JSON.stringify(data.teamMetrics.performanceDistribution || {})}
          - Team Productivity Index: ${data.teamMetrics.productivityIndex || 'N/A'}

          Individual Team Member Analysis:
          ${data.memberSummaries.map(member =>
            `- ${member.employee.name} (${member.employee.position}):
              * Performance Rating: ${member.performance.averageRating}/5.0
              * Attendance Rate: ${member.attendance.attendanceRate}%
              * Goal Completion: ${member.goals.completionRate || 'N/A'}%
              * Tenure: ${member.employee.tenure || 'N/A'} years
              * Recent Trend: ${member.performance.trend || 'Stable'}`
          ).join('\n')}

          Team Collaboration Metrics:
          - Cross-functional Projects: ${data.teamMetrics.collaborationProjects || 0}
          - Knowledge Sharing Sessions: ${data.teamMetrics.knowledgeSharing || 0}
          - Team Meeting Attendance: ${data.teamMetrics.meetingAttendance || 'N/A'}%
          - Peer Feedback Scores: ${data.teamMetrics.peerFeedback || 'N/A'}

          INSTRUCTIONS FOR COMPREHENSIVE TEAM ANALYSIS:

          Create a detailed, strategic team report (minimum 1200-1600 words) that includes:

          1. EXECUTIVE SUMMARY (250-350 words)
             - Overall team performance assessment with key metrics
             - Strategic highlights and critical concerns
             - High-level recommendations for leadership

          2. TEAM PERFORMANCE ANALYSIS (350-450 words)
             - Detailed analysis of team performance trends
             - Individual contributor assessment and ranking
             - Performance distribution analysis and implications
             - Comparison with organizational benchmarks and industry standards

          3. TEAM DYNAMICS & COLLABORATION (300-350 words)
             - Assessment of team cohesion and collaboration effectiveness
             - Communication patterns and knowledge sharing analysis
             - Leadership effectiveness and management style impact
             - Team culture and engagement indicators

          4. INDIVIDUAL TALENT ASSESSMENT (250-300 words)
             - High-performer identification and development potential
             - Underperformer analysis and improvement strategies
             - Succession planning and leadership pipeline assessment
             - Skills gap analysis and training needs identification

          5. OPERATIONAL EFFICIENCY & PRODUCTIVITY (200-250 words)
             - Team productivity metrics and efficiency analysis
             - Resource utilization and capacity planning insights
             - Process improvement opportunities
             - Technology adoption and digital transformation readiness

          6. STRATEGIC RECOMMENDATIONS & ACTION PLAN (200-300 words)
             - Specific team development initiatives
             - Performance improvement strategies
             - Talent retention and acquisition recommendations
             - Long-term team growth and scaling strategies

          Return ONLY a JSON object with this structure:
          {
            "reportDocument": "A comprehensive, well-formatted team report document (1400-2000 words) that flows as a single unified document with proper headings, sections, and professional formatting. Include:\n\n# TEAM PERFORMANCE ANALYSIS REPORT\n\n## Executive Summary\n[250-350 words team performance overview]\n\n## Team Performance Analysis\n[350-450 words detailed team performance review with individual assessments]\n\n## Team Dynamics & Collaboration\n[300-350 words team collaboration and communication analysis]\n\n## Individual Talent Assessment\n[250-300 words individual contributor analysis and development potential]\n\n## Operational Efficiency & Productivity\n[200-250 words operational metrics and efficiency analysis]\n\n## Strategic Recommendations & Action Plan\n[200-300 words strategic initiatives and implementation roadmap]\n\n## Key Team Insights\n[Bullet points of critical team insights and observations]\n\n## Leadership Effectiveness Assessment\n[Analysis of management effectiveness and team leadership]\n\n## Conclusion & Next Steps\n[Summary and strategic next steps for team development]\n\nUse proper markdown formatting with headers, bullet points, tables where appropriate, and emphasis for key findings.",
            "keyMetrics": {
              "teamEffectivenessScore": "Overall team effectiveness score (0-100)",
              "topPerformers": ["Top performer 1", "Top performer 2", "Top performer 3"],
              "developmentPriorities": ["Priority area 1", "Priority area 2", "Priority area 3"],
              "retentionRisk": "low|medium|high",
              "growthPotential": "low|medium|high|exceptional",
              "leadershipEffectiveness": "low|medium|high|exceptional"
            }
          }

          CRITICAL REQUIREMENTS:
          - Use strategic, executive-level language appropriate for senior leadership
          - Include specific team metrics and comparative analysis
          - Provide actionable insights with clear business impact and ROI
          - Ensure each section meets the minimum word count requirements
          - Focus on strategic team development and organizational value
          - Balance individual assessment with team-wide analysis
          - Include both short-term tactical and long-term strategic recommendations
        `;

      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  fallbackSmartReportSummary(reportType, data) {
    if (reportType === 'employee') {
      const performanceLevel = data.performance.averageRating > 4.0 ? 'exceptional' :
                              data.performance.averageRating > 3.5 ? 'strong' :
                              data.performance.averageRating > 2.5 ? 'satisfactory' : 'needs improvement';

      const attendanceLevel = data.attendance.attendanceRate > 95 ? 'excellent' :
                             data.attendance.attendanceRate > 85 ? 'good' : 'concerning';

      const reportDocument = `# EMPLOYEE PERFORMANCE ANALYSIS REPORT

## Executive Summary

This comprehensive performance analysis for **${data.employee.name}** (${data.employee.position}) reveals ${performanceLevel} performance with an average rating of **${data.performance.averageRating}/5.0** over the analysis period from ${this.formatDateSafely(data.dateRange.startDate)} to ${this.formatDateSafely(data.dateRange.endDate)}.

The employee demonstrates ${attendanceLevel} attendance commitment with a **${data.attendance.attendanceRate}%** attendance rate and **${data.attendance.punctualityRate}%** punctuality rate. Goal achievement analysis shows a **${data.goals.completionRate}%** completion rate, indicating ${data.goals.completionRate > 80 ? 'strong execution capabilities and effective goal management' : 'opportunities for improved goal setting and achievement strategies'}.

## Performance Analysis

**Overall Performance Rating:** ${data.performance.averageRating}/5.0 (${performanceLevel})

${data.employee.name} has demonstrated ${data.performance.ratingTrend} performance trends throughout the evaluation period. With ${data.performance.totalReviews} completed performance reviews, the employee shows consistent delivery patterns with specific strengths in core competency areas.

**Key Performance Indicators:**
- Average Performance Rating: ${data.performance.averageRating}/5.0
- Performance Trend: ${data.performance.ratingTrend}
- Total Reviews Completed: ${data.performance.totalReviews}

The performance analysis indicates ${performanceLevel} contribution to team objectives with opportunities for continued growth and development.

## Attendance & Productivity Assessment

**Attendance Overview:** ${data.attendance.attendanceRate}% (${attendanceLevel})

The employee maintains ${attendanceLevel} attendance standards with **${data.attendance.attendanceRate}%** overall attendance rate and **${data.attendance.punctualityRate}%** punctuality rate. Total working hours of **${data.attendance.totalHours}** demonstrate consistent productivity patterns.

**Attendance Metrics:**
- Overall Attendance Rate: ${data.attendance.attendanceRate}%
- Punctuality Rate: ${data.attendance.punctualityRate}%
- Total Working Hours: ${data.attendance.totalHours}

This attendance profile supports reliable team operations and consistent project delivery capabilities.

## Goal Achievement & Development

**Goal Completion Rate:** ${data.goals.completionRate}%

Goal management assessment reveals **${data.goals.completionRate}%** completion rate with **${data.goals.activeGoals}** currently active goals. The employee demonstrates ${data.goals.averageAchievement}% average achievement score, indicating ${data.goals.completionRate > 80 ? 'effective goal-setting alignment and strong execution capabilities' : 'opportunities for enhanced goal planning and achievement strategies'}.

**Goal Performance Metrics:**
- Completion Rate: ${data.goals.completionRate}%
- Average Achievement: ${data.goals.averageAchievement}%
- Active Goals: ${data.goals.activeGoals}

## Risk Assessment & Opportunities

**Retention Risk:** ${data.performance.ratingTrend === 'declining' && data.attendance.attendanceRate < 85 ? 'Medium to High' : 'Low to Medium'}

Risk assessment indicates ${data.performance.ratingTrend === 'declining' ? 'medium' : 'low'} retention risk based on performance trends and engagement indicators. Development potential assessment shows ${data.performance.averageRating > 4.0 ? 'exceptional' : data.performance.averageRating > 3.5 ? 'high' : 'moderate'} opportunities for career advancement and skill enhancement.

**Risk Factors:**
- Performance Trend: ${data.performance.ratingTrend}
- Attendance Reliability: ${attendanceLevel}
- Development Potential: ${data.performance.averageRating > 4.0 ? 'High' : 'Moderate'}

## Strategic Recommendations

Based on the comprehensive analysis, the following strategic recommendations are proposed:

**Immediate Actions:**
${data.performance.ratingTrend === 'declining' ?
  '- Implement performance improvement plan with weekly coaching sessions\n- Establish clear milestone tracking and regular feedback mechanisms' :
  '- Leverage strong performance for advanced development opportunities\n- Consider leadership development and mentoring roles'}

**Development Focus:**
${data.attendance.attendanceRate < 90 ?
  '- Address attendance concerns through flexible work arrangements\n- Evaluate support systems and work-life balance initiatives' :
  '- Utilize attendance reliability for team leadership responsibilities\n- Expand role complexity and strategic project involvement'}

**Goal Enhancement:**
${data.goals.completionRate < 80 ?
  '- Redesign goal-setting process with SMART criteria implementation\n- Increase frequency of progress reviews and support mechanisms' :
  '- Expand goal complexity and strategic alignment for career development\n- Introduce stretch assignments and cross-functional objectives'}

## Key Insights

• **Performance Trajectory:** ${data.performance.ratingTrend} trend with ${performanceLevel} current performance level
• **Reliability Factor:** ${attendanceLevel} attendance commitment supporting consistent operations
• **Goal Orientation:** ${data.goals.completionRate > 80 ? 'Strong' : 'Developing'} achievement focus with systematic approach
• **Development Readiness:** ${data.performance.averageRating > 4.0 ? 'High potential for advanced responsibilities' : 'Solid foundation for continued growth'}

## Conclusion

${data.employee.name} demonstrates ${performanceLevel} performance with ${attendanceLevel} reliability standards. The analysis indicates ${data.performance.ratingTrend === 'improving' ? 'positive momentum with acceleration potential through targeted development initiatives' : 'stable performance foundation with opportunities for strategic enhancement through focused coaching and development planning'}.

**Next Steps:**
1. Schedule comprehensive development discussion
2. Implement recommended action items
3. Establish quarterly progress review schedule
4. Monitor performance indicators and adjust strategies as needed

---
*Report generated on ${new Date().toLocaleDateString()} | Analysis Period: ${this.formatDateSafely(data.dateRange.startDate)} to ${this.formatDateSafely(data.dateRange.endDate)}*`;

      return {
        reportDocument,
        keyMetrics: {
          overallScore: Math.round((data.performance.averageRating * 20) + (data.attendance.attendanceRate * 0.3) + (data.goals.completionRate * 0.2)),
          strengthAreas: [
            data.performance.averageRating > 4.0 ? 'Exceptional Performance' : 'Consistent Delivery',
            data.attendance.attendanceRate > 95 ? 'Excellent Attendance' : 'Reliable Presence',
            data.goals.completionRate > 80 ? 'Strong Goal Achievement' : 'Goal-Oriented Approach'
          ],
          improvementAreas: [
            data.performance.ratingTrend === 'declining' ? 'Performance Consistency' : 'Advanced Skill Development',
            data.attendance.punctualityRate < 90 ? 'Punctuality Enhancement' : 'Time Management Optimization',
            data.goals.completionRate < 80 ? 'Goal Setting Effectiveness' : 'Strategic Planning Skills'
          ],
          retentionRisk: data.performance.ratingTrend === 'declining' && data.attendance.attendanceRate < 85 ? 'high' :
                        data.performance.averageRating < 3.0 ? 'medium' : 'low',
          developmentPotential: data.performance.averageRating > 4.0 && data.goals.completionRate > 85 ? 'exceptional' :
                               data.performance.averageRating > 3.5 ? 'high' : 'medium'
        }
      };
    } else {
      // Team report fallback
      const teamPerformanceLevel = data.teamMetrics.averageRating > 4.0 ? 'exceptional' :
                                   data.teamMetrics.averageRating > 3.5 ? 'strong' :
                                   data.teamMetrics.averageRating > 2.5 ? 'satisfactory' : 'needs improvement';

      const teamReportDocument = `# TEAM PERFORMANCE ANALYSIS REPORT

## Executive Summary

This comprehensive team performance analysis for **${data.manager.name}'s** ${data.team.size}-member team in the ${data.manager.department} department reveals ${teamPerformanceLevel} collective performance with an average rating of **${data.teamMetrics.averageRating}/5.0** during the analysis period from ${this.formatDateSafely(data.dateRange.startDate)} to ${this.formatDateSafely(data.dateRange.endDate)}.

The team demonstrates strong operational effectiveness with **${data.teamMetrics.averageAttendanceRate}%** average attendance rate and **${data.teamMetrics.averageGoalAchievement}%** goal achievement rate. Team dynamics analysis indicates effective collaboration and leadership alignment with opportunities for strategic development and enhanced performance optimization.

## Team Performance Analysis

**Overall Team Rating:** ${data.teamMetrics.averageRating}/5.0 (${teamPerformanceLevel})

The team of ${data.team.size} members demonstrates ${teamPerformanceLevel} collective performance across all evaluation criteria. Individual performance distribution shows balanced contribution levels with identified high performers and development opportunities.

**Team Performance Metrics:**
- Average Team Rating: ${data.teamMetrics.averageRating}/5.0
- Team Size: ${data.team.size} members
- Performance Level: ${teamPerformanceLevel}
- Goal Achievement Rate: ${data.teamMetrics.averageGoalAchievement}%

**Individual Team Member Performance:**
${data.memberSummaries.map(member =>
  `• **${member.employee.name}** (${member.employee.position}): ${member.performance.averageRating}/5.0 rating, ${member.attendance.attendanceRate}% attendance`
).join('\n')}

## Team Dynamics & Collaboration

**Collaboration Effectiveness:** ${data.teamMetrics.averageRating > 3.5 ? 'High' : 'Moderate'}

The team demonstrates effective working relationships with strong communication patterns and knowledge sharing practices. Leadership effectiveness under ${data.manager.name}'s management shows positive team culture development with opportunities for enhanced engagement and strategic alignment.

**Key Collaboration Indicators:**
- Team Communication: Effective
- Knowledge Sharing: Active
- Leadership Alignment: Strong
- Team Cohesion: ${teamPerformanceLevel}

## Individual Talent Assessment

**High Performers Identified:** ${data.memberSummaries.filter(m => m.performance.averageRating > 4.0).length} team members

Individual talent analysis across ${data.team.size} team members reveals diverse skill sets and development potential. The following performance distribution has been identified:

**Performance Distribution:**
${data.memberSummaries.map(member => {
  const level = member.performance.averageRating > 4.0 ? 'High Performer' :
                member.performance.averageRating > 3.5 ? 'Strong Contributor' :
                member.performance.averageRating > 2.5 ? 'Solid Performer' : 'Development Needed';
  return `• ${member.employee.name}: ${level} (${member.performance.averageRating}/5.0)`;
}).join('\n')}

## Operational Efficiency & Productivity

**Team Attendance Rate:** ${data.teamMetrics.averageAttendanceRate}%

Operational efficiency metrics demonstrate effective resource utilization with **${data.teamMetrics.averageAttendanceRate}%** attendance reliability supporting consistent project delivery. The team maintains strong operational standards with opportunities for process optimization.

**Operational Metrics:**
- Average Attendance: ${data.teamMetrics.averageAttendanceRate}%
- Goal Achievement: ${data.teamMetrics.averageGoalAchievement}%
- Team Productivity: ${teamPerformanceLevel}
- Resource Utilization: Effective

## Strategic Recommendations & Action Plan

Based on comprehensive team analysis, the following strategic recommendations are proposed:

**Team Development Initiatives:**
${teamPerformanceLevel === 'exceptional' ?
  '• Implement advanced leadership development programs\n• Establish mentoring roles for high performers\n• Create cross-functional project opportunities' :
  '• Focus on performance optimization and skill enhancement\n• Implement regular team development sessions\n• Establish clear performance improvement pathways'}

**Leadership Enhancement:**
• Strengthen team communication frameworks
• Implement regular feedback mechanisms
• Develop succession planning strategies
• Enhance team collaboration tools and processes

**Performance Optimization:**
${data.teamMetrics.averageAttendanceRate < 90 ?
  '• Address attendance concerns through team engagement initiatives\n• Evaluate work-life balance and support systems' :
  '• Leverage strong attendance for increased project complexity\n• Expand team responsibilities and strategic involvement'}

## Key Team Insights

• **Team Effectiveness:** ${teamPerformanceLevel} collective performance with balanced individual contributions
• **Leadership Impact:** Positive management effectiveness under ${data.manager.name}'s leadership
• **Growth Potential:** ${data.teamMetrics.averageRating > 4.0 ? 'High potential for advanced team initiatives' : 'Solid foundation for continued development'}
• **Operational Reliability:** ${data.teamMetrics.averageAttendanceRate}% attendance rate supporting consistent delivery
• **Strategic Positioning:** Strong foundation for organizational growth and expansion

## Leadership Effectiveness Assessment

**Management Performance:** ${data.teamMetrics.averageRating > 4.0 ? 'Exceptional' : data.teamMetrics.averageRating > 3.5 ? 'Strong' : 'Effective'}

${data.manager.name} demonstrates ${data.teamMetrics.averageRating > 4.0 ? 'exceptional' : 'effective'} leadership capabilities with the team achieving ${teamPerformanceLevel} performance levels. Leadership effectiveness is evidenced by team cohesion, performance consistency, and goal achievement rates.

**Leadership Strengths:**
• Team performance management
• Goal alignment and achievement
• Operational effectiveness
• Team development focus

## Conclusion & Next Steps

The ${data.manager.department} team under ${data.manager.name}'s leadership demonstrates ${teamPerformanceLevel} performance with strong operational foundations. The analysis indicates excellent potential for continued growth through targeted development initiatives and strategic enhancement programs.

**Immediate Next Steps:**
1. Implement recommended team development initiatives
2. Establish regular performance monitoring systems
3. Create individual development plans for team members
4. Schedule quarterly team effectiveness reviews

**Long-term Strategic Goals:**
1. Enhance team leadership capabilities
2. Expand cross-functional collaboration
3. Develop succession planning framework
4. Optimize operational efficiency and productivity

---
*Report generated on ${new Date().toLocaleDateString()} | Analysis Period: ${this.formatDateSafely(data.dateRange.startDate)} to ${this.formatDateSafely(data.dateRange.endDate)}*`;

      return {
        reportDocument: teamReportDocument,
        keyMetrics: {
          teamEffectivenessScore: Math.round((data.teamMetrics.averageRating * 20) + (data.teamMetrics.averageAttendanceRate * 0.3) + (data.teamMetrics.averageGoalAchievement * 0.2)),
          topPerformers: data.memberSummaries.slice(0, 3).map(member => member.employee.name),
          developmentPriorities: [
            teamPerformanceLevel === 'exceptional' ? 'Advanced Leadership Development' : 'Performance Enhancement',
            'Cross-functional Collaboration',
            'Strategic Planning Capabilities'
          ],
          retentionRisk: data.teamMetrics.averageRating < 3.0 ? 'high' :
                        data.teamMetrics.averageAttendanceRate < 85 ? 'medium' : 'low',
          growthPotential: data.teamMetrics.averageRating > 4.0 && data.teamMetrics.averageGoalAchievement > 85 ? 'exceptional' :
                          data.teamMetrics.averageRating > 3.5 ? 'high' : 'medium',
          leadershipEffectiveness: data.teamMetrics.averageRating > 4.0 ? 'exceptional' :
                                  data.teamMetrics.averageRating > 3.5 ? 'high' : 'medium'
        }
      };
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================
  
  calculateTenure(hireDate) {
    const now = new Date();
    const hire = new Date(hireDate);
    return Math.floor((now - hire) / (365.25 * 24 * 60 * 60 * 1000));
  }

  calculateAverageHours(attendanceData) {
    if (attendanceData.length === 0) return 0;
    const totalHours = attendanceData.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    return totalHours / attendanceData.length;
  }

  calculateAverageRating(performanceData) {
    if (performanceData.length === 0) return 3.0;
    const totalRating = performanceData.reduce((sum, p) => sum + p.overallRating, 0);
    return totalRating / performanceData.length;
  }

  calculatePerformanceTrend(performanceData) {
    if (performanceData.length < 2) return 'stable';
    const recent = performanceData[0].overallRating;
    const previous = performanceData[1].overallRating;
    return recent > previous ? 'improving' : recent < previous ? 'declining' : 'stable';
  }

  detectLatePattern(attendanceData) {
    const lateCount = attendanceData.filter(a => a.status === 'late').length;
    const totalDays = attendanceData.length;
    const latePercentage = totalDays > 0 ? (lateCount / totalDays) * 100 : 0;

    return {
      isAnomaly: latePercentage > 20,
      data: { lateCount, totalDays, latePercentage },
      severity: latePercentage > 40 ? 'high' : 'medium',
      description: `Employee has been late ${latePercentage.toFixed(1)}% of the time`,
      recommendations: ['Schedule discussion about punctuality', 'Review work schedule flexibility']
    };
  }

  detectIrregularHours(attendanceData) {
    const hours = attendanceData.map(a => parseFloat(a.totalHours) || 0).filter(h => h > 0);

    // Need at least 3 records to calculate meaningful variance
    if (hours.length < 3) {
      return {
        isAnomaly: false,
        data: { avgHours: 0, stdDev: 0, variance: 0 },
        severity: 'low',
        description: 'Insufficient data for irregular hours analysis',
        recommendations: []
      };
    }

    const avgHours = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const variance = hours.reduce((sum, h) => sum + Math.pow(h - avgHours, 2), 0) / hours.length;
    const stdDev = Math.sqrt(variance);

    return {
      isAnomaly: stdDev > 2,
      data: { avgHours, stdDev, variance },
      severity: stdDev > 3 ? 'high' : 'medium',
      description: `Irregular working hours detected (std dev: ${stdDev.toFixed(2)})`,
      recommendations: ['Review workload distribution', 'Discuss work-life balance']
    };
  }

  detectAbsencePattern(attendanceData) {
    const absentCount = attendanceData.filter(a => a.status === 'absent').length;
    const totalDays = attendanceData.length;
    const absentPercentage = totalDays > 0 ? (absentCount / totalDays) * 100 : 0;

    return {
      isAnomaly: absentPercentage > 10,
      data: { absentCount, totalDays, absentPercentage },
      severity: absentPercentage > 20 ? 'high' : 'medium',
      description: `High absence rate detected: ${absentPercentage.toFixed(1)}%`,
      recommendations: ['Investigate absence reasons', 'Provide support if needed']
    };
  }
}

module.exports = AIService;
