const { Attendance, Employee } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const moment = require('moment');

class AttendanceController {
  // ==========================================
  // CHECK IN
  // ==========================================
  static async checkIn(req, res) {
    try {
      const employeeId = req.user.employeeId;
      const { location, notes } = req.body;
      const today = moment().format('YYYY-MM-DD');
      const checkInTime = moment().format('HH:mm:ss');

      // Check if already checked in today
      const existingRecord = await Attendance.findByEmployeeAndDate(employeeId, today);
      if (existingRecord && existingRecord.checkInTime) {
        return sendError(res, 'Already checked in today', 400);
      }

      // Create or update attendance record
      let attendance;
      if (existingRecord) {
        attendance = await Attendance.update(existingRecord.id, {
          checkInTime,
          location,
          notes,
          status: 'present'
        });
      } else {
        attendance = await Attendance.create({
          employeeId,
          date: today,
          checkInTime,
          location,
          notes,
          status: 'present'
        });
      }

      return sendCreated(res, attendance, 'Check-in successful');
    } catch (error) {
      console.error('Check-in error:', error);
      return sendError(res, 'Check-in failed', 500);
    }
  }

  // ==========================================
  // CHECK OUT
  // ==========================================
  static async checkOut(req, res) {
    try {
      const employeeId = req.user.employeeId;
      const { notes } = req.body;
      const today = moment().format('YYYY-MM-DD');
      const checkOutTime = moment().format('HH:mm:ss');

      // Find today's attendance record
      const attendance = await Attendance.findByEmployeeAndDate(employeeId, today);
      if (!attendance || !attendance.checkInTime) {
        return sendError(res, 'No check-in record found for today', 400);
      }

      if (attendance.checkOutTime) {
        return sendError(res, 'Already checked out today', 400);
      }

      // Calculate total hours
      const checkIn = moment(`${today} ${attendance.checkInTime}`);
      const checkOut = moment(`${today} ${checkOutTime}`);
      const totalHours = checkOut.diff(checkIn, 'hours', true);

      // Update attendance record
      const updatedAttendance = await Attendance.update(attendance.id, {
        checkOutTime,
        totalHours: totalHours.toFixed(2),
        notes: notes || attendance.notes
      });

      return sendSuccess(res, updatedAttendance, 'Check-out successful');
    } catch (error) {
      console.error('Check-out error:', error);
      return sendError(res, 'Check-out failed', 500);
    }
  }

  // ==========================================
  // GET TODAY'S ATTENDANCE
  // ==========================================
  static async getTodayAttendance(req, res) {
    try {
      const employeeId = req.user.employeeId;
      const today = moment().format('YYYY-MM-DD');

      const attendance = await Attendance.findByEmployeeAndDate(employeeId, today);
      
      return sendSuccess(res, attendance, 'Today\'s attendance retrieved');
    } catch (error) {
      console.error('Get today attendance error:', error);
      return sendError(res, 'Failed to get attendance', 500);
    }
  }

  // ==========================================
  // GET ATTENDANCE HISTORY
  // ==========================================
  static async getAttendanceHistory(req, res) {
    try {
      const employeeId = req.user.employeeId;
      const { startDate, endDate, page = 1, limit = 20 } = req.query;

      const options = {
        employeeId,
        startDate: startDate || moment().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: endDate || moment().format('YYYY-MM-DD'),
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const attendance = await Attendance.findByEmployee(employeeId, options);
      const total = await Attendance.countByEmployee(employeeId, options);

      const responseData = {
        attendance,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      };

      return sendSuccess(res, responseData, 'Attendance history retrieved');
    } catch (error) {
      console.error('Get attendance history error:', error);
      return sendError(res, 'Failed to get attendance history', 500);
    }
  }

  // ==========================================
  // GET TEAM ATTENDANCE (MANAGERS)
  // ==========================================
  static async getTeamAttendance(req, res) {
    try {
      const { role, employeeId } = req.user;
      
      if (role !== 'manager' && role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const { date = moment().format('YYYY-MM-DD') } = req.query;

      let teamAttendance;
      if (role === 'admin') {
        // Admin can see all employees
        teamAttendance = await Attendance.findByDate(date);
      } else {
        // Manager can see their team
        teamAttendance = await Attendance.findByManagerAndDate(employeeId, date);
      }

      return sendSuccess(res, teamAttendance, 'Team attendance retrieved');
    } catch (error) {
      console.error('Get team attendance error:', error);
      return sendError(res, 'Failed to get team attendance', 500);
    }
  }

  // ==========================================
  // GET ATTENDANCE SUMMARY
  // ==========================================
  static async getAttendanceSummary(req, res) {
    try {
      const employeeId = req.user.employeeId;
      const { month = moment().month() + 1, year = moment().year() } = req.query;

      const summary = await Attendance.getSummary(employeeId, month, year);

      return sendSuccess(res, summary, 'Attendance summary retrieved');
    } catch (error) {
      console.error('Get attendance summary error:', error);
      return sendError(res, 'Failed to get attendance summary', 500);
    }
  }

  // ==========================================
  // ADMIN: MARK ATTENDANCE
  // ==========================================
  static async markAttendance(req, res) {
    try {
      const { role } = req.user;
      
      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const { employeeId, date, checkInTime, checkOutTime, status, notes } = req.body;

      // Check if record exists
      const existingRecord = await Attendance.findByEmployeeAndDate(employeeId, date);

      let attendance;
      if (existingRecord) {
        attendance = await Attendance.update(existingRecord.id, {
          checkInTime,
          checkOutTime,
          status,
          notes,
          totalHours: checkInTime && checkOutTime ? 
            moment(`${date} ${checkOutTime}`).diff(moment(`${date} ${checkInTime}`), 'hours', true).toFixed(2) : 0
        });
      } else {
        attendance = await Attendance.create({
          employeeId,
          date,
          checkInTime,
          checkOutTime,
          status,
          notes,
          totalHours: checkInTime && checkOutTime ? 
            moment(`${date} ${checkOutTime}`).diff(moment(`${date} ${checkInTime}`), 'hours', true).toFixed(2) : 0
        });
      }

      return sendCreated(res, attendance, 'Attendance marked successfully');
    } catch (error) {
      console.error('Mark attendance error:', error);
      return sendError(res, 'Failed to mark attendance', 500);
    }
  }
}

module.exports = AttendanceController;
