const { Attendance, Employee } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const moment = require('moment');

class AttendanceController {
  // ==========================================
  // CHECK IN
  // ==========================================
  static async checkIn(req, res) {
    try {
      console.log('🔍 CHECK-IN API CALLED');
      console.log('Request body:', req.body);
      console.log('User from token:', req.user);

      const { role, employeeId } = req.user;

      // Check if user is an employee (has employeeId)
      if (!employeeId) {
        return sendError(res, 'Attendance check-in is only available for employees. Admin users cannot check-in.', 403);
      }

      const { location, notes } = req.body;
      const today = moment().format('YYYY-MM-DD');
      const checkInTime = moment().format('HH:mm:ss');

      console.log('Employee ID:', employeeId);
      console.log('Today:', today);
      console.log('Check-in time:', checkInTime);

      // Check if already checked in today
      console.log('Checking existing attendance...');
      const existingRecord = await Attendance.findByEmployeeAndDate(employeeId, today);
      console.log('Existing record:', existingRecord);

      if (existingRecord && existingRecord.checkInTime) {
        console.log('Already checked in today');
        return sendError(res, 'Already checked in today', 400);
      }

      // Create or update attendance record
      let attendance;
      if (existingRecord) {
        console.log('Updating existing record...');
        attendance = await Attendance.update(existingRecord.id, {
          checkInTime,
          location,
          notes,
          status: 'present'
        });
      } else {
        console.log('Creating new attendance record...');
        const attendanceData = {
          employeeId,
          date: today,
          checkInTime,
          location,
          notes,
          status: 'present'
        };
        console.log('Attendance data:', attendanceData);
        attendance = await Attendance.create(attendanceData);
        console.log('Created attendance:', attendance);
      }

      return sendCreated(res, attendance, 'Check-in successful');
    } catch (error) {
      console.error('❌ Check-in error:', error);
      console.error('Error stack:', error.stack);
      return sendError(res, 'Check-in failed', 500);
    }
  }

