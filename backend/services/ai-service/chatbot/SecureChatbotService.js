const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Employee, User, Attendance, Leave, Performance } = require('../../../shared/models');
const { ChatbotConversation, ChatbotAuditLog } = require('../models');

class SecureChatbotService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }

  async processQuery(userQuery, userContext) {
    const startTime = Date.now();
    
    try {
      // 1. Classify intent and validate security
      const intent = await this.classifyIntent(userQuery);
      const securityCheck = await this.validateQuerySecurity(intent, userContext);
      
      if (!securityCheck.allowed) {
        return this.generateSecurityDenialResponse(securityCheck.reason);
      }

      // 2. Build secure context based on user role
      const secureContext = await this.buildSecureContext(intent, userContext);
      
      // 3. Process with Gemini AI
      const response = await this.processWithGemini(userQuery, secureContext);
      
      // 4. Filter response for security
      const filteredResponse = this.filterResponse(response, userContext);
      
      // 5. Add quick actions if applicable
      const quickActions = this.getQuickActions(intent, userContext.role);
      
      const responseTime = Date.now() - startTime;
      
      return {
        message: filteredResponse,
        intent,
        quickActions,
        responseTime,
        type: 'success'
      };
      
    } catch (error) {
      console.error('Chatbot processing error:', error);
      return {
        message: "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        type: 'error',
        responseTime: Date.now() - startTime
      };
    }
  }

  async classifyIntent(userQuery) {
    const query = userQuery.toLowerCase();
    
    // Intent classification based on keywords
    if (query.includes('leave') || query.includes('vacation') || query.includes('time off')) {
      if (query.includes('balance') || query.includes('remaining')) return 'leave_balance';
      if (query.includes('apply') || query.includes('request')) return 'leave_application';
      if (query.includes('policy') || query.includes('rules')) return 'leave_policy';
      return 'leave_general';
    }
    
    if (query.includes('attendance') || query.includes('check in') || query.includes('check out')) {
      return 'attendance_query';
    }
    
    if (query.includes('salary') || query.includes('payslip') || query.includes('pay')) {
      if (query.includes('other') || query.includes('team') || query.includes('compare')) {
        return 'salary_comparison'; // Restricted for employees
      }
      return 'payroll_query';
    }
    
    if (query.includes('performance') || query.includes('review') || query.includes('goal')) {
      if (query.includes('team') || query.includes('other')) {
        return 'other_employee_performance'; // Restricted for employees
      }
      return 'performance_query';
    }
    
    if (query.includes('policy') || query.includes('handbook') || query.includes('rule')) {
      return 'policy_query';
    }
    
    if (query.includes('team') && query.includes('report')) {
      return 'team_reports'; // Manager/Admin only
    }
    
    return 'general_query';
  }

  async validateQuerySecurity(intent, userContext) {
    const { role } = userContext;
    
    // Define restricted intents per role
    const restrictedIntents = {
      employee: [
        'salary_comparison', 'other_employee_salary', 'company_financials',
        'other_employee_performance', 'hiring_decisions', 'termination_info',
        'team_reports', 'admin_functions'
      ],
      manager: [
        'company_financials', 'other_team_salaries', 'hr_decisions',
        'employee_personal_issues', 'confidential_hr_matters', 'admin_functions'
      ]
    };

    if (restrictedIntents[role]?.includes(intent)) {
      return {
        allowed: false,
        reason: `Access denied: ${role} role cannot access ${intent} information`
      };
    }

    return { allowed: true };
  }

  async buildSecureContext(intent, userContext) {
    const { userId, role, employeeId } = userContext;
    const context = { userRole: role };

    try {
      // Get employee data based on role permissions
      if (intent.includes('employee') || intent.includes('personal')) {
        context.employeeData = await this.getEmployeeData(userId, role, employeeId);
      }

      // Get team data for managers and admins
      if ((role === 'manager' || role === 'admin') && intent.includes('team')) {
        context.teamData = await this.getTeamData(userId, role);
      }

      // Get attendance data if needed
      if (intent.includes('attendance')) {
        context.attendanceData = await this.getAttendanceData(userId, role, employeeId);
      }

      // Get leave data if needed
      if (intent.includes('leave')) {
        context.leaveData = await this.getLeaveData(userId, role, employeeId);
      }

      // Get performance data if needed
      if (intent.includes('performance')) {
        context.performanceData = await this.getPerformanceData(userId, role, employeeId);
      }

      // Get relevant policies
      context.allowedPolicies = await this.getPolicyDocuments(role, intent);

      return context;
    } catch (error) {
      console.error('Error building secure context:', error);
      throw new Error('Failed to build secure context');
    }
  }

  async getEmployeeData(userId, userRole, employeeId) {
    const attributes = this.getPermittedAttributes(userRole);
    
    if (userRole === 'admin') {
      // Admin can access any employee data
      return await Employee.findOne({
        where: { id: employeeId },
        attributes
      });
    } else if (userRole === 'manager') {
      // Manager can access direct reports
      return await Employee.findOne({
        where: { id: employeeId, managerId: userId },
        attributes
      });
    } else {
      // Employee can only access own data
      return await Employee.findOne({
        where: { id: employeeId, userId: userId },
        attributes
      });
    }
  }

  getPermittedAttributes(userRole) {
    const attributeMap = {
      admin: ['id', 'firstName', 'lastName', 'email', 'department', 'position', 'salary', 'hireDate'],
      manager: ['id', 'firstName', 'lastName', 'email', 'department', 'position', 'hireDate'],
      employee: ['id', 'firstName', 'lastName', 'department', 'position', 'hireDate']
    };

    return attributeMap[userRole] || attributeMap.employee;
  }

  async getTeamData(userId, userRole) {
    if (userRole === 'admin') {
      // Admin can see all employees
      return await Employee.findAll({
        attributes: this.getPermittedAttributes(userRole),
        limit: 50 // Limit for performance
      });
    } else if (userRole === 'manager') {
      // Manager can see direct reports
      return await Employee.findAll({
        where: { managerId: userId },
        attributes: this.getPermittedAttributes(userRole)
      });
    }
    
    return [];
  }

  async getAttendanceData(userId, userRole, employeeId) {
    const whereClause = userRole === 'admin' ? {} : 
                       userRole === 'manager' ? { '$Employee.managerId$': userId } :
                       { employeeId: employeeId };

    return await Attendance.findAll({
      where: whereClause,
      include: [{ model: Employee, attributes: ['firstName', 'lastName'] }],
      order: [['date', 'DESC']],
      limit: 30
    });
  }

  async getLeaveData(userId, userRole, employeeId) {
    const whereClause = userRole === 'admin' ? {} :
                       userRole === 'manager' ? { '$Employee.managerId$': userId } :
                       { employeeId: employeeId };

    return await Leave.findAll({
      where: whereClause,
      include: [{ model: Employee, attributes: ['firstName', 'lastName'] }],
      order: [['startDate', 'DESC']],
      limit: 20
    });
  }

  async getPerformanceData(userId, userRole, employeeId) {
    const whereClause = userRole === 'admin' ? {} :
                       userRole === 'manager' ? { '$Employee.managerId$': userId } :
                       { employeeId: employeeId };

    return await Performance.findAll({
      where: whereClause,
      include: [{ model: Employee, attributes: ['firstName', 'lastName'] }],
      order: [['reviewDate', 'DESC']],
      limit: 10
    });
  }

  async getPolicyDocuments(role, intent) {
    // This would typically fetch from a policy database or vector store
    const policies = {
      leave_policy: "Annual leave policy: Employees are entitled to 30 days of annual leave per year...",
      attendance_policy: "Attendance policy: Standard working hours are 9 AM to 6 PM...",
      performance_policy: "Performance review policy: Reviews are conducted annually...",
      general_policies: "Company handbook: Our company values include integrity, innovation..."
    };

    // Return relevant policies based on intent
    const relevantPolicies = [];
    if (intent.includes('leave')) relevantPolicies.push(policies.leave_policy);
    if (intent.includes('attendance')) relevantPolicies.push(policies.attendance_policy);
    if (intent.includes('performance')) relevantPolicies.push(policies.performance_policy);
    if (intent.includes('policy') || intent.includes('general')) {
      relevantPolicies.push(policies.general_policies);
    }

    return relevantPolicies;
  }

  async processWithGemini(userQuery, secureContext) {
    const { userRole, employeeData, teamData, attendanceData, leaveData, performanceData, allowedPolicies } = secureContext;

    // Build role-specific system prompt
    const systemPrompt = this.buildRoleSpecificPrompt(userRole);
    const contextPrompt = this.buildContextPrompt(secureContext);

    const fullPrompt = `
    ${systemPrompt}

    Context Information:
    ${contextPrompt}

    User Query: "${userQuery}"

    Important Security Rules:
    - Only use information provided in the context above
    - Do not make assumptions about data not provided
    - If asked about restricted information, politely decline
    - Keep responses professional and helpful
    - Focus on information relevant to the user's role
    - Do not mention specific salary amounts unless user is admin
    - Do not reveal personal information of other employees

    Provide a helpful, accurate response based on the context and security rules:`;

    try {
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response.text();
      return response;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('AI processing failed');
    }
  }

  buildRoleSpecificPrompt(userRole) {
    const prompts = {
      admin: `You are an AI assistant for HR administrators. You have access to comprehensive employee data and can help with:
      - Employee management queries
      - Company-wide analytics and reports
      - Policy clarifications and updates
      - Payroll and benefits information
      - Performance management across all employees
      - Compliance and regulatory reporting
      - Strategic HR insights and recommendations`,

      manager: `You are an AI assistant for team managers. You can help with:
      - Team member information (basic details only, no salary data)
      - Team attendance and leave management
      - Performance reviews and goal setting for direct reports
      - Team reports and analytics
      - Management policies and procedures
      - Team development and training recommendations
      Note: You cannot access salary information or personal details of employees.`,

      employee: `You are an AI assistant for employees. You can help with:
      - Your personal HR information and records
      - Company policies and procedures
      - Leave and attendance queries for yourself
      - Performance and goal tracking for yourself
      - General HR questions and guidance
      - Benefits and compensation information for yourself
      Note: You can only access your own personal information, not other employees' data.`
    };

    return prompts[userRole] || prompts.employee;
  }

  buildContextPrompt(secureContext) {
    const { userRole, employeeData, teamData, attendanceData, leaveData, performanceData, allowedPolicies } = secureContext;
    let contextPrompt = '';

    if (employeeData) {
      contextPrompt += `Employee Information:\n${JSON.stringify(employeeData, null, 2)}\n\n`;
    }

    if (teamData && teamData.length > 0 && userRole !== 'employee') {
      contextPrompt += `Team Information:\n${JSON.stringify(teamData, null, 2)}\n\n`;
    }

    if (attendanceData && attendanceData.length > 0) {
      contextPrompt += `Attendance Data:\n${JSON.stringify(attendanceData, null, 2)}\n\n`;
    }

    if (leaveData && leaveData.length > 0) {
      contextPrompt += `Leave Data:\n${JSON.stringify(leaveData, null, 2)}\n\n`;
    }

    if (performanceData && performanceData.length > 0) {
      contextPrompt += `Performance Data:\n${JSON.stringify(performanceData, null, 2)}\n\n`;
    }

    if (allowedPolicies && allowedPolicies.length > 0) {
      contextPrompt += `Relevant Policies:\n${allowedPolicies.join('\n\n')}\n\n`;
    }

    return contextPrompt;
  }

  filterResponse(response, userContext) {
    const { role } = userContext;

    // Define sensitive patterns to filter based on role
    const sensitivePatterns = {
      employee: [
        /salary.*\$[\d,]+/gi,
        /other.*employee.*performance/gi,
        /confidential.*hr/gi,
        /termination.*process/gi,
        /hiring.*decision/gi,
        /company.*revenue/gi
      ],
      manager: [
        /company.*revenue/gi,
        /executive.*compensation/gi,
        /layoff.*plans/gi,
        /confidential.*hr.*matters/gi
      ]
    };

    let filteredResponse = response;

    // Apply role-specific filters
    if (sensitivePatterns[role]) {
      sensitivePatterns[role].forEach(pattern => {
        filteredResponse = filteredResponse.replace(pattern, '[RESTRICTED INFORMATION]');
      });
    }

    return filteredResponse;
  }

  generateSecurityDenialResponse(reason) {
    const denialMessages = [
      "I'm sorry, but I don't have access to that information based on your current permissions.",
      "This information is restricted. Please contact your HR department for assistance.",
      "I can't provide that information due to privacy and security policies.",
      "Access to this data is limited to authorized personnel only.",
      "I'm not authorized to share that information. Please check with your manager or HR."
    ];

    return {
      message: denialMessages[Math.floor(Math.random() * denialMessages.length)],
      type: 'access_denied',
      suggestion: "Try asking about information related to your role and responsibilities.",
      quickActions: [
        { text: "Contact HR", action: "contact", target: "hr@company.com" },
        { text: "View Policies", action: "navigate", target: "/policies" }
      ]
    };
  }

  getQuickActions(intent, userRole) {
    const actionMap = {
      leave_balance: [
        { text: "Apply for Leave", action: "navigate", target: "/leave/apply" },
        { text: "View Leave History", action: "navigate", target: "/leave/history" }
      ],
      leave_application: [
        { text: "Apply for Leave", action: "navigate", target: "/leave/apply" }
      ],
      payroll_query: [
        { text: "View Latest Payslip", action: "navigate", target: "/payroll/payslip" },
        { text: "Download Payslip", action: "download", target: "/payroll/download" }
      ],
      attendance_query: [
        { text: "Check In/Out", action: "navigate", target: "/attendance/checkin" },
        { text: "View Attendance", action: "navigate", target: "/attendance/history" }
      ],
      performance_query: [
        { text: "View Goals", action: "navigate", target: "/performance/goals" },
        { text: "Performance History", action: "navigate", target: "/performance/history" }
      ]
    };

    // Add role-specific actions
    if (userRole === 'manager' && intent.includes('team')) {
      return [
        { text: "Team Dashboard", action: "navigate", target: "/manager/team" },
        { text: "Approve Requests", action: "navigate", target: "/manager/approvals" }
      ];
    }

    if (userRole === 'admin') {
      return [
        { text: "Admin Dashboard", action: "navigate", target: "/admin/dashboard" },
        { text: "Generate Report", action: "navigate", target: "/admin/reports" }
      ];
    }

    return actionMap[intent] || [];
  }
}

module.exports = SecureChatbotService;
