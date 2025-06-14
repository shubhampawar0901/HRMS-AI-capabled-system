const { GoogleGenerativeAI } = require('@google/generative-ai');
const { 
  Employee, 
  Attendance, 
  LeaveApplication, 
  PerformanceReview,
  Payroll 
} = require('../models');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
    });
  }

  // ==========================================
  // RESUME PARSER
  // ==========================================
  
  async parseResume(file) {
    try {
      const startTime = Date.now();
      
      // Extract text from file (simplified - would use actual PDF/DOC parser)
      const extractedText = await this.extractTextFromFile(file);
      
      // Use Gemini to parse resume data
      const prompt = `
        Parse the following resume text and extract structured information in JSON format:
        
        Resume Text:
        ${extractedText}
        
        Please extract and return ONLY a valid JSON object with these fields:
        {
          "personalInfo": {
            "name": "",
            "email": "",
            "phone": "",
            "address": ""
          },
          "experience": [
            {
              "company": "",
              "position": "",
              "duration": "",
              "description": ""
            }
          ],
          "education": [
            {
              "institution": "",
              "degree": "",
              "year": "",
              "field": ""
            }
          ],
          "skills": [],
          "summary": ""
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      let parsedData;
      try {
        parsedData = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (parseError) {
        // Fallback parsing if JSON is malformed
        parsedData = this.fallbackResumeParser(extractedText);
      }

      const processingTime = Date.now() - startTime;

      return {
        parsedData,
        extractedText,
        confidence: 0.85,
        processingTime
      };
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw new Error('Failed to parse resume');
    }
  }

  async extractTextFromFile(file) {
    // Simplified text extraction - in real implementation would use:
    // - pdf-parse for PDFs
    // - mammoth for Word docs
    // - OCR for images
    return `Sample extracted text from ${file.originalname}`;
  }

  fallbackResumeParser(text) {
    return {
      personalInfo: { name: "Unknown", email: "", phone: "", address: "" },
      experience: [],
      education: [],
      skills: [],
      summary: text.substring(0, 200)
    };
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
      const attendanceData = await Attendance.findByEmployee(employeeId, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const anomalies = [];

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

      return anomalies;
    } catch (error) {
      console.error('Anomaly detection error:', error);
      throw new Error('Failed to detect anomalies');
    }
  }

  // ==========================================
  // CHATBOT
  // ==========================================
  
  async processChatbotQuery(message, userContext) {
    try {
      const startTime = Date.now();

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

      // Process query with context
      const prompt = `
        You are an HR assistant chatbot. Respond to the following query from a ${userContext.role}:
        
        Query: ${message}
        User Role: ${userContext.role}
        
        Provide a helpful, professional response. If the query requires specific data access, 
        explain what information would be needed and how to access it through the proper channels.
        
        Respond in JSON format:
        {
          "message": "your response",
          "intent": "detected intent",
          "confidence": 0.0-1.0,
          "type": "response|access_denied|error"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let chatResponse;
      try {
        chatResponse = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (parseError) {
        chatResponse = {
          message: "I understand your question, but I'm having trouble processing it right now. Please try rephrasing or contact HR directly.",
          intent: 'general_query',
          confidence: 0.5,
          type: 'response'
        };
      }

      chatResponse.responseTime = Date.now() - startTime;
      return chatResponse;
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
