const { executeQuery } = require('../config/database');

class LeaveApplication {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.leaveTypeId = data.leave_type_id;
    this.startDate = data.start_date;
    this.endDate = data.end_date;
    this.totalDays = data.total_days;
    this.reason = data.reason;
    this.status = data.status;
    this.approvedBy = data.approved_by;
    this.approvedAt = data.approved_at;
    this.comments = data.comments;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT la.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             lt.name as leave_type_name,
             CONCAT(a.first_name, ' ', a.last_name) as approved_by_name
      FROM leave_applications la
      LEFT JOIN employees e ON la.employee_id = e.id
      LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
      LEFT JOIN users u ON la.approved_by = u.id
      LEFT JOIN employees a ON u.id = a.user_id
      WHERE la.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new LeaveApplication(rows[0]) : null;
  }

  static async create(applicationData) {
    const query = `
      INSERT INTO leave_applications (
        employee_id, leave_type_id, start_date, end_date, 
        total_days, reason, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      applicationData.employeeId,
      applicationData.leaveTypeId,
      applicationData.startDate,
      applicationData.endDate,
      applicationData.totalDays,
      applicationData.reason,
      applicationData.status || 'pending'
    ]);
    
    return await LeaveApplication.findById(result.insertId);
  }

  static async update(id, applicationData) {
    const updates = [];
    const values = [];
    
    const fields = [
      'leave_type_id', 'start_date', 'end_date', 'total_days',
      'reason', 'status', 'approved_by', 'approved_at', 'comments'
    ];
    
    fields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (applicationData[camelField] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(applicationData[camelField]);
      }
    });
    
    if (updates.length === 0) return await LeaveApplication.findById(id);
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE leave_applications SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await LeaveApplication.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM leave_applications WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findByEmployee(employeeId, options = {}) {
    let query = `
      SELECT la.*, 
             lt.name as leave_type_name,
             CONCAT(a.first_name, ' ', a.last_name) as approved_by_name
      FROM leave_applications la
      LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
      LEFT JOIN users u ON la.approved_by = u.id
      LEFT JOIN employees a ON u.id = a.user_id
      WHERE la.employee_id = ?
    `;
    const params = [employeeId];
    
    if (options.status) {
      query += ' AND la.status = ?';
      params.push(options.status);
    }
    
    if (options.leaveTypeId) {
      query += ' AND la.leave_type_id = ?';
      params.push(options.leaveTypeId);
    }
    
    if (options.year) {
      query += ' AND YEAR(la.start_date) = ?';
      params.push(options.year);
    }
    
    query += ' ORDER BY la.created_at DESC';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new LeaveApplication(row));
  }

  static async findPendingApprovals(managerId) {
    const query = `
      SELECT la.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             lt.name as leave_type_name
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.status = 'pending' 
        AND (e.manager_id = (SELECT id FROM employees WHERE user_id = ?) 
             OR ? IN (SELECT id FROM users WHERE role = 'admin'))
      ORDER BY la.created_at ASC
    `;
    
    const rows = await executeQuery(query, [managerId, managerId]);
    return rows.map(row => new LeaveApplication(row));
  }

  static async approve(id, approvedBy, comments = null) {
    const application = await LeaveApplication.findById(id);
    if (!application) {
      throw new Error('Leave application not found');
    }
    
    if (application.status !== 'pending') {
      throw new Error('Leave application is not pending');
    }
    
    return await LeaveApplication.update(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
      comments
    });
  }

  static async reject(id, rejectedBy, comments) {
    const application = await LeaveApplication.findById(id);
    if (!application) {
      throw new Error('Leave application not found');
    }
    
    if (application.status !== 'pending') {
      throw new Error('Leave application is not pending');
    }
    
    return await LeaveApplication.update(id, {
      status: 'rejected',
      approvedBy: rejectedBy,
      approvedAt: new Date(),
      comments
    });
  }

  static async cancel(id, cancelledBy, reason) {
    const application = await LeaveApplication.findById(id);
    if (!application) {
      throw new Error('Leave application not found');
    }
    
    if (application.status === 'cancelled') {
      throw new Error('Leave application is already cancelled');
    }
    
    return await LeaveApplication.update(id, {
      status: 'cancelled',
      comments: reason
    });
  }

  static async checkOverlapping(employeeId, startDate, endDate, excludeId = null) {
    let query = `
      SELECT * FROM leave_applications 
      WHERE employee_id = ? 
        AND status IN ('pending', 'approved')
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
    `;
    const params = [employeeId, startDate, startDate, endDate, endDate, startDate, endDate];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const rows = await executeQuery(query, params);
    return rows.length > 0;
  }

  static async getLeaveStats(employeeId, year) {
    const query = `
      SELECT 
        lt.id as leave_type_id,
        lt.name as leave_type_name,
        lt.max_days_per_year,
        COALESCE(SUM(CASE WHEN la.status = 'approved' THEN la.total_days ELSE 0 END), 0) as used_days,
        COALESCE(SUM(CASE WHEN la.status = 'pending' THEN la.total_days ELSE 0 END), 0) as pending_days,
        (lt.max_days_per_year - COALESCE(SUM(CASE WHEN la.status = 'approved' THEN la.total_days ELSE 0 END), 0)) as remaining_days
      FROM leave_types lt
      LEFT JOIN leave_applications la ON lt.id = la.leave_type_id 
        AND la.employee_id = ? 
        AND YEAR(la.start_date) = ?
      WHERE lt.is_active = 1
      GROUP BY lt.id, lt.name, lt.max_days_per_year
      ORDER BY lt.name
    `;
    
    return await executeQuery(query, [employeeId, year]);
  }

  static async getUpcomingLeaves(departmentId = null, days = 30) {
    let query = `
      SELECT la.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             lt.name as leave_type_name,
             d.name as department_name
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      JOIN leave_types lt ON la.leave_type_id = lt.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE la.status = 'approved' 
        AND la.start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
    `;
    const params = [days];
    
    if (departmentId) {
      query += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    
    query += ' ORDER BY la.start_date ASC';
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new LeaveApplication(row));
  }

  static async calculateLeaveDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    // Simple calculation - can be enhanced to exclude weekends/holidays
    return daysDiff;
  }

  // Instance methods
  getDuration() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  isUpcoming() {
    const today = new Date();
    const startDate = new Date(this.startDate);
    return startDate > today;
  }

  isActive() {
    const today = new Date();
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    return today >= startDate && today <= endDate && this.status === 'approved';
  }

  canCancel() {
    return this.status === 'pending' || (this.status === 'approved' && this.isUpcoming());
  }

  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await LeaveApplication.update(this.id, this);
    } else {
      return await LeaveApplication.create(this);
    }
  }
}

module.exports = LeaveApplication;
