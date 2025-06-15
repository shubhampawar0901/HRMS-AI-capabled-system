const { AISmartReport, Employee } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const AIService = require('../services/AIService');

class SmartReportsController {
  
  // ==========================================
  // GENERATE SMART REPORT
  // ==========================================
  static async generateSmartReport(req, res) {
    try {
      const { role, userId, employeeId } = req.user;
      const { reportType, targetId, dateRange, reportName } = req.body;

      // Check permissions
      if (role !== 'admin' && role !== 'manager') {
        return sendError(res, 'Access denied. Only admin and manager roles can generate smart reports.', 403);
      }

      // Validate report type
      if (!['employee', 'team'].includes(reportType)) {
        return sendError(res, 'Invalid report type. Must be "employee" or "team".', 400);
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

      // Set status to generating
      const pendingReport = await AISmartReport.create({
        reportType,
        targetId,
        reportName: reportName || `${reportType} Report - ${new Date().toLocaleDateString()}`,
        aiSummary: 'Generating report...',
        insights: [],
        recommendations: [],
        dataSnapshot: {},
        generatedBy: userId,
        status: 'generating'
      });

      // Generate report asynchronously
      SmartReportsController.generateReportAsync(pendingReport.id, reportType, {
        targetId,
        dateRange,
        reportName,
        userId
      });

      return sendCreated(res, pendingReport, 'Smart report generation started');
    } catch (error) {
      console.error('Generate smart report error:', error);
      return sendError(res, 'Failed to generate smart report', 500);
    }
  }

  // ==========================================
  // SYNCHRONOUS REPORT GENERATION
  // ==========================================
  static async generateSmartReportSync(req, res) {
    try {
      const { reportType, targetId, reportName, dateRange } = req.body;
      const { role, userId, employeeId } = req.user;

      // Validate required fields
      if (!reportType || !targetId) {
        return sendError(res, 'Report type and target ID are required', 400);
      }

      // Check permissions
      if (role !== 'admin' && role !== 'manager') {
        return sendError(res, 'Access denied', 403);
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

      // Generate report synchronously
      const aiService = new AIService();
      const reportData = await aiService.generateSmartReport(reportType, {
        targetId,
        dateRange,
        reportName,
        userId
      });

      // Create completed report in database
      const completedReport = await AISmartReport.create({
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

      return sendCreated(res, completedReport, 'Smart report generated successfully');
    } catch (error) {
      console.error('Generate smart report sync error:', error);
      return sendError(res, 'Failed to generate smart report', 500);
    }
  }

  // ==========================================
  // ASYNC REPORT GENERATION
  // ==========================================
  static async generateReportAsync(reportId, reportType, parameters) {
    try {
      const aiService = new AIService();
      
      // Generate the report
      const reportData = await aiService.generateSmartReport(reportType, parameters);
      
      // Update the report with generated data
      await AISmartReport.update(reportId, {
        aiSummary: reportData.aiSummary,
        insights: reportData.insights,
        recommendations: reportData.recommendations,
        dataSnapshot: reportData.dataSnapshot,
        status: 'completed'
      });
      
      console.log(`Smart report ${reportId} generated successfully`);
    } catch (error) {
      console.error(`Failed to generate smart report ${reportId}:`, error);
      
      // Update report status to failed
      await AISmartReport.update(reportId, {
        status: 'failed',
        aiSummary: 'Failed to generate report. Please try again.'
      });
    }
  }

  // ==========================================
  // GET SMART REPORTS LIST
  // ==========================================
  static async getSmartReports(req, res) {
    try {
      const { role, employeeId } = req.user;
      const { page = 1, limit = 20, reportType, status } = req.query;

      let options = {
        page: parseInt(page),
        limit: parseInt(limit),
        reportType,
        status
      };

      // Role-based filtering
      if (role === 'manager') {
        // Managers can only see reports they generated or reports for their team
        options.generatedBy = req.user.userId;
      } else if (role === 'employee') {
        // Employees can only see reports about themselves
        options.reportType = 'employee';
        options.targetId = employeeId;
      }
      // Admin can see all reports (no additional filtering)

      const reports = await AISmartReport.findAll(options);
      const total = await AISmartReport.count(options);

      const responseData = {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

      return sendSuccess(res, responseData, 'Smart reports retrieved successfully');
    } catch (error) {
      console.error('Get smart reports error:', error);
      return sendError(res, 'Failed to retrieve smart reports', 500);
    }
  }

  // ==========================================
  // GET SMART REPORT BY ID
  // ==========================================
  static async getSmartReportById(req, res) {
    try {
      const { id } = req.params;
      const { role, userId, employeeId } = req.user;

      const report = await AISmartReport.findById(id);
      if (!report) {
        return sendError(res, 'Smart report not found', 404);
      }

      // Check permissions
      if (role === 'employee') {
        // Employees can only view reports about themselves
        if (report.reportType !== 'employee' || report.targetId !== employeeId) {
          return sendError(res, 'Access denied', 403);
        }
      } else if (role === 'manager') {
        // Managers can only view reports they generated
        if (report.generatedBy !== userId) {
          return sendError(res, 'Access denied', 403);
        }
      }
      // Admin can view all reports

      return sendSuccess(res, report, 'Smart report retrieved successfully');
    } catch (error) {
      console.error('Get smart report by ID error:', error);
      return sendError(res, 'Failed to retrieve smart report', 500);
    }
  }

  // ==========================================
  // DELETE SMART REPORT
  // ==========================================
  static async deleteSmartReport(req, res) {
    try {
      const { id } = req.params;
      const { role, userId } = req.user;

      const report = await AISmartReport.findById(id);
      if (!report) {
        return sendError(res, 'Smart report not found', 404);
      }

      // Check permissions - only admin or the person who generated it can delete
      if (role !== 'admin' && report.generatedBy !== userId) {
        return sendError(res, 'Access denied', 403);
      }

      await AISmartReport.delete(id);

      return sendSuccess(res, null, 'Smart report deleted successfully');
    } catch (error) {
      console.error('Delete smart report error:', error);
      return sendError(res, 'Failed to delete smart report', 500);
    }
  }

  // ==========================================
  // GET REPORT STATUS
  // ==========================================
  static async getReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { role, userId, employeeId } = req.user;

      const report = await AISmartReport.findById(id);
      if (!report) {
        return sendError(res, 'Smart report not found', 404);
      }

      // Check permissions (same as getSmartReportById)
      if (role === 'employee') {
        if (report.reportType !== 'employee' || report.targetId !== employeeId) {
          return sendError(res, 'Access denied', 403);
        }
      } else if (role === 'manager') {
        if (report.generatedBy !== userId) {
          return sendError(res, 'Access denied', 403);
        }
      }

      const statusData = {
        id: report.id,
        status: report.status,
        reportName: report.reportName,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      };

      return sendSuccess(res, statusData, 'Report status retrieved successfully');
    } catch (error) {
      console.error('Get report status error:', error);
      return sendError(res, 'Failed to retrieve report status', 500);
    }
  }
}

module.exports = SmartReportsController;
