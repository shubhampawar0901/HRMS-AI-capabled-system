const { executeQuery } = require('../config/database');

class Attendance {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employeeId;
    this.date = data.date;
    this.checkInTime = data.checkInTime;
    this.checkOutTime = data.checkOutTime;
    this.totalHours = data.totalHours;
    this.status = data.status;
    this.location = data.location;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT a.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM attendance a
      LEFT JOIN employees e ON a.employeeId = e.id
      WHERE a.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new Attendance(rows[0]) : null;
  }

  static async findByEmployeeAndDate(employeeId, date) {
    const query = 'SELECT * FROM attendance WHERE employeeId = ? AND date = ?';
    const rows = await executeQuery(query, [employeeId, date]);
    return rows.length > 0 ? new Attendance(rows[0]) : null;
  }

  static async create(attendanceData) {
    const query = `
      INSERT INTO attendance (
        employeeId, date, checkInTime, checkOutTime, 
        totalHours, status, location, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      attendanceData.employeeId,
      attendanceData.date,
      attendanceData.checkInTime || null,
      attendanceData.checkOutTime || null,
      attendanceData.totalHours || 0,
      attendanceData.status || 'present',
      attendanceData.location || null,
      attendanceData.notes || null
    ]);
    
    return await Attendance.findById(result.insertId);
  }

  static async update(id, attendanceData) {
    const updates = [];
    const values = [];
    
    const fields = [
      'checkInTime', 'checkOutTime', 'totalHours', 
      'status', 'location', 'notes'
    ];
    
    fields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (attendanceData[camelField] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(attendanceData[camelField]);
      }
    });
    
    if (updates.length === 0) return await Attendance.findById(id);
    
    updates.push('updatedAt = NOW()');
    values.push(id);
    
    const query = `UPDATE attendance SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await Attendance.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM attendance WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findByEmployee(employeeId, options = {}) {
    let query = `
      SELECT a.*
      FROM attendance a
      WHERE a.employeeId = ?
    `;
    const params = [employeeId];
    
    if (options.startDate && options.endDate) {
      query += ' AND a.date BETWEEN ? AND ?';
      params.push(options.startDate, options.endDate);
    }
    
    if (options.status) {
      query += ' AND a.status = ?';
      params.push(options.status);
    }
    
    query += ' ORDER BY a.date DESC';

    // Add pagination
    if (options.limit) {
      const limit = parseInt(options.limit);
      const page = parseInt(options.page) || 1;
      const offset = (page - 1) * limit;

      // Use string concatenation instead of parameters for LIMIT/OFFSET to avoid MySQL issues
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    console.log('🔍 Attendance.findByEmployee Debug:');
    console.log('Query:', query);
    console.log('Params:', params);
    console.log('Params length:', params.length);

    const rows = await executeQuery(query, params);
    return rows.map(row => new Attendance(row));
  }

  static async getMonthlyAttendance(employeeId, month, year) {
    const query = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days,
        AVG(totalHours) as avg_hours,
        SUM(totalHours) as totalHours
      FROM attendance
      WHERE employeeId = ?
        AND MONTH(date) = ?
        AND YEAR(date) = ?
    `;
    
    const rows = await executeQuery(query, [employeeId, month, year]);
    return rows[0];
  }

  static async getTodayAttendance(employeeId) {
    const today = new Date().toISOString().split('T')[0];
    return await Attendance.findByEmployeeAndDate(employeeId, today);
  }

  static async checkIn(employeeId, checkInData) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in
    const existing = await Attendance.findByEmployeeAndDate(employeeId, today);
    if (existing && existing.checkInTime) {
      throw new Error('Already checked in today');
    }
    
    if (existing) {
      // Update existing record
      return await Attendance.update(existing.id, {
        checkInTime: checkInData.checkInTime,
        location: checkInData.location,
        status: 'present'
      });
    } else {
      // Create new record
      return await Attendance.create({
        employeeId,
        date: today,
        checkInTime: checkInData.checkInTime,
        location: checkInData.location,
        status: 'present'
      });
    }
  }

  static async checkOut(employeeId, checkOutData) {
    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findByEmployeeAndDate(employeeId, today);
    
    if (!existing || !existing.checkInTime) {
      throw new Error('Must check in first');
    }
    
    if (existing.checkOutTime) {
      throw new Error('Already checked out today');
    }
    
    // Calculate total hours
    const checkIn = new Date(`${today} ${existing.checkInTime}`);
    const checkOut = new Date(`${today} ${checkOutData.checkOutTime}`);
    const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);
    
    return await Attendance.update(existing.id, {
      checkOutTime: checkOutData.checkOutTime,
      totalHours: Math.round(totalHours * 100) / 100,
      notes: checkOutData.notes
    });
  }

  static async getAttendanceStats(employeeId, startDate, endDate) {
    const query = `
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_day_count,
        AVG(totalHours) as avg_hours_per_day,
        SUM(totalHours) as totalHours_worked,
        (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as attendance_percentage
      FROM attendance
      WHERE employeeId = ?
        AND date BETWEEN ? AND ?
    `;
    
    const rows = await executeQuery(query, [employeeId, startDate, endDate]);
    return rows[0];
  }

  static async getDepartmentAttendance(departmentId, date) {
    const query = `
      SELECT
        e.id as employeeId,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        a.checkInTime,
        a.checkOutTime,
        a.totalHours,
        a.status,
        CASE
          WHEN a.id IS NULL THEN 'absent'
          ELSE a.status
        END as final_status
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employeeId AND a.date = ?
      WHERE e.department_id = ? AND e.status = 'active'
      ORDER BY e.first_name, e.last_name
    `;

    return await executeQuery(query, [date, departmentId]);
  }

  static async findByDate(date) {
    const query = `
      SELECT ar.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code, d.name as department_name
      FROM attendance ar
      JOIN employees e ON ar.employeeId = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE ar.date = ?
      ORDER BY e.first_name, e.last_name
    `;
    const rows = await executeQuery(query, [date]);
    return rows.map(row => new Attendance(row));
  }

  static async findByManagerAndDate(managerId, date) {
    const query = `
      SELECT ar.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code, d.name as department_name
      FROM attendance ar
      JOIN employees e ON ar.employeeId = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.manager_id = ? AND ar.date = ?
      ORDER BY e.first_name, e.last_name
    `;
    const rows = await executeQuery(query, [managerId, date]);
    return rows.map(row => new Attendance(row));
  }

  static async countByEmployee(employeeId, options = {}) {
    let query = 'SELECT COUNT(*) as total FROM attendance WHERE employeeId = ?';
    const params = [employeeId];

    if (options.startDate) {
      query += ' AND date >= ?';
      params.push(options.startDate);
    }

    if (options.endDate) {
      query += ' AND date <= ?';
      params.push(options.endDate);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async getSummary(employeeId, month, year) {
    const query = `
      SELECT
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days,
        ROUND(AVG(totalHours), 2) as avg_hours,
        SUM(totalHours) as totalHours
      FROM attendance
      WHERE employeeId = ? AND MONTH(date) = ? AND YEAR(date) = ?
    `;
    const rows = await executeQuery(query, [employeeId, month, year]);
    return rows[0];
  }

  // Instance methods
  calculateTotalHours() {
    if (!this.checkInTime || !this.checkOutTime) return 0;
    
    const checkIn = new Date(`${this.date} ${this.checkInTime}`);
    const checkOut = new Date(`${this.date} ${this.checkOutTime}`);
    return Math.round(((checkOut - checkIn) / (1000 * 60 * 60)) * 100) / 100;
  }

  isLate(standardTime = '09:00:00') {
    if (!this.checkInTime) return false;
    return this.checkInTime > standardTime;
  }

  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await Attendance.update(this.id, this);
    } else {
      return await Attendance.create(this);
    }
  }
}

module.exports = Attendance;
