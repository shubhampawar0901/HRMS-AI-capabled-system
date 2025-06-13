const { Employee, Attendance, LeaveApplication, Payroll, PerformanceReview } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const AIService = require('../services/AIService');
const moment = require('moment');

class ReportsController {
  // ==========================================
  // ATTENDANCE REPORTS
  // ==========================================
  static async getAttendanceReport(req, res) {
    try {
      const { role, employeeId } = req.user;
      const { 
        startDate = moment().startOf('month').format('YYYY-MM-DD'),
        endDate = moment().endOf('month').format('YYYY-MM-DD'),
        departmentId,
        employeeId: targetEmployeeId
      } = req.query;

      // Check permissions
      if (role === 'employee' && targetEmployeeId && parseInt(targetEmployeeId) !== employeeId) {
        return sendError(res, 'Access denied', 403);
      }

      let attendanceData;
      
      if (role === 'admin') {
        attendanceData = await ReportsController.getAdminAttendanceReport(startDate, endDate, departmentId, targetEmployeeId);
      } else if (role === 'manager') {
        attendanceData = await ReportsController.getManagerAttendanceReport(employeeId, startDate, endDate, targetEmployeeId);
      } else {
        attendanceData = await ReportsController.getEmployeeAttendanceReport(employeeId, startDate, endDate);
      }

      return sendSuccess(res, attendanceData, 'Attendance report generated successfully');
    } catch (error) {
      console.error('Get attendance report error:', error);
      return sendError(res, 'Failed to generate attendance report', 500);
    }
  }

  // ==========================================
  // LEAVE REPORTS
  // ==========================================
  static async getLeaveReport(req, res) {
    try {
      const { role, employeeId } = req.user;
      const { 
        year = moment().year(),
        departmentId,
        employeeId: targetEmployeeId
      } = req.query;

      // Check permissions
      if (role === 'employee' && targetEmployeeId && parseInt(targetEmployeeId) !== employeeId) {
        return sendError(res, 'Access denied', 403);
      }

      let leaveData;
      
      if (role === 'admin') {
        leaveData = await ReportsController.getAdminLeaveReport(year, departmentId, targetEmployeeId);
      } else if (role === 'manager') {
        leaveData = await ReportsController.getManagerLeaveReport(employeeId, year, targetEmployeeId);
      } else {
        leaveData = await ReportsController.getEmployeeLeaveReport(employeeId, year);
      }

      return sendSuccess(res, leaveData, 'Leave report generated successfully');
    } catch (error) {
      console.error('Get leave report error:', error);
      return sendError(res, 'Failed to generate leave report', 500);
    }
  }

  // ==========================================
  // PAYROLL REPORTS
  // ==========================================
  static async getPayrollReport(req, res) {
    try {
      const { role, employeeId } = req.user;
      
      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const { 
        month = moment().month() + 1,
        year = moment().year(),
        departmentId
      } = req.query;

      const payrollData = await ReportsController.getPayrollReportData(month, year, departmentId);

      return sendSuccess(res, payrollData, 'Payroll report generated successfully');
    } catch (error) {
      console.error('Get payroll report error:', error);
      return sendError(res, 'Failed to generate payroll report', 500);
    }
  }

  // ==========================================
  // PERFORMANCE REPORTS
  // ==========================================
  static async getPerformanceReport(req, res) {
    try {
      const { role, employeeId } = req.user;
      const { 
        year = moment().year(),
        departmentId,
        employeeId: targetEmployeeId
      } = req.query;

      // Check permissions
      if (role === 'employee' && targetEmployeeId && parseInt(targetEmployeeId) !== employeeId) {
        return sendError(res, 'Access denied', 403);
      }

      let performanceData;
      
      if (role === 'admin') {
        performanceData = await ReportsController.getAdminPerformanceReport(year, departmentId, targetEmployeeId);
      } else if (role === 'manager') {
        performanceData = await ReportsController.getManagerPerformanceReport(employeeId, year, targetEmployeeId);
      } else {
        performanceData = await ReportsController.getEmployeePerformanceReport(employeeId, year);
      }

      return sendSuccess(res, performanceData, 'Performance report generated successfully');
    } catch (error) {
      console.error('Get performance report error:', error);
      return sendError(res, 'Failed to generate performance report', 500);
    }
  }

  // ==========================================
  // AI SMART REPORTS
  // ==========================================
  static async generateSmartReport(req, res) {
    try {
      const { role } = req.user;
      const { reportType, parameters } = req.body;

      if (role !== 'admin' && role !== 'manager') {
        return sendError(res, 'Access denied', 403);
      }

      const aiService = new AIService();
      const smartReport = await aiService.generateSmartReport(reportType, parameters);

      return sendSuccess(res, smartReport, 'Smart report generated successfully');
    } catch (error) {
      console.error('Generate smart report error:', error);
      return sendError(res, 'Failed to generate smart report', 500);
    }
  }

