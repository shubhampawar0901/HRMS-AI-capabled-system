const { Employee } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const SmartReportsDataService = require('../services/SmartReportsDataService');

class DataController {
  
  // ==========================================
  // EMPLOYEE SUMMARY DATA
  // ==========================================
  static async getEmployeeSummary(req, res) {
    try {
      const { id } = req.params;
      const { role, employeeId } = req.user;
      const { startDate, endDate } = req.query;

      // Check permissions
      if (role === 'employee' && parseInt(id) !== employeeId) {
        return sendError(res, 'Access denied. Employees can only view their own data.', 403);
      }

      if (role === 'manager') {
        // Check if this employee reports to the manager
        const employee = await Employee.findById(id);
        if (!employee) {
          return sendError(res, 'Employee not found', 404);
        }
        if (employee.managerId !== employeeId) {
          return sendError(res, 'Access denied. Managers can only view their team members data.', 403);
        }
      }

      // Prepare date range
      const dateRange = {};
      if (startDate) dateRange.startDate = new Date(startDate);
      if (endDate) dateRange.endDate = new Date(endDate);

      // Get employee summary data
      const dataService = new SmartReportsDataService();
      const employeeData = await dataService.getEmployeePerformanceData(parseInt(id), dateRange);

      return sendSuccess(res, employeeData, 'Employee summary data retrieved successfully');
    } catch (error) {
      console.error('Get employee summary error:', error);
      return sendError(res, 'Failed to retrieve employee summary data', 500);
    }
  }

  // ==========================================
  // TEAM SUMMARY DATA
  // ==========================================
  static async getTeamSummary(req, res) {
    try {
      const { managerId } = req.params;
      const { role, employeeId } = req.user;
      const { startDate, endDate } = req.query;

      // Check permissions
      if (role === 'manager' && parseInt(managerId) !== employeeId) {
        return sendError(res, 'Access denied. Managers can only view their own team data.', 403);
      }

      if (role === 'employee') {
        return sendError(res, 'Access denied. Employees cannot view team summary data.', 403);
      }

      // Verify manager exists
      const manager = await Employee.findById(managerId);
      if (!manager) {
        return sendError(res, 'Manager not found', 404);
      }

      // Prepare date range
      const dateRange = {};
      if (startDate) dateRange.startDate = new Date(startDate);
      if (endDate) dateRange.endDate = new Date(endDate);

      // Get team summary data
      const dataService = new SmartReportsDataService();
      const teamData = await dataService.getTeamPerformanceData(parseInt(managerId), dateRange);

      return sendSuccess(res, teamData, 'Team summary data retrieved successfully');
    } catch (error) {
      console.error('Get team summary error:', error);
      return sendError(res, 'Failed to retrieve team summary data', 500);
    }
  }

