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
      SELECT SUM(total_days - used_days) as balance FROM leave_balances
      WHERE employee_id = ? AND year = YEAR(CURDATE())
    `, [employeeId]);

    return {
      thisMonthAttendance: thisMonthAttendance[0].count,
      leaveBalance: leaveBalance[0].balance || 0
    };
  }

  // ==========================================
  // MISSING HELPER METHODS
  // ==========================================
  static async getAdminLeaveReport(year, departmentId, employeeId) {
    const { executeQuery } = require('../config/database');

    const query = `
      SELECT
        e.id,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        d.name as department_name,
        lt.name as leave_type,
        COUNT(la.id) as total_applications,
        SUM(CASE WHEN la.status = 'approved' THEN la.total_days ELSE 0 END) as approved_days,
        SUM(CASE WHEN la.status = 'pending' THEN la.total_days ELSE 0 END) as pending_days,
        SUM(CASE WHEN la.status = 'rejected' THEN la.total_days ELSE 0 END) as rejected_days
      FROM employees e
      LEFT JOIN leave_applications la ON e.id = la.employee_id AND YEAR(la.start_date) = ?
      LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
        ${departmentId ? 'AND e.department_id = ?' : ''}
        ${employeeId ? 'AND e.id = ?' : ''}
      GROUP BY e.id, lt.id
      ORDER BY e.first_name, e.last_name, lt.name
    `;

    const params = [year];
    if (departmentId) params.push(departmentId);
    if (employeeId) params.push(employeeId);

    return await executeQuery(query, params);
  }

  static async getManagerLeaveReport(managerId, year, employeeId) {
    const { executeQuery } = require('../config/database');

    const query = `
      SELECT
        e.id,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        lt.name as leave_type,
        COUNT(la.id) as total_applications,
        SUM(CASE WHEN la.status = 'approved' THEN la.total_days ELSE 0 END) as approved_days,
        SUM(CASE WHEN la.status = 'pending' THEN la.total_days ELSE 0 END) as pending_days,
        SUM(CASE WHEN la.status = 'rejected' THEN la.total_days ELSE 0 END) as rejected_days
      FROM employees e
      LEFT JOIN leave_applications la ON e.id = la.employee_id AND YEAR(la.start_date) = ?
      LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE e.manager_id = ? AND e.status = 'active'
        ${employeeId ? 'AND e.id = ?' : ''}
      GROUP BY e.id, lt.id
      ORDER BY e.first_name, e.last_name, lt.name
    `;

    const params = [year, managerId];
    if (employeeId) params.push(employeeId);

    return await executeQuery(query, params);
  }

  static async getEmployeeLeaveReport(employeeId, year) {
    const { executeQuery } = require('../config/database');

    const query = `
      SELECT
        la.id,
        lt.name as leave_type,
        la.start_date,
        la.end_date,
        la.total_days,
        la.reason,
        la.status,
        la.applied_date,
        la.approved_date
      FROM leave_applications la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.employee_id = ? AND YEAR(la.start_date) = ?
      ORDER BY la.start_date DESC
    `;

    return await executeQuery(query, [employeeId, year]);
  }

  static async getPayrollReportData(month, year, departmentId) {
    const { executeQuery } = require('../config/database');

    const query = `
      SELECT
        p.*,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.employee_code,
        d.name as department_name
      FROM payroll_records p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.month = ? AND p.year = ?
        ${departmentId ? 'AND e.department_id = ?' : ''}
      ORDER BY d.name, e.first_name, e.last_name
    `;

    const params = [month, year];
    if (departmentId) params.push(departmentId);

    return await executeQuery(query, params);
  }

  static async getAdminPerformanceReport(year, departmentId, employeeId) {
    const { executeQuery } = require('../config/database');

    const query = `
      SELECT
        e.id,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        d.name as department_name,
        COUNT(pr.id) as total_reviews,
        AVG(pr.overall_rating) as avg_rating,
        COUNT(pg.id) as total_goals,
        AVG(pg.achievement_percentage) as avg_goal_completion
      FROM employees e
      LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
        AND YEAR(pr.created_at) = ?
      LEFT JOIN performance_goals pg ON e.id = pg.employee_id
        AND YEAR(pg.created_at) = ?
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
        ${departmentId ? 'AND e.department_id = ?' : ''}
        ${employeeId ? 'AND e.id = ?' : ''}
      GROUP BY e.id
      ORDER BY e.first_name, e.last_name
    `;

    const params = [year, year];
    if (departmentId) params.push(departmentId);
    if (employeeId) params.push(employeeId);

    return await executeQuery(query, params);
  }

  static async getManagerPerformanceReport(managerId, year, employeeId) {
    const { executeQuery } = require('../config/database');

    const query = `
      SELECT
        e.id,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        COUNT(pr.id) as total_reviews,
        AVG(pr.overall_rating) as avg_rating,
        COUNT(pg.id) as total_goals,
        AVG(pg.achievement_percentage) as avg_goal_completion
      FROM employees e
      LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
        AND YEAR(pr.created_at) = ?
      LEFT JOIN performance_goals pg ON e.id = pg.employee_id
        AND YEAR(pg.created_at) = ?
      WHERE e.manager_id = ? AND e.status = 'active'
        ${employeeId ? 'AND e.id = ?' : ''}
      GROUP BY e.id
      ORDER BY e.first_name, e.last_name
    `;

    const params = [year, year, managerId];
    if (employeeId) params.push(employeeId);

    return await executeQuery(query, params);
  }

  static async getEmployeePerformanceReport(employeeId, year) {
    const { executeQuery } = require('../config/database');

    const reviewsQuery = `
      SELECT
        pr.id,
        pr.review_period,
        pr.overall_rating,
        pr.comments,
        pr.status,
        pr.created_at,
        CONCAT(r.first_name, ' ', r.last_name) as reviewer_name
      FROM performance_reviews pr
      LEFT JOIN users u ON pr.reviewer_id = u.id
      LEFT JOIN employees r ON u.id = r.user_id
      WHERE pr.employee_id = ? AND YEAR(pr.created_at) = ?
      ORDER BY pr.created_at DESC
    `;

    const goalsQuery = `
      SELECT
        pg.id,
        pg.title,
        pg.description,
        pg.target_date,
        pg.achievement_percentage,
        pg.status,
        pg.created_at
      FROM performance_goals pg
      WHERE pg.employee_id = ? AND YEAR(pg.created_at) = ?
      ORDER BY pg.target_date ASC
    `;

    const reviews = await executeQuery(reviewsQuery, [employeeId, year]);
    const goals = await executeQuery(goalsQuery, [employeeId, year]);

    return {
      reviews,
      goals
    };
  }
}

module.exports = ReportsController;
