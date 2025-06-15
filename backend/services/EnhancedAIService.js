// Enhanced AI Service - Gemini 1.5 Flash for Intent Classification and Response Generation
const { GoogleGenerativeAI } = require('@google/generative-ai');
const RAGService = require('./RAGService');
const DatabaseContextService = require('./DatabaseContextService');
const fs = require('fs').promises;
const path = require('path');
const {
  Employee,
  Attendance,
  LeaveApplication,
  PerformanceReview,
  Payroll,
  LeaveBalance,
  AIPolicyDocument
} = require('../models');

class EnhancedAIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Primary model: Gemini 1.5 Flash for all operations
    this.primaryModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });
    
    // Initialize services
    this.ragService = new RAGService();
    this.dbContextService = new DatabaseContextService();
    
    // Response cache for performance
    this.responseCache = new Map();
    this.intentCache = new Map();
    this.contextCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    // Performance metrics
    this.performanceMetrics = {
      totalQueries: 0,
      successfulQueries: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      intentAccuracy: 0,
      errorsByType: {
        timeout: 0,
        security: 0,
        database: 0,
        llm: 0,
        validation: 0
      }
    };
    
    // Intent categories for classification
    this.intentCategories = {
      greeting_simple: {
        description: "Simple greetings without requests",
        examples: ["Hi", "Hello", "Good morning"],
        next_action: "direct_response",
        timeout: 30,
        model: "gemini-1.5-flash"
      },
      greeting_with_request: {
        description: "Greeting combined with a specific request",
        examples: ["Hi, I need help with my leave", "Good morning, can you check my attendance?"],
        next_action: "extract_embedded_request",
        timeout: 30
      },
      policy_query: {
        description: "Questions about HR policies and procedures",
        examples: ["What's the maternity leave policy?", "How do I apply for annual leave?"],
        next_action: "vector_search",
        timeout: 30
      },
      personal_data_attendance: {
        description: "Questions about user's attendance records",
        examples: ["My attendance this month", "How many days was I absent?"],
        next_action: "database_query",
        timeout: 30
      },
      personal_data_leave: {
        description: "Questions about user's leave information",
        examples: ["My leave balance", "Leave history", "Vacation days remaining"],
        next_action: "database_query",
        timeout: 30
      },
      personal_data_performance: {
        description: "Questions about user's performance data",
        examples: ["My performance review", "My goals", "My ratings"],
        next_action: "database_query",
        timeout: 30
      },
      personal_data_payroll: {
        description: "Questions about user's salary/payroll (sensitive)",
        examples: ["My salary", "Payslip details", "PF deductions"],
        next_action: "secure_database_query",
        timeout: 30
      },
      unauthorized_access: {
        description: "Attempts to access other employees' data",
        examples: ["John's salary", "Team attendance", "Other employee's leave"],
        next_action: "security_block",
        timeout: 30
      },
      out_of_scope: {
        description: "Non-HR related questions",
        examples: ["Weather", "Sports", "Math problems"],
        next_action: "polite_redirect",
        timeout: 30
      },
      ambiguous: {
        description: "Unclear or mixed intent queries",
        examples: ["Help me with leave and weather", "Complex mixed requests"],
        next_action: "clarification_request",
        timeout: 30
      }
    };
  }

  // ==========================================
  // MAIN CHATBOT PROCESSING
  // ==========================================

  async processChatbotQuery(message, userContext) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    try {
      console.log(`[${requestId}] Processing query: "${message}" for user ${userContext.employeeId}`);
      
      // Step 1: Input validation and sanitization
      const sanitizedMessage = this.sanitizeInput(message);
      if (!sanitizedMessage) {
        return this.createErrorResponse('Invalid input provided', 'validation_error', startTime);
      }

      // Step 2: Check response cache first
      const cacheKey = this.generateCacheKey(sanitizedMessage, userContext.role);
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        this.performanceMetrics.cacheHitRate++;
        console.log(`[${requestId}] Cache hit for query`);
        return {
          ...cachedResponse,
          responseTime: Date.now() - startTime,
          cached: true,
          requestId
        };
      }

      // Step 3: Generate date context
      const dateContext = this.generateDateContext();
      
      // Step 4: Intent classification with Gemini 2.5 Flash
      const classification = await this.classifyIntentWithGemini(sanitizedMessage, userContext, dateContext);
      console.log(`[${requestId}] Intent classified: ${classification.intent} (confidence: ${classification.confidence})`);

      // Step 5: Route to appropriate handler based on intent
      let response;
      switch (classification.intent) {
        case 'greeting_simple':
          response = await this.handleGreetingSimple(sanitizedMessage, userContext, classification);
          break;
        case 'greeting_with_request':
          response = await this.handleGreetingWithRequest(sanitizedMessage, userContext, classification);
          break;
        case 'policy_query':
          response = await this.handlePolicyQuery(sanitizedMessage, userContext, classification);
          break;
        case 'personal_data_attendance':
        case 'personal_data_leave':
        case 'personal_data_performance':
        case 'personal_data_payroll':
          response = await this.handlePersonalDataQuery(sanitizedMessage, userContext, classification);
          break;
        case 'unauthorized_access':
          response = await this.handleUnauthorizedAccess(sanitizedMessage, userContext, classification);
          break;
        case 'out_of_scope':
          response = await this.handleOutOfScope(sanitizedMessage, userContext, classification);
          break;
        case 'ambiguous':
          response = await this.handleAmbiguousQuery(sanitizedMessage, userContext, classification);
          break;
        default:
          response = await this.handleGeneralQuery(sanitizedMessage, userContext, classification);
      }

      // Step 6: Add metadata and cache response
      response.responseTime = Date.now() - startTime;
      response.intent = classification.intent;
      response.confidence = classification.confidence;
      response.requestId = requestId;
      response.cached = false;

      // Cache non-personal responses
      if (this.shouldCache(classification.intent)) {
        this.setCachedResponse(cacheKey, response);
      }

      // Update metrics
      this.updateMetrics(response, true);
      
      console.log(`[${requestId}] Query processed successfully in ${response.responseTime}ms`);
      return response;

    } catch (error) {
      console.error(`[${requestId}] Error processing query:`, error);
      this.updateMetrics(null, false, error.type || 'unknown');
      
      return this.createErrorResponse(
        "I'm experiencing technical difficulties. Please try again later or contact HR directly.",
        'system_error',
        startTime,
        requestId
      );
    }
  }

  // ==========================================
  // INTENT CLASSIFICATION WITH GEMINI 2.5 FLASH
  // ==========================================

  async classifyIntentWithGemini(message, userContext, dateContext) {
    try {
      // Check intent cache first
      const intentCacheKey = `${message}_${userContext.role}`;
      const cachedIntent = this.intentCache.get(intentCacheKey);
      if (cachedIntent && Date.now() - cachedIntent.timestamp < this.cacheExpiry) {
        return cachedIntent.classification;
      }

      // Build comprehensive prompt for intent classification
      const prompt = this.buildIntentClassificationPrompt(message, userContext, dateContext);
      
      // Call Gemini 2.5 Flash with 30-second timeout
      const result = await Promise.race([
        this.primaryModel.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Intent classification timeout')), 30000)
        )
      ]);

      const response = await result.response;
      const responseText = response.text();
      
      // Parse JSON response
      let classification;
      try {
        const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
        classification = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse intent classification JSON:', parseError);
        classification = this.fallbackIntentClassification(message);
      }

      // Validate classification
      if (!this.isValidClassification(classification)) {
        classification = this.fallbackIntentClassification(message);
      }

      // Cache the classification
      this.intentCache.set(intentCacheKey, {
        classification,
        timestamp: Date.now()
      });

      return classification;

    } catch (error) {
      console.error('Intent classification error:', error);

      // Handle different error types
      if (error.message.includes('timeout')) {
        this.performanceMetrics.errorsByType.timeout++;
      } else if (error.status === 429 || error.message.includes('Too Many Requests')) {
        this.performanceMetrics.errorsByType.llm++;
        console.warn('Rate limit exceeded, using enhanced fallback classification');
      } else {
        this.performanceMetrics.errorsByType.llm++;
      }

      // Fallback to enhanced pattern-based classification
      return this.fallbackIntentClassification(message);
    }
  }

  buildIntentClassificationPrompt(message, userContext, dateContext) {
    return `You are an intelligent HR chatbot intent classifier. Analyze the user's message and classify it precisely.

CURRENT DATE CONTEXT:
${dateContext}

USER CONTEXT:
- Employee ID: ${userContext.employeeId}
- Role: ${userContext.role}
- Name: ${userContext.employeeName}

USER MESSAGE: "${message}"

AVAILABLE INTENT CATEGORIES:
${Object.entries(this.intentCategories).map(([key, value]) => 
  `${key}: ${value.description}\nExamples: ${value.examples.join(', ')}`
).join('\n\n')}

DATABASE SCHEMA AVAILABLE:
- attendance: employeeId, date, status, totalHours, checkInTime, checkOutTime
- leave_balances: employee_id, leave_type_id, allocated_days, used_days, remaining_days
- employees: id, first_name, last_name, department_id, position, hire_date
- performance_reviews: employee_id, reviewer_id, overall_rating, comments
- payroll_records: employee_id, month, year, basic_salary, gross_salary, net_salary

CLASSIFICATION RULES:
1. For personal data queries: Identify which database table(s) are needed
2. For policy queries: Determine if it's about company policies/procedures
3. For security violations: Detect attempts to access other employees' data
4. For time-based queries: Use the current date context provided
5. For greetings: Distinguish between simple greetings and greetings with embedded requests

RESPONSE FORMAT (JSON only):
{
  "intent": "intent_category_name",
  "confidence": 0.95,
  "reasoning": "Brief explanation of classification decision",
  "required_tables": ["table1", "table2"],
  "time_period": "specific_time_reference",
  "security_level": "basic/sensitive",
  "complexity": "simple/complex",
  "embedded_request": "extracted_request_if_greeting_with_request"
}

Analyze the message and return only the JSON classification:`;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  generateDateContext() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Calculate last month
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Calculate week ranges
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(startOfWeek.getDate() - 7);
    const lastWeekEnd = new Date(endOfWeek);
    lastWeekEnd.setDate(endOfWeek.getDate() - 7);

    return `- Today: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current Month: ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${currentYear}-${currentMonth.toString().padStart(2, '0')}-01 to ${currentYear}-${currentMonth.toString().padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()})
- Last Month: ${new Date(lastMonthYear, lastMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01 to ${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-${new Date(lastMonthYear, lastMonth, 0).getDate()})
- Current Year: ${currentYear}
- This Week: ${startOfWeek.toLocaleDateString()} to ${endOfWeek.toLocaleDateString()}
- Last Week: ${lastWeekStart.toLocaleDateString()} to ${lastWeekEnd.toLocaleDateString()}`;
  }

  sanitizeInput(message) {
    if (!message || typeof message !== 'string') return null;
    
    // Remove potentially harmful content
    const sanitized = message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
    
    return sanitized.length > 0 && sanitized.length <= 1000 ? sanitized : null;
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateCacheKey(message, role) {
    const normalizedMessage = message.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
    return `${normalizedMessage}_${role}`;
  }

  getCachedResponse(cacheKey) {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.response;
    }
    return null;
  }

  setCachedResponse(cacheKey, response) {
    this.responseCache.set(cacheKey, {
      response: { ...response, cached: undefined, responseTime: undefined },
      timestamp: Date.now()
    });
  }

  shouldCache(intent) {
    const cacheableIntents = ['policy_query', 'greeting_simple', 'out_of_scope', 'unauthorized_access'];
    return cacheableIntents.includes(intent);
  }

  isValidClassification(classification) {
    return classification && 
           classification.intent && 
           this.intentCategories[classification.intent] &&
           typeof classification.confidence === 'number' &&
           classification.confidence >= 0 && 
           classification.confidence <= 1;
  }

  fallbackIntentClassification(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Enhanced pattern-based fallback with better accuracy

    // Greeting patterns
    if (['hi', 'hello', 'hey', 'good morning', 'good afternoon'].some(pattern => lowerMessage.startsWith(pattern))) {
      if (lowerMessage.length > 20) {
        return { intent: 'greeting_with_request', confidence: 0.8, reasoning: 'Fallback: Greeting with additional content' };
      }
      return { intent: 'greeting_simple', confidence: 0.8, reasoning: 'Fallback: Simple greeting pattern' };
    }

    // Policy queries
    if (lowerMessage.includes('policy') || lowerMessage.includes('procedure') || lowerMessage.includes('maternity') || lowerMessage.includes('leave policy')) {
      return { intent: 'policy_query', confidence: 0.8, reasoning: 'Fallback: Policy-related keywords' };
    }

    // Personal data - Attendance
    if (lowerMessage.includes('absent') || lowerMessage.includes('attendance') || lowerMessage.includes('hours worked') || lowerMessage.includes('late')) {
      return { intent: 'personal_data_attendance', confidence: 0.7, reasoning: 'Fallback: Attendance-related keywords' };
    }

    // Personal data - Leave
    if (lowerMessage.includes('leave balance') || lowerMessage.includes('vacation') || lowerMessage.includes('holiday') || lowerMessage.includes('time off')) {
      return { intent: 'personal_data_leave', confidence: 0.7, reasoning: 'Fallback: Leave-related keywords' };
    }

    // Personal data - Performance
    if (lowerMessage.includes('performance') || lowerMessage.includes('review') || lowerMessage.includes('rating') || lowerMessage.includes('goals')) {
      return { intent: 'personal_data_performance', confidence: 0.7, reasoning: 'Fallback: Performance-related keywords' };
    }

    // Personal data - Payroll
    if (lowerMessage.includes('salary') || lowerMessage.includes('payroll') || lowerMessage.includes('payslip') || lowerMessage.includes('pay')) {
      return { intent: 'personal_data_payroll', confidence: 0.7, reasoning: 'Fallback: Payroll-related keywords' };
    }

    // Unauthorized access patterns
    if (lowerMessage.includes('other employee') || lowerMessage.includes('all employee') || lowerMessage.includes('team salary') || lowerMessage.includes('staff records')) {
      return { intent: 'unauthorized_access', confidence: 0.8, reasoning: 'Fallback: Unauthorized access pattern' };
    }

    // Out of scope patterns
    if (lowerMessage.includes('weather') || lowerMessage.includes('sports') || lowerMessage.includes('joke') || lowerMessage.includes('recipe')) {
      return { intent: 'out_of_scope', confidence: 0.8, reasoning: 'Fallback: Non-HR topic' };
    }

    // Default to ambiguous with lower confidence
    return { intent: 'ambiguous', confidence: 0.5, reasoning: 'Fallback: Unable to classify with confidence' };
  }

  createErrorResponse(message, type, startTime, requestId = null) {
    return {
      message,
      type: 'error',
      intent: type,
      confidence: 0.0,
      responseTime: Date.now() - startTime,
      requestId,
      cached: false
    };
  }

  updateMetrics(response, success, errorType = null) {
    this.performanceMetrics.totalQueries++;
    
    if (success) {
      this.performanceMetrics.successfulQueries++;
      
      // Update average response time
      const currentAvg = this.performanceMetrics.averageResponseTime;
      const totalQueries = this.performanceMetrics.totalQueries;
      this.performanceMetrics.averageResponseTime = 
        (currentAvg * (totalQueries - 1) + response.responseTime) / totalQueries;
    } else if (errorType) {
      this.performanceMetrics.errorsByType[errorType] = 
        (this.performanceMetrics.errorsByType[errorType] || 0) + 1;
    }
  }
  // ==========================================
  // HANDLER METHODS
  // ==========================================

  async handleGreetingSimple(message, userContext, classification) {
    try {
      const prompt = `Generate a warm, professional greeting response for an HR chatbot named Shubh.

USER: "${message}"
EMPLOYEE NAME: ${userContext.employeeName}
ROLE: ${userContext.role}

Generate a personalized greeting that:
1. Acknowledges the greeting warmly
2. Introduces Shubh as the HR assistant
3. Briefly mentions available capabilities
4. Invites the user to ask questions
5. Keeps it concise and professional

Return only the greeting message text (no JSON):`;

      const result = await Promise.race([
        this.primaryModel.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Response generation timeout')), 30000)
        )
      ]);

      const response = await result.response;
      const message_text = response.text().trim();

      return {
        message: message_text,
        type: 'greeting',
        intent: 'greeting_simple'
      };

    } catch (error) {
      console.error('Greeting generation error:', error);
      return {
        message: `Hello ${userContext.employeeName}! I'm Shubh, your HR assistant. I can help you with leave balances, attendance records, company policies, and more. What would you like to know?`,
        type: 'greeting',
        intent: 'greeting_simple'
      };
    }
  }

  async handleGreetingWithRequest(message, userContext, classification) {
    try {
      // Extract the embedded request
      const embeddedRequest = classification.embedded_request ||
        message.replace(/^(hi|hello|hey|good morning|good afternoon|good evening)[,\s]*/i, '').trim();

      // Process the embedded request
      const requestClassification = await this.classifyIntentWithGemini(embeddedRequest, userContext, this.generateDateContext());

      // Generate greeting + response
      const prompt = `Generate a response that combines a greeting with handling a specific request.

GREETING: "${message}"
EMBEDDED REQUEST: "${embeddedRequest}"
REQUEST INTENT: ${requestClassification.intent}
EMPLOYEE NAME: ${userContext.employeeName}

Generate a response that:
1. Acknowledges the greeting warmly
2. Directly addresses their specific request
3. Provides helpful information or next steps
4. Maintains a conversational tone

Return only the response text (no JSON):`;

      const result = await Promise.race([
        this.primaryModel.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Response generation timeout')), 30000)
        )
      ]);

      const response = await result.response;
      const message_text = response.text().trim();

      return {
        message: message_text,
        type: 'greeting_with_request',
        intent: 'greeting_with_request',
        embedded_request: embeddedRequest,
        embedded_intent: requestClassification.intent
      };

    } catch (error) {
      console.error('Greeting with request error:', error);
      return {
        message: `Hello ${userContext.employeeName}! I'd be happy to help you with that. Could you please be more specific about what you need assistance with?`,
        type: 'greeting_with_request',
        intent: 'greeting_with_request'
      };
    }
  }

  async handlePolicyQuery(message, userContext, classification) {
    try {
      // Step 1: Perform vector search for relevant policy documents
      const searchResults = await this.ragService.searchWithAccessControl(
        message,
        userContext.role,
        { topK: 3 }
      );

      if (!searchResults || searchResults.length === 0) {
        return {
          message: "I couldn't find specific policy information for your question. Please contact HR directly for detailed policy guidance.",
          type: 'policy_not_found',
          intent: 'policy_query'
        };
      }

      // Step 2: Combine search results into context
      const policyContext = searchResults.map(result => result.text).join('\n\n');
      const sources = searchResults.map(result => result.filename || result.metadata?.filename || 'Policy Document');

      // Step 3: Generate comprehensive response using Gemini 2.5 Flash
      const prompt = `You are Shubh, a professional HR assistant. Answer the user's policy question using the provided policy context.

USER QUESTION: "${message}"
EMPLOYEE ROLE: ${userContext.role}

POLICY CONTEXT:
${policyContext}

INSTRUCTIONS:
1. Provide a comprehensive answer based on the policy context
2. Structure the response clearly with sections if needed
3. Include specific details like procedures, requirements, timelines
4. Mention any role-specific information if applicable
5. Be helpful and professional
6. If the context doesn't fully answer the question, acknowledge limitations
7. Suggest contacting HR for additional clarification if needed

Generate a detailed, helpful response:`;

      const result = await Promise.race([
        this.primaryModel.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Policy response timeout')), 30000)
        )
      ]);

      const response = await result.response;
      const message_text = response.text().trim();

      return {
        message: message_text,
        type: 'policy_response',
        intent: 'policy_query',
        sources: sources,
        searchResults: searchResults.length
      };

    } catch (error) {
      console.error('Policy query error:', error);
      return {
        message: "I'm having trouble accessing policy information right now. Please contact HR directly for policy-related questions.",
        type: 'policy_error',
        intent: 'policy_query'
      };
    }
  }

  async handlePersonalDataQuery(message, userContext, classification) {
    try {
      // Step 1: Get database context for the specific data type
      const context = await this.dbContextService.getLLMOptimizedContext(
        classification.intent,
        message,
        userContext
      );

      // Step 2: Generate SQL query using Gemini 2.5 Flash
      const sqlPrompt = this.buildSQLGenerationPrompt(message, userContext, context, classification);

      const sqlResult = await Promise.race([
        this.primaryModel.generateContent(sqlPrompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SQL generation timeout')), 30000)
        )
      ]);

      const sqlResponse = await sqlResult.response;
      let sqlQuery = sqlResponse.text().trim();

      // Clean SQL query
      sqlQuery = sqlQuery.replace(/```sql\n?|\n?```/g, '').trim();

      // Step 3: Validate SQL for security
      if (!this.validateSQLSecurity(sqlQuery, userContext.employeeId)) {
        throw new Error('SQL security validation failed');
      }

      // Step 4: Execute query (this would be implemented with actual database connection)
      const queryResults = await this.executeSecureQuery(sqlQuery, userContext.employeeId, classification.intent);

      // Step 5: Format results using Gemini 2.5 Flash
      const formatPrompt = this.buildResponseFormattingPrompt(message, queryResults, userContext);

      const formatResult = await Promise.race([
        this.primaryModel.generateContent(formatPrompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Response formatting timeout')), 30000)
        )
      ]);

      const formatResponse = await formatResult.response;
      const formattedMessage = formatResponse.text().trim();

      return {
        message: formattedMessage,
        type: 'personal_data_response',
        intent: classification.intent,
        dataType: classification.intent.replace('personal_data_', ''),
        recordCount: Array.isArray(queryResults) ? queryResults.length : 1
      };

    } catch (error) {
      console.error('Personal data query error:', error);

      // Try fallback with pre-built query templates
      return await this.handlePersonalDataFallback(message, userContext, classification);
    }
  }

  buildSQLGenerationPrompt(message, userContext, context, classification) {
    const dateContext = this.generateDateContext();

    return `Generate a secure SQL query for the user's request.

USER QUERY: "${message}"
EMPLOYEE ID: ${userContext.employeeId}
DATA TYPE: ${classification.intent}

CURRENT DATE CONTEXT:
${dateContext}

DATABASE CONTEXT:
${context.schemaContext}

SECURITY RULES:
${context.securityRules.map(rule => `- ${rule}`).join('\n')}

EXAMPLE QUERIES:
${context.exampleQueries.slice(0, 2).join('\n\n')}

REQUIREMENTS:
1. Generate ONLY the SQL query (no explanations)
2. ALWAYS include WHERE employee_id = ${userContext.employeeId} or WHERE employeeId = ${userContext.employeeId}
3. Use proper date filtering based on the current date context
4. Use parameterized queries with ? placeholders where needed
5. Include appropriate JOINs if multiple tables are needed
6. Limit results to reasonable numbers (e.g., LIMIT 100)

Generate the SQL query:`;
  }

  buildResponseFormattingPrompt(originalQuery, queryResults, userContext) {
    return `Format the database query results into a natural, conversational response.

ORIGINAL QUERY: "${originalQuery}"
EMPLOYEE NAME: ${userContext.employeeName}

QUERY RESULTS:
${JSON.stringify(queryResults, null, 2)}

INSTRUCTIONS:
1. Create a natural, conversational response
2. Present the data in an easy-to-read format
3. Include specific numbers, dates, and details
4. Use bullet points or formatting for clarity when appropriate
5. Be helpful and offer additional assistance if relevant
6. If no data found, explain this clearly and suggest alternatives

Generate a helpful, formatted response:`;
  }

  async handlePersonalDataFallback(message, userContext, classification) {
    try {
      // Load fallback query templates
      const templates = await this.loadQueryTemplates();
      const templateKey = this.getTemplateKey(classification.intent);

      if (templates[templateKey]) {
        const template = templates[templateKey];
        const queryResults = await this.executeTemplateQuery(template, userContext.employeeId);

        return {
          message: `Here's your ${classification.intent.replace('personal_data_', '')} information: ${JSON.stringify(queryResults)}`,
          type: 'personal_data_fallback',
          intent: classification.intent,
          fallback: true
        };
      }

      return {
        message: "I'm having trouble accessing your data right now. Please try again later or contact HR for assistance.",
        type: 'data_access_error',
        intent: classification.intent
      };

    } catch (error) {
      console.error('Fallback query error:', error);
      return {
        message: "I'm unable to retrieve your information at the moment. Please contact HR directly for assistance.",
        type: 'fallback_error',
        intent: classification.intent
      };
    }
  }

  async handleUnauthorizedAccess(message, userContext, classification) {
    // Log security attempt
    console.warn(`Unauthorized access attempt by user ${userContext.employeeId}: "${message}"`);

    return {
      message: "For privacy and security reasons, I can only provide information about your own employment records. I cannot share details about other employees. Would you like to ask about your own HR information instead?",
      type: 'security_violation',
      intent: 'unauthorized_access',
      securityLevel: 'high'
    };
  }

  async handleOutOfScope(message, userContext, classification) {
    return {
      message: "I'm here to help with HR-related questions and your employment information. I can assist you with:\n\n• Leave balance and policies\n• Attendance records\n• Performance reviews\n• Company policies\n• Payroll information\n\nWhat HR topic can I help you with today?",
      type: 'out_of_scope_redirect',
      intent: 'out_of_scope'
    };
  }

  async handleAmbiguousQuery(message, userContext, classification) {
    return {
      message: "I need a bit more clarity to help you effectively. Could you please be more specific? For example:\n\n• 'What's my leave balance?'\n• 'Show me my attendance for this month'\n• 'What's the maternity leave policy?'\n\nWhat specific information are you looking for?",
      type: 'clarification_needed',
      intent: 'ambiguous'
    };
  }

  async handleGeneralQuery(message, userContext, classification) {
    try {
      const prompt = `You are Shubh, an HR assistant. The user has asked a general question that doesn't fit specific categories.

USER QUERY: "${message}"
EMPLOYEE: ${userContext.employeeName}
ROLE: ${userContext.role}

Provide a helpful response that:
1. Acknowledges their question
2. Offers relevant HR assistance
3. Suggests specific ways you can help
4. Maintains a professional, helpful tone

Generate a helpful response:`;

      const result = await Promise.race([
        this.primaryModel.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('General response timeout')), 30000)
        )
      ]);

      const response = await result.response;
      const message_text = response.text().trim();

      return {
        message: message_text,
        type: 'general_response',
        intent: 'general'
      };

    } catch (error) {
      console.error('General query error:', error);
      return {
        message: "I'm here to help with your HR needs. You can ask me about leave balances, attendance, policies, performance reviews, and more. What would you like to know?",
        type: 'general_fallback',
        intent: 'general'
      };
    }
  }

  // ==========================================
  // UTILITY METHODS FOR DATABASE OPERATIONS
  // ==========================================

  validateSQLSecurity(sqlQuery, employeeId) {
    const lowerQuery = sqlQuery.toLowerCase();

    // Check for forbidden operations
    const forbiddenOperations = ['update', 'delete', 'insert', 'drop', 'alter', 'create'];
    if (forbiddenOperations.some(op => lowerQuery.includes(op))) {
      return false;
    }

    // Check for employee ID filter
    const hasEmployeeFilter = lowerQuery.includes(`employee_id = ${employeeId}`) ||
                             lowerQuery.includes(`employeeid = ${employeeId}`) ||
                             lowerQuery.includes('employee_id = ?') ||
                             lowerQuery.includes('employeeid = ?');

    return hasEmployeeFilter;
  }

  async executeSecureQuery(sqlQuery, employeeId, intentType) {
    try {
      // Import database connection
      const { executeQuery } = require('../config/database');

      console.log(`[SQL] Executing query for employee ${employeeId}:`, sqlQuery);

      // Execute the actual database query
      const results = await executeQuery(sqlQuery, [employeeId]);

      console.log(`[SQL] Query returned ${results.length} records`);

      // Log results for debugging
      if (results.length > 0) {
        console.log(`[SQL] Sample result:`, results[0]);
      }

      return results;

    } catch (error) {
      console.error(`[SQL] Query execution error:`, error);

      // Fallback to empty results instead of mock data
      console.log(`[SQL] Returning empty results due to error`);
      return [];
    }
  }

  async loadQueryTemplates() {
    try {
      const templatesPath = path.join(__dirname, '../utils/query-templates.json');
      const templatesContent = await fs.readFile(templatesPath, 'utf8');
      return JSON.parse(templatesContent);
    } catch (error) {
      console.error('Error loading query templates:', error);
      return {};
    }
  }

  getTemplateKey(intent) {
    const mapping = {
      'personal_data_attendance': 'attendance_monthly_summary',
      'personal_data_leave': 'leave_balance_current',
      'personal_data_performance': 'performance_review_latest'
    };
    return mapping[intent] || 'employee_profile_basic';
  }

  async executeTemplateQuery(template, employeeId) {
    // Mock implementation - would use actual database
    return { message: `Template query executed for employee ${employeeId}` };
  }
}

module.exports = EnhancedAIService;
