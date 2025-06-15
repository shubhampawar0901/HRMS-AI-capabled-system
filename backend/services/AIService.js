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

    // Advanced model for complex analysis (Gemini 2.0 Flash Exp)
    this.advancedModel = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
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

      // Check if file exists
      const fileBuffer = await fs.readFile(file.path);

      // Extract text based on file type
      if (file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(fileBuffer);
        console.log('PDF text extracted, length:', pdfData.text.length);
        return pdfData.text;
      } else if (file.mimetype === 'application/msword' ||
                 file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For Word documents, we'll use a simple fallback for now
        // In production, you'd use mammoth.js or similar
        console.log('Word document detected, using fallback text extraction');
        return `Word document content from ${file.originalname}. Please convert to PDF for better text extraction.`;
      } else {
        console.log('Unsupported file type:', file.mimetype);
        return `Unsupported file type: ${file.mimetype}. Please upload a PDF file for best results.`;
      }
    } catch (error) {
      console.error('Text extraction error:', error);
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

      // Detect patterns
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

      console.log(`🎯 Employee ${employeeId}: Detected ${anomalies.length} anomalies`);
      return anomalies;
    } catch (error) {
      console.error(`Anomaly detection error for employee ${employeeId}:`, error);
      return []; // Return empty array instead of throwing to continue with other employees
    }
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
        aiSummary: aiSummary.summary,
        insights: aiSummary.insights,
        recommendations: aiSummary.recommendations,
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

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (parseError) {
        // Fallback to structured response
        return this.fallbackSmartReportSummary(reportType, data);
      }
    } catch (error) {
      console.error('Natural language summary error:', error);
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

  buildSmartReportPrompt(reportType, data) {
    switch(reportType) {
      case 'employee':
        return `
          Generate a comprehensive natural language performance summary for this employee:

          EMPLOYEE INFORMATION:
          - Name: ${data.employee.name}
          - Position: ${data.employee.position}
          - Department: ${data.employee.department}
          - Tenure: ${data.employee.tenure} years

          PERFORMANCE METRICS (${data.dateRange.startDate.toDateString()} to ${data.dateRange.endDate.toDateString()}):
          - Average Rating: ${data.performance.averageRating}/5.0
          - Total Reviews: ${data.performance.totalReviews}
          - Rating Trend: ${data.performance.ratingTrend}

          ATTENDANCE METRICS:
          - Attendance Rate: ${data.attendance.attendanceRate}%
          - Punctuality Rate: ${data.attendance.punctualityRate}%
          - Total Hours: ${data.attendance.totalHours}

          GOALS PERFORMANCE:
          - Goal Completion Rate: ${data.goals.completionRate}%
          - Average Achievement: ${data.goals.averageAchievement}%
          - Active Goals: ${data.goals.activeGoals}

          LEAVE UTILIZATION:
          - Leave Days Used: ${data.leave.approvedDays}
          - Utilization Rate: ${data.leave.utilizationRate}%

          Please generate a professional, narrative summary that includes:
          1. Overall performance assessment (2-3 paragraphs)
          2. Key strengths and achievements
          3. Areas for improvement or concern
          4. Specific recommendations for development
          5. Risk factors (if any)

          Return ONLY a JSON object with this structure:
          {
            "summary": "A comprehensive 3-4 paragraph narrative summary in professional language",
            "insights": [
              "Key insight 1 in natural language",
              "Key insight 2 in natural language",
              "Key insight 3 in natural language"
            ],
            "recommendations": [
              "Specific actionable recommendation 1",
              "Specific actionable recommendation 2",
              "Specific actionable recommendation 3"
            ]
          }

          Make the summary conversational yet professional, as if written by an experienced HR manager.
        `;

      case 'team':
        return `
          Generate a comprehensive team performance summary:

          TEAM INFORMATION:
          - Manager: ${data.manager.name}
          - Department: ${data.manager.department}
          - Team Size: ${data.team.size} employees

          TEAM METRICS (${data.dateRange.startDate.toDateString()} to ${data.dateRange.endDate.toDateString()}):
          - Average Performance Rating: ${data.teamMetrics.averageRating}/5.0
          - Average Goal Achievement: ${data.teamMetrics.averageGoalAchievement}%
          - Average Attendance Rate: ${data.teamMetrics.averageAttendanceRate}%

          TEAM MEMBERS SUMMARY:
          ${data.memberSummaries.map(member =>
            `- ${member.employee.name}: Rating ${member.performance.averageRating}/5.0, Attendance ${member.attendance.attendanceRate}%`
          ).join('\n')}

          Generate a narrative summary focusing on:
          1. Team dynamics and overall performance
          2. Individual standout performances
          3. Areas needing management attention
          4. Team development recommendations
          5. Strategic insights for team growth

          Return the same JSON structure as employee reports but focused on team insights.
        `;

      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  fallbackSmartReportSummary(reportType, data) {
    if (reportType === 'employee') {
      return {
        summary: `${data.employee.name} has shown ${data.performance.ratingTrend} performance with an average rating of ${data.performance.averageRating}/5.0. Their attendance rate of ${data.attendance.attendanceRate}% demonstrates ${data.attendance.attendanceRate > 95 ? 'excellent' : data.attendance.attendanceRate > 85 ? 'good' : 'concerning'} commitment. Goal completion rate of ${data.goals.completionRate}% indicates ${data.goals.completionRate > 80 ? 'strong' : 'developing'} execution capabilities.`,
        insights: [
          `Performance rating trend is ${data.performance.ratingTrend}`,
          `Attendance rate of ${data.attendance.attendanceRate}% is ${data.attendance.attendanceRate > 95 ? 'excellent' : 'acceptable'}`,
          `Goal completion rate of ${data.goals.completionRate}% shows execution capability`
        ],
        recommendations: [
          data.performance.ratingTrend === 'declining' ? 'Schedule performance improvement discussion' : 'Continue current performance trajectory',
          data.attendance.attendanceRate < 90 ? 'Address attendance concerns' : 'Maintain current attendance standards',
          data.goals.completionRate < 80 ? 'Review goal setting and support mechanisms' : 'Consider stretch goals for continued growth'
        ]
      };
    } else {
      return {
        summary: `Team of ${data.team.size} members under ${data.manager.name} shows average performance rating of ${data.teamMetrics.averageRating}/5.0 with ${data.teamMetrics.averageAttendanceRate}% attendance rate.`,
        insights: [
          `Team size: ${data.team.size} members`,
          `Average performance: ${data.teamMetrics.averageRating}/5.0`,
          `Team attendance: ${data.teamMetrics.averageAttendanceRate}%`
        ],
        recommendations: [
          'Regular team performance reviews',
          'Focus on team development',
          'Monitor individual performance trends'
        ]
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
    const hours = attendanceData.map(a => a.totalHours || 0);
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
