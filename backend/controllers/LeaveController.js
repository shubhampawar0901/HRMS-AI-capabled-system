const { LeaveApplication, LeaveBalance, LeaveType, Employee } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const moment = require('moment');

class LeaveController {
  // ==========================================
  // APPLY FOR LEAVE
  // ==========================================
  static async applyLeave(req, res) {
    try {
      const employeeId = req.user.employeeId;
      const { leaveTypeId, startDate, endDate, reason } = req.body;

      // Check if user has an associated employee record
      if (!employeeId) {
        return sendError(res, 'Employee record not found. Please contact administrator.', 400);
      }

      // Calculate total days
      const start = moment(startDate);
      const end = moment(endDate);
      const totalDays = end.diff(start, 'days') + 1;

      // Check if employee has sufficient balance
      const balance = await LeaveBalance.findByEmployeeAndType(employeeId, leaveTypeId, moment().year());
      if (balance && balance.remainingDays < totalDays) {
        return sendError(res, 'Insufficient leave balance', 400);
      }

      // Check for overlapping leave applications
      const overlapping = await LeaveApplication.findOverlapping(employeeId, startDate, endDate);
      if (overlapping.length > 0) {
        return sendError(res, 'Leave dates overlap with existing application', 400);
      }

      // Create leave application
      const leaveApplication = await LeaveApplication.create({
        employeeId,
        leaveTypeId,
        startDate,
        endDate,
        totalDays,
        reason,
        status: 'pending'
      });

      return sendCreated(res, leaveApplication, 'Leave application submitted successfully');
    } catch (error) {
      console.error('Apply leave error:', error);
      return sendError(res, 'Failed to apply for leave', 500);
    }
  }

  // ==========================================
  // GET LEAVE APPLICATIONS
  // ==========================================
  static async getLeaveApplications(req, res) {
    try {
      const employeeId = req.user.employeeId;
      const {
        status,
        page = 1,
        limit = 20,
        leaveType,
        dateRange,
        employeeId: queryEmployeeId
      } = req.query;

      // Check if user has an associated employee record
      if (!employeeId) {
        return sendError(res, 'Employee record not found. Please contact administrator.', 400);
      }

      // Parse and validate pagination parameters
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      const options = {
        employeeId,
        status: status && status !== 'all' ? status : undefined,
        leaveType: leaveType && leaveType !== 'all' ? leaveType : undefined,
        dateRange: dateRange && dateRange !== 'null' ? dateRange : undefined,
        page: pageNum,
        limit: limitNum
      };

      const applications = await LeaveApplication.findByEmployee(employeeId, options);
      const total = await LeaveApplication.countByEmployee(employeeId, options);

      const responseData = {
        applications,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      };

      return sendSuccess(res, responseData, 'Leave applications retrieved');
    } catch (error) {
      console.error('Get leave applications error:', error);
      return sendError(res, 'Failed to get leave applications', 500);
    }
  }

  // ==========================================
  // GET LEAVE BALANCE
  // ==========================================
  static async getLeaveBalance(req, res) {
    try {
      const employeeId = req.user.employeeId;
      const { year = moment().year() } = req.query;

      // Check if user has an associated employee record
      if (!employeeId) {
        return sendError(res, 'Employee record not found. Please contact administrator.', 400);
      }

      let balances = await LeaveBalance.findByEmployee(employeeId, year);

      // If no balances found, initialize them for the employee
      if (!balances || balances.length === 0) {
        balances = await LeaveBalance.initializeForEmployee(employeeId, year);
      }

      return sendSuccess(res, balances, 'Leave balances retrieved');
    } catch (error) {
      console.error('Get leave balance error:', error);
      return sendError(res, 'Failed to get leave balance', 500);
    }
  }

  // ==========================================
  // GET LEAVE TYPES
  // ==========================================
  static async getLeaveTypes(req, res) {
    try {
      const leaveTypes = await LeaveType.findAll({ isActive: true });

      return sendSuccess(res, leaveTypes, 'Leave types retrieved');
    } catch (error) {
      console.error('Get leave types error:', error);
      return sendError(res, 'Failed to get leave types', 500);
    }
  }

