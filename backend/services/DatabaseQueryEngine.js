// Database-Aware Query Engine for Personal Data Queries
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Employee = require('../models/Employee');
const LeaveBalance = require('../models/LeaveBalance');
const Attendance = require('../models/Attendance');
const PerformanceReview = require('../models/PerformanceReview');

class DatabaseQueryEngine {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.fastModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });
    
    // Complete database schema with relationships
    this.schema = {
      employees: {
        fields: ['id', 'firstName', 'lastName', 'employeeCode', 'email', 'phone', 'hireDate', 'position', 'departmentId', 'managerId', 'salary', 'active'],
        relationships: {
          department: 'departments.id = employees.departmentId',
          manager: 'employees.id = employees.managerId',
          leaveBalances: 'leave_balances.employeeId = employees.id',
          attendance: 'attendance.employeeId = employees.id',
          performanceReviews: 'performance_reviews.employeeId = employees.id'
        },
        sensitiveFields: ['salary', 'phone', 'email']
      },
      leave_balances: {
        fields: ['id', 'employeeId', 'leaveTypeId', 'year', 'allocatedDays', 'usedDays', 'remainingDays', 'active'],
        relationships: {
          employee: 'employees.id = leave_balances.employeeId',
          leaveType: 'leave_types.id = leave_balances.leaveTypeId'
        }
      },
      attendance: {
        fields: ['id', 'employeeId', 'date', 'checkIn', 'checkOut', 'totalHours', 'status', 'createdAt'],
        relationships: {
          employee: 'employees.id = attendance.employeeId'
        }
      },
      performance_reviews: {
        fields: ['id', 'employeeId', 'reviewerId', 'reviewPeriod', 'goals', 'achievements', 'rating', 'feedback', 'reviewDate'],
        relationships: {
          employee: 'employees.id = performance_reviews.employeeId',
          reviewer: 'employees.id = performance_reviews.reviewerId'
        }
      }
    };
  }

  async processPersonalDataQuery(message, userContext, dataRequirement) {
    try {
      // Security check - ensure query is only for the requesting user
      if (!this.isAuthorizedQuery(message, userContext)) {
        return {
          message: "For privacy reasons, I can only provide information about your own records.",
          type: 'security_violation',
          intent: 'unauthorized_access'
        };
      }

      // Determine what data to fetch based on the query
      const queryPlan = await this.generateQueryPlan(message, userContext, dataRequirement);
      
      if (!queryPlan) {
        return {
          message: "I couldn't understand what specific information you're looking for. Could you please be more specific?",
          type: 'clarification_needed'
        };
      }

      // Execute the appropriate data retrieval
      const data = await this.executeDataRetrieval(queryPlan, userContext);
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        return {
          message: "I couldn't find the requested information. Please contact HR if you need assistance.",
          type: 'no_data_found'
        };
      }

      // Generate natural language response using LLM
      const response = await this.generateNaturalResponse(message, data, queryPlan);
      
      return {
        message: response,
        type: 'success',
        data: data,
        queryType: queryPlan.type
      };

    } catch (error) {
      console.error('Database query engine error:', error);
      return {
        message: "I'm having trouble accessing your information. Please try again later or contact HR.",
        type: 'error'
      };
    }
  }

  isAuthorizedQuery(message, userContext) {
    const lowerMessage = message.toLowerCase();
    
    // Check for unauthorized patterns
    const unauthorizedPatterns = [
      /other\s+employee/i,
      /colleague['']?s?\s+/i,
      /team\s+(member|salary|performance)/i,
      /everyone['']?s?\s+/i,
      /all\s+employees/i,
      /(?!my|mine)\w+['']?s\s+(salary|leave|performance|attendance)/i
    ];
    
    return !unauthorizedPatterns.some(pattern => pattern.test(message));
  }

  async generateQueryPlan(message, userContext, dataRequirement) {
    const prompt = `
You are a database query planner for an HR system. Analyze the user's request and create a query plan.

USER MESSAGE: "${message}"
USER EMPLOYEE ID: ${userContext.employeeId}
DATA REQUIREMENT: ${JSON.stringify(dataRequirement)}

DATABASE SCHEMA:
${JSON.stringify(this.schema, null, 2)}

Create a query plan that specifies:
1. What type of data is being requested
2. Which tables/models to query
3. What time period (if relevant)
4. What format the response should be in

QUERY TYPES:
- leave_balance: Current leave balances
- leave_history: Past leave requests
- attendance_summary: Attendance statistics
- attendance_details: Specific attendance records
- profile_info: Basic employee information
- performance_data: Performance reviews and goals
- payroll_info: Salary and payroll details

Return JSON:
{
  "type": "query_type",
  "tables": ["table1", "table2"],
  "timeframe": "current_year/last_month/specific_date",
  "responseFormat": "summary/detailed/list",
  "securityLevel": "basic/sensitive"
}
`;

    try {
      const result = await this.fastModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      return JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Query plan generation error:', error);
      return null;
    }
  }

  async executeDataRetrieval(queryPlan, userContext) {
    const employeeId = userContext.employeeId;
    
    switch (queryPlan.type) {
      case 'leave_balance':
        return await this.getLeaveBalance(employeeId, queryPlan.timeframe);
      
      case 'attendance_summary':
        return await this.getAttendanceSummary(employeeId, queryPlan.timeframe);
      
      case 'attendance_details':
        return await this.getAttendanceDetails(employeeId, queryPlan.timeframe);
      
      case 'profile_info':
        return await this.getProfileInfo(employeeId, queryPlan.securityLevel);
      
      case 'performance_data':
        return await this.getPerformanceData(employeeId, queryPlan.timeframe);
      
      default:
        return null;
    }
  }

  async getLeaveBalance(employeeId, timeframe) {
    try {
      const currentYear = new Date().getFullYear();
      const leaveBalances = await LeaveBalance.findByEmployee(employeeId);
      return leaveBalances.filter(lb => lb.year === currentYear && lb.active === 1);
    } catch (error) {
      console.error('Leave balance retrieval error:', error);
      return null;
    }
  }

  async getAttendanceSummary(employeeId, timeframe) {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const attendance = await Attendance.findByEmployeeAndMonth(employeeId, currentYear, currentMonth);
      
      // Calculate summary statistics
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const absentDays = attendance.filter(a => a.status === 'absent').length;
      const lateDays = attendance.filter(a => a.status === 'late').length;
      
      return {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Attendance summary retrieval error:', error);
      return null;
    }
  }

  async getAttendanceDetails(employeeId, timeframe) {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      return await Attendance.findByEmployeeAndMonth(employeeId, currentYear, currentMonth);
    } catch (error) {
      console.error('Attendance details retrieval error:', error);
      return null;
    }
  }

  async getProfileInfo(employeeId, securityLevel) {
    try {
      const employee = await Employee.findById(employeeId);
      
      if (securityLevel === 'basic') {
        // Return only non-sensitive information
        return {
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeCode: employee.employeeCode,
          position: employee.position,
          departmentName: employee.departmentName,
          hireDate: employee.hireDate
        };
      }
      
      return employee;
    } catch (error) {
      console.error('Profile info retrieval error:', error);
      return null;
    }
  }

  async getPerformanceData(employeeId, timeframe) {
    try {
      return await PerformanceReview.findByEmployee(employeeId);
    } catch (error) {
      console.error('Performance data retrieval error:', error);
      return null;
    }
  }

  async generateNaturalResponse(originalQuery, data, queryPlan) {
    const prompt = `
You are Shubh, a professional HR assistant. Generate a natural, helpful response based on the user's query and the retrieved data.

ORIGINAL QUERY: "${originalQuery}"
QUERY TYPE: ${queryPlan.type}
RETRIEVED DATA: ${JSON.stringify(data, null, 2)}

Generate a conversational, helpful response that:
1. Directly answers the user's question
2. Presents the data in an easy-to-read format
3. Includes relevant context or explanations
4. Offers additional help if appropriate
5. Maintains a professional but friendly tone

Keep the response concise but complete. Use bullet points or formatting for clarity when presenting multiple data points.
`;

    try {
      const result = await this.fastModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Natural response generation error:', error);
      return "I found your information, but I'm having trouble formatting the response. Please contact HR for assistance.";
    }
  }
}

module.exports = DatabaseQueryEngine;