  // ==========================================
  // DASHBOARD ANALYTICS
  // ==========================================
  static async getDashboardAnalytics(req, res) {
    try {
      const { role, employeeId } = req.user;

      let analytics;
      
      if (role === 'admin') {
        analytics = await ReportsController.getAdminAnalytics();
      } else if (role === 'manager') {
        analytics = await ReportsController.getManagerAnalytics(employeeId);
      } else {
        analytics = await ReportsController.getEmployeeAnalytics(employeeId);
      }

      return sendSuccess(res, analytics, 'Dashboard analytics retrieved successfully');
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      return sendError(res, 'Failed to get dashboard analytics', 500);
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================
  static async getAdminAttendanceReport(startDate, endDate, departmentId, employeeId) {
    const query = `
      SELECT 
        e.id,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        d.name as department_name,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND(AVG(a.total_hours), 2) as avg_hours,
        SUM(a.total_hours) as total_hours
      FROM employees e
      LEFT JOIN attendance_records a ON e.id = a.employee_id 
        AND a.date BETWEEN ? AND ?
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
        ${departmentId ? 'AND e.department_id = ?' : ''}
        ${employeeId ? 'AND e.id = ?' : ''}
      GROUP BY e.id
      ORDER BY e.first_name, e.last_name
    `;

    const params = [startDate, endDate];
    if (departmentId) params.push(departmentId);
    if (employeeId) params.push(employeeId);

    const { executeQuery } = require('../config/database');
    return await executeQuery(query, params);
  }

  static async getManagerAttendanceReport(managerId, startDate, endDate, employeeId) {
    const query = `
      SELECT 
        e.id,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND(AVG(a.total_hours), 2) as avg_hours,
        SUM(a.total_hours) as total_hours
      FROM employees e
      LEFT JOIN attendance_records a ON e.id = a.employee_id 
        AND a.date BETWEEN ? AND ?
      WHERE e.manager_id = ? AND e.status = 'active'
        ${employeeId ? 'AND e.id = ?' : ''}
      GROUP BY e.id
      ORDER BY e.first_name, e.last_name
    `;

    const params = [startDate, endDate, managerId];
    if (employeeId) params.push(employeeId);

    const { executeQuery } = require('../config/database');
    return await executeQuery(query, params);
  }

  static async getEmployeeAttendanceReport(employeeId, startDate, endDate) {
    const query = `
      SELECT 
        a.date,
        a.check_in_time,
        a.check_out_time,
        a.total_hours,
        a.status,
        a.notes
      FROM attendance_records a
      WHERE a.employee_id = ? AND a.date BETWEEN ? AND ?
      ORDER BY a.date DESC
    `;

    const { executeQuery } = require('../config/database');
    return await executeQuery(query, [employeeId, startDate, endDate]);
  }

  static async getAdminAnalytics() {
    const { executeQuery } = require('../config/database');
    
    const totalEmployees = await executeQuery('SELECT COUNT(*) as count FROM employees WHERE status = "active"');
    const totalDepartments = await executeQuery('SELECT COUNT(*) as count FROM departments');
    const todayAttendance = await executeQuery(`
      SELECT COUNT(*) as count FROM attendance_records 
      WHERE date = CURDATE() AND status = 'present'
    `);
    const pendingLeaves = await executeQuery(`
      SELECT COUNT(*) as count FROM leave_applications 
      WHERE status = 'pending'
    `);

    return {
      totalEmployees: totalEmployees[0].count,
      totalDepartments: totalDepartments[0].count,
      todayAttendance: todayAttendance[0].count,
      pendingLeaves: pendingLeaves[0].count
    };
  }

  static async getManagerAnalytics(managerId) {
    const { executeQuery } = require('../config/database');
    
    const teamSize = await executeQuery('SELECT COUNT(*) as count FROM employees WHERE manager_id = ? AND status = "active"', [managerId]);
    const teamAttendanceToday = await executeQuery(`
      SELECT COUNT(*) as count FROM attendance_records a
      JOIN employees e ON a.employee_id = e.id
      WHERE e.manager_id = ? AND a.date = CURDATE() AND a.status = 'present'
    `, [managerId]);
    const pendingLeaves = await executeQuery(`
      SELECT COUNT(*) as count FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      WHERE e.manager_id = ? AND la.status = 'pending'
    `, [managerId]);

    return {
      teamSize: teamSize[0].count,
      teamAttendanceToday: teamAttendanceToday[0].count,
      pendingLeaves: pendingLeaves[0].count
    };
  }

  static async getEmployeeAnalytics(employeeId) {
    const { executeQuery } = require('../config/database');
    
    const thisMonthAttendance = await executeQuery(`
      SELECT COUNT(*) as count FROM attendance_records 
      WHERE employee_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
    `, [employeeId]);
    const leaveBalance = await executeQuery(`
      SELECT SUM(allocated_days - used_days) as balance FROM leave_balances 
      WHERE employee_id = ? AND year = YEAR(CURDATE())
    `, [employeeId]);

    return {
      thisMonthAttendance: thisMonthAttendance[0].count,
      leaveBalance: leaveBalance[0].balance || 0
    };
  }
}

module.exports = ReportsController;