  // ==========================================
  // DEPARTMENT SUMMARY DATA
  // ==========================================
  static async getDepartmentSummary(req, res) {
    try {
      const { departmentId } = req.params;
      const { role } = req.user;
      const { startDate, endDate } = req.query;

      // Only admin can view department-wide data
      if (role !== 'admin') {
        return sendError(res, 'Access denied. Only admin can view department summary data.', 403);
      }

      // Prepare date range
      const dateRange = {};
      if (startDate) dateRange.startDate = new Date(startDate);
      if (endDate) dateRange.endDate = new Date(endDate);

      // Get all managers in the department
      const { executeQuery } = require('../config/database');
      const managersQuery = `
        SELECT DISTINCT e.id, e.first_name, e.last_name, e.employee_code
        FROM employees e
        WHERE e.department_id = ? AND e.status = 'active'
        AND EXISTS (
          SELECT 1 FROM employees e2 WHERE e2.manager_id = e.id AND e2.status = 'active'
        )
        ORDER BY e.first_name, e.last_name
      `;
      
      const managers = await executeQuery(managersQuery, [departmentId]);
      
      // Get team data for each manager
      const dataService = new SmartReportsDataService();
      const teamsData = await Promise.all(
        managers.map(async (manager) => {
          try {
            return await dataService.getTeamPerformanceData(manager.id, dateRange);
          } catch (error) {
            console.error(`Error getting team data for manager ${manager.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null results and calculate department metrics
      const validTeamsData = teamsData.filter(team => team !== null);
      
      const departmentMetrics = {
        totalTeams: validTeamsData.length,
        totalEmployees: validTeamsData.reduce((sum, team) => sum + team.team.size, 0),
        averagePerformance: validTeamsData.length > 0 
          ? (validTeamsData.reduce((sum, team) => sum + team.teamMetrics.averageRating, 0) / validTeamsData.length).toFixed(2)
          : 0,
        averageAttendance: validTeamsData.length > 0
          ? (validTeamsData.reduce((sum, team) => sum + team.teamMetrics.averageAttendanceRate, 0) / validTeamsData.length).toFixed(2)
          : 0
      };

      const departmentData = {
        departmentId: parseInt(departmentId),
        metrics: departmentMetrics,
        teams: validTeamsData,
        dateRange: { startDate, endDate }
      };

      return sendSuccess(res, departmentData, 'Department summary data retrieved successfully');
    } catch (error) {
      console.error('Get department summary error:', error);
      return sendError(res, 'Failed to retrieve department summary data', 500);
    }
  }

  // ==========================================
  // PERFORMANCE METRICS ONLY
  // ==========================================
  static async getPerformanceMetrics(req, res) {
    try {
      const { employeeId } = req.params;
      const { role, employeeId: currentEmployeeId } = req.user;
      const { startDate, endDate } = req.query;

      // Check permissions
      if (role === 'employee' && parseInt(employeeId) !== currentEmployeeId) {
        return sendError(res, 'Access denied', 403);
      }

      if (role === 'manager') {
        const employee = await Employee.findById(employeeId);
        if (!employee || employee.managerId !== currentEmployeeId) {
          return sendError(res, 'Access denied', 403);
        }
      }

      // Prepare date range
      const dateRange = {};
      if (startDate) dateRange.startDate = new Date(startDate);
      if (endDate) dateRange.endDate = new Date(endDate);

      // Get only performance metrics
      const dataService = new SmartReportsDataService();
      const performanceData = await dataService.getPerformanceMetrics(
        parseInt(employeeId), 
        dateRange.startDate || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        dateRange.endDate || new Date()
      );

      return sendSuccess(res, performanceData, 'Performance metrics retrieved successfully');
    } catch (error) {
      console.error('Get performance metrics error:', error);
      return sendError(res, 'Failed to retrieve performance metrics', 500);
    }
  }

  // ==========================================
  // ATTENDANCE METRICS ONLY
  // ==========================================
  static async getAttendanceMetrics(req, res) {
    try {
      const { employeeId } = req.params;
      const { role, employeeId: currentEmployeeId } = req.user;
      const { startDate, endDate } = req.query;

      // Check permissions
      if (role === 'employee' && parseInt(employeeId) !== currentEmployeeId) {
        return sendError(res, 'Access denied', 403);
      }

      if (role === 'manager') {
        const employee = await Employee.findById(employeeId);
        if (!employee || employee.managerId !== currentEmployeeId) {
          return sendError(res, 'Access denied', 403);
        }
      }

      // Prepare date range
      const dateRange = {};
      if (startDate) dateRange.startDate = new Date(startDate);
      if (endDate) dateRange.endDate = new Date(endDate);

      // Get only attendance metrics
      const dataService = new SmartReportsDataService();
      const attendanceData = await dataService.getAttendanceMetrics(
        parseInt(employeeId), 
        dateRange.startDate || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        dateRange.endDate || new Date()
      );

      return sendSuccess(res, attendanceData, 'Attendance metrics retrieved successfully');
    } catch (error) {
      console.error('Get attendance metrics error:', error);
      return sendError(res, 'Failed to retrieve attendance metrics', 500);
    }
  }
}

module.exports = DataController;
