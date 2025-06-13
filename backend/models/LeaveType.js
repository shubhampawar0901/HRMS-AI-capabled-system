const { executeQuery } = require('../config/database');

class LeaveType {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.maxDaysPerYear = data.max_days_per_year;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = 'SELECT * FROM leave_types WHERE id = ?';
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new LeaveType(rows[0]) : null;
  }

  static async findByName(name) {
    const query = 'SELECT * FROM leave_types WHERE name = ? AND is_active = 1';
    const rows = await executeQuery(query, [name]);
    return rows.length > 0 ? new LeaveType(rows[0]) : null;
  }

  static async create(leaveTypeData) {
    const query = `
      INSERT INTO leave_types (name, description, max_days_per_year, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      leaveTypeData.name,
      leaveTypeData.description,
      leaveTypeData.maxDaysPerYear || 0,
      leaveTypeData.isActive !== undefined ? leaveTypeData.isActive : true
    ]);
    
    return await LeaveType.findById(result.insertId);
  }

  static async update(id, leaveTypeData) {
    const updates = [];
    const values = [];
    
    if (leaveTypeData.name) {
      updates.push('name = ?');
      values.push(leaveTypeData.name);
    }
    
    if (leaveTypeData.description !== undefined) {
      updates.push('description = ?');
      values.push(leaveTypeData.description);
    }
    
    if (leaveTypeData.maxDaysPerYear !== undefined) {
      updates.push('max_days_per_year = ?');
      values.push(leaveTypeData.maxDaysPerYear);
    }
    
    if (leaveTypeData.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(leaveTypeData.isActive);
    }
    
    if (updates.length === 0) return await LeaveType.findById(id);
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE leave_types SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await LeaveType.findById(id);
  }

  static async delete(id) {
    const query = 'UPDATE leave_types SET is_active = 0, updated_at = NOW() WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findAll(options = {}) {
    let query = 'SELECT * FROM leave_types';
    const params = [];
    
    if (options.activeOnly !== false) {
      query += ' WHERE is_active = 1';
    }
    
    if (options.search) {
      const whereClause = options.activeOnly !== false ? ' AND' : ' WHERE';
      query += `${whereClause} (name LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY name';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new LeaveType(row));
  }

  static async count(options = {}) {
    let query = 'SELECT COUNT(*) as total FROM leave_types';
    const params = [];
    
    if (options.activeOnly !== false) {
      query += ' WHERE is_active = 1';
    }
    
    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async getUsageStats(leaveTypeId, year) {
    const query = `
      SELECT 
        COUNT(DISTINCT la.employee_id) as employees_used,
        SUM(la.total_days) as total_days_used,
        AVG(la.total_days) as avg_days_per_application,
        COUNT(la.id) as total_applications
      FROM leave_applications la
      WHERE la.leave_type_id = ? 
        AND YEAR(la.start_date) = ?
        AND la.status = 'approved'
    `;
    
    const rows = await executeQuery(query, [leaveTypeId, year]);
    return rows[0];
  }

  static async getPopularLeaveTypes(year, limit = 5) {
    const query = `
      SELECT 
        lt.id,
        lt.name,
        lt.description,
        COUNT(la.id) as application_count,
        SUM(la.total_days) as total_days_used,
        COUNT(DISTINCT la.employee_id) as unique_employees
      FROM leave_types lt
      LEFT JOIN leave_applications la ON lt.id = la.leave_type_id 
        AND YEAR(la.start_date) = ?
        AND la.status = 'approved'
      WHERE lt.is_active = 1
      GROUP BY lt.id, lt.name, lt.description
      ORDER BY application_count DESC, total_days_used DESC
      LIMIT ?
    `;
    
    return await executeQuery(query, [year, limit]);
  }

  static async getLeaveTypeUtilization(year) {
    const query = `
      SELECT 
        lt.id,
        lt.name,
        lt.max_days_per_year,
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(DISTINCT la.employee_id) as employees_who_used,
        COALESCE(SUM(la.total_days), 0) as total_days_used,
        COALESCE(AVG(la.total_days), 0) as avg_days_per_user,
        ROUND(
          (COUNT(DISTINCT la.employee_id) / COUNT(DISTINCT e.id)) * 100, 2
        ) as usage_percentage
      FROM leave_types lt
      CROSS JOIN employees e
      LEFT JOIN leave_applications la ON lt.id = la.leave_type_id 
        AND e.id = la.employee_id
        AND YEAR(la.start_date) = ?
        AND la.status = 'approved'
      WHERE lt.is_active = 1 AND e.status = 'active'
      GROUP BY lt.id, lt.name, lt.max_days_per_year
      ORDER BY usage_percentage DESC
    `;
    
    return await executeQuery(query, [year]);
  }

  // Instance methods
  async getUsageStats(year) {
    return await LeaveType.getUsageStats(this.id, year);
  }

  async getApplications(year, status = null) {
    let query = `
      SELECT la.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      WHERE la.leave_type_id = ? AND YEAR(la.start_date) = ?
    `;
    const params = [this.id, year];
    
    if (status) {
      query += ' AND la.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY la.start_date DESC';
    
    return await executeQuery(query, params);
  }

  isValidDaysRequest(requestedDays) {
    if (this.maxDaysPerYear === 0) return true; // Unlimited
    return requestedDays <= this.maxDaysPerYear;
  }

  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await LeaveType.update(this.id, this);
    } else {
      return await LeaveType.create(this);
    }
  }
}

module.exports = LeaveType;