  // ==========================================
  // CANCEL LEAVE APPLICATION
  // ==========================================
  static async cancelLeaveApplication(req, res) {
    try {
      const { id } = req.params;
      const employeeId = req.user.employeeId;

      // Check if user has an associated employee record
      if (!employeeId) {
        return sendError(res, 'Employee record not found. Please contact administrator.', 400);
      }

      const application = await LeaveApplication.findById(id);
      if (!application) {
        return sendError(res, 'Leave application not found', 404);
      }

      if (application.employeeId !== employeeId) {
        return sendError(res, 'Access denied', 403);
      }

      if (application.status !== 'pending') {
        return sendError(res, 'Can only cancel pending applications', 400);
      }

      const updatedApplication = await LeaveApplication.update(id, { status: 'cancelled' });

      return sendSuccess(res, updatedApplication, 'Leave application cancelled');
    } catch (error) {
      console.error('Cancel leave application error:', error);
      return sendError(res, 'Failed to cancel leave application', 500);
    }
  }

  // ==========================================
  // MANAGER: GET TEAM LEAVE APPLICATIONS
  // ==========================================
  static async getTeamLeaveApplications(req, res) {
    try {
      const { role, employeeId } = req.user;

      if (role !== 'manager' && role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const {
        status,
        page = 1,
        limit = 20,
        leaveType,
        dateRange,
        employeeId: queryEmployeeId
      } = req.query;

      // Parse and validate pagination parameters
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      const options = {
        status: status && status !== 'all' ? status : undefined,
        leaveType: leaveType && leaveType !== 'all' ? leaveType : undefined,
        dateRange: dateRange && dateRange !== 'null' ? dateRange : undefined,
        page: pageNum,
        limit: limitNum
      };

      let applications;
      let total;

      if (role === 'admin') {
        // Admin can see all applications
        applications = await LeaveApplication.findAll(options);
        total = await LeaveApplication.count(options);
      } else {
        // Manager can see their team's applications
        applications = await LeaveApplication.findByManager(employeeId, options);
        total = await LeaveApplication.countByManager(employeeId, options);
      }

      const responseData = {
        applications,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      };

      return sendSuccess(res, responseData, 'Team leave applications retrieved');
    } catch (error) {
      console.error('Get team leave applications error:', error);
      return sendError(res, 'Failed to get team leave applications', 500);
    }
  }

  // ==========================================
  // MANAGER: APPROVE/REJECT LEAVE
  // ==========================================
  static async processLeaveApplication(req, res) {
    try {
      const { role, userId } = req.user;
      const { id } = req.params;
      const { action, comments } = req.body; // action: 'approve' or 'reject'

      if (role !== 'manager' && role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const application = await LeaveApplication.findById(id);
      if (!application) {
        return sendError(res, 'Leave application not found', 404);
      }

      if (application.status !== 'pending') {
        return sendError(res, 'Application has already been processed', 400);
      }

      // For managers, check if they can approve this employee's leave
      if (role === 'manager') {
        if (!req.user.employeeId) {
          return sendError(res, 'Manager employee record not found. Please contact administrator.', 400);
        }
        const employee = await Employee.findById(application.employeeId);
        if (employee.managerId !== req.user.employeeId) {
          return sendError(res, 'You can only process your team members\' leave applications', 403);
        }
      }

      const status = action === 'approve' ? 'approved' : 'rejected';
      
      const updatedApplication = await LeaveApplication.update(id, {
        status,
        approvedBy: userId,
        approvedAt: new Date(),
        comments
      });

      // If approved, update leave balance
      if (status === 'approved') {
        await LeaveBalance.updateUsedDays(
          application.employeeId,
          application.leaveTypeId,
          moment().year(),
          application.totalDays
        );
      }

      return sendSuccess(res, updatedApplication, `Leave application ${action}d successfully`);
    } catch (error) {
      console.error('Process leave application error:', error);
      return sendError(res, 'Failed to process leave application', 500);
    }
  }

  // ==========================================
  // GET LEAVE CALENDAR
  // ==========================================
  static async getLeaveCalendar(req, res) {
    try {
      const { month = moment().month() + 1, year = moment().year() } = req.query;
      const { role, employeeId } = req.user;

      let leaves;
      if (role === 'admin') {
        leaves = await LeaveApplication.findByMonth(month, year);
      } else if (role === 'manager') {
        if (!employeeId) {
          return sendError(res, 'Manager employee record not found. Please contact administrator.', 400);
        }
        leaves = await LeaveApplication.findTeamByMonth(employeeId, month, year);
      } else {
        if (!employeeId) {
          return sendError(res, 'Employee record not found. Please contact administrator.', 400);
        }
        leaves = await LeaveApplication.findByEmployeeAndMonth(employeeId, month, year);
      }

      return sendSuccess(res, leaves, 'Leave calendar retrieved');
    } catch (error) {
      console.error('Get leave calendar error:', error);
      return sendError(res, 'Failed to get leave calendar', 500);
    }
  }
}

module.exports = LeaveController;