  // ==========================================
  // CHECK OUT
  // ==========================================
  static async checkOut(req, res) {
    try {
      const { role, employeeId } = req.user;

      // Check if user is an employee (has employeeId)
      if (!employeeId) {
        return sendError(res, 'Attendance check-out is only available for employees. Admin users cannot check-out.', 403);
      }

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
      const { employeeId } = req.user;

      // Check if user is an employee (has employeeId)
      if (!employeeId) {
        return sendSuccess(res, null, 'No attendance data for admin users');
      }

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
  // GET ATTENDANCE STATISTICS
  // ==========================================
  static async getAttendanceStats(req, res) {
    try {
      const { role, employeeId } = req.user;
      const { period = 'month', startDate, endDate } = req.query;

      // Admin users get system-wide statistics
      if (role === 'admin') {
        return AttendanceController.getSystemWideStats(req, res);
      }

      // Check if user is an employee (has employeeId)
      if (!employeeId) {
        return sendError(res, 'Attendance statistics are only available for employees.', 403);
      }

      let calculatedStartDate, calculatedEndDate;

      // Calculate date range based on period
      if (startDate && endDate) {
        calculatedStartDate = startDate;
        calculatedEndDate = endDate;
      } else {
        const now = moment();
        switch (period) {
          case 'week':
            calculatedStartDate = now.clone().startOf('week').format('YYYY-MM-DD');
            calculatedEndDate = now.clone().endOf('week').format('YYYY-MM-DD');
            break;
          case 'quarter':
            calculatedStartDate = now.clone().startOf('quarter').format('YYYY-MM-DD');
            calculatedEndDate = now.clone().endOf('quarter').format('YYYY-MM-DD');
            break;
          case 'year':
            calculatedStartDate = now.clone().startOf('year').format('YYYY-MM-DD');
            calculatedEndDate = now.clone().endOf('year').format('YYYY-MM-DD');
            break;
          default: // month
            calculatedStartDate = now.clone().startOf('month').format('YYYY-MM-DD');
            calculatedEndDate = now.clone().endOf('month').format('YYYY-MM-DD');
            break;
        }
      }

      const stats = await Attendance.getAttendanceStats(employeeId, calculatedStartDate, calculatedEndDate);

      // Format the response to match frontend expectations
      const formattedStats = {
        attendancePercentage: parseFloat(stats.attendance_percentage) || 0,
        presentDays: parseInt(stats.present_count) || 0,
        absentDays: parseInt(stats.absent_count) || 0,
        lateDays: parseInt(stats.late_count) || 0,
        totalWorkingDays: parseInt(stats.total_records) || 0,
        totalWorkHours: parseFloat(stats.totalHours_worked) || 0,
        averageWorkHours: parseFloat(stats.avg_hours_per_day) || 0,
        expectedWorkHours: parseInt(stats.total_records) * 8 || 0, // Assuming 8 hours per day
        overtimeHours: Math.max(0, (parseFloat(stats.totalHours_worked) || 0) - (parseInt(stats.total_records) * 8)),
        undertimeHours: Math.max(0, (parseInt(stats.total_records) * 8) - (parseFloat(stats.totalHours_worked) || 0)),
        earlyDepartures: 0, // This would need additional logic to calculate
        period: period,
        startDate: calculatedStartDate,
        endDate: calculatedEndDate
      };

      return sendSuccess(res, formattedStats, 'Attendance statistics retrieved');
    } catch (error) {
      console.error('Get attendance stats error:', error);
      return sendError(res, 'Failed to get attendance statistics', 500);
    }
  }

  // ==========================================
  // GET SYSTEM-WIDE ATTENDANCE STATISTICS (ADMIN ONLY)
  // ==========================================
  static async getSystemWideStats(req, res) {
    try {
      const { period = 'month', startDate, endDate } = req.query;

      let calculatedStartDate, calculatedEndDate;

      // Calculate date range based on period
      if (startDate && endDate) {
        calculatedStartDate = startDate;
        calculatedEndDate = endDate;
      } else {
        const now = moment();
        switch (period) {
          case 'week':
            calculatedStartDate = now.clone().startOf('week').format('YYYY-MM-DD');
            calculatedEndDate = now.clone().endOf('week').format('YYYY-MM-DD');
            break;
          case 'quarter':
            calculatedStartDate = now.clone().startOf('quarter').format('YYYY-MM-DD');
            calculatedEndDate = now.clone().endOf('quarter').format('YYYY-MM-DD');
            break;
          case 'year':
            calculatedStartDate = now.clone().startOf('year').format('YYYY-MM-DD');
            calculatedEndDate = now.clone().endOf('year').format('YYYY-MM-DD');
            break;
          default: // month
            calculatedStartDate = now.clone().startOf('month').format('YYYY-MM-DD');
            calculatedEndDate = now.clone().endOf('month').format('YYYY-MM-DD');
            break;
        }
      }

      const systemStats = await Attendance.getSystemWideStats(calculatedStartDate, calculatedEndDate);

      // Format the response for admin dashboard
      const formattedStats = {
        totalEmployees: parseInt(systemStats.total_employees) || 0,
        activeEmployees: parseInt(systemStats.active_employees) || 0,
        attendancePercentage: parseFloat(systemStats.overall_attendance_percentage) || 0,
        presentDays: parseInt(systemStats.total_present_days) || 0,
        absentDays: parseInt(systemStats.total_absent_days) || 0,
        lateDays: parseInt(systemStats.total_late_days) || 0,
        totalWorkingDays: parseInt(systemStats.total_working_days) || 0,
        totalWorkHours: parseFloat(systemStats.total_work_hours) || 0,
        averageWorkHours: parseFloat(systemStats.avg_work_hours_per_employee) || 0,
        expectedWorkHours: parseInt(systemStats.total_working_days) * 8 || 0,
        overtimeHours: parseFloat(systemStats.total_overtime_hours) || 0,
        undertimeHours: parseFloat(systemStats.total_undertime_hours) || 0,
        earlyDepartures: parseInt(systemStats.total_early_departures) || 0,
        period: period,
        startDate: calculatedStartDate,
        endDate: calculatedEndDate,
        departmentBreakdown: systemStats.department_breakdown || [],
        topPerformers: systemStats.top_performers || [],
        attendanceTrends: systemStats.attendance_trends || []
      };

      return sendSuccess(res, formattedStats, 'System-wide attendance statistics retrieved');
    } catch (error) {
      console.error('Get system-wide stats error:', error);
      return sendError(res, 'Failed to get system-wide attendance statistics', 500);
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
