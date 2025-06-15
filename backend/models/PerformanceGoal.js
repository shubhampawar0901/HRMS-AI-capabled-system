const { executeQuery } = require('../config/database');

class PerformanceGoal {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.title = data.title;
    this.description = data.description;
    this.targetDate = data.target_date;
    this.achievementPercentage = data.achievement_percentage;
    this.status = data.status;
    this.createdBy = data.created_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT pg.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             CONCAT(c.first_name, ' ', c.last_name) as created_by_name
      FROM performance_goals pg
      LEFT JOIN employees e ON pg.employee_id = e.id
      LEFT JOIN users u ON pg.created_by = u.id
      LEFT JOIN employees c ON u.id = c.user_id
      WHERE pg.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new PerformanceGoal(rows[0]) : null;
  }

  static async create(goalData) {
    const query = `
      INSERT INTO performance_goals (
        employee_id, title, description, target_date,
        achievement_percentage, status, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      goalData.employeeId,
      goalData.title,
      goalData.description,
      goalData.targetDate,
      goalData.achievementPercentage || 0,
      goalData.status || 'active',
      goalData.createdBy
    ]);
    
    return await PerformanceGoal.findById(result.insertId);
  }

  static async update(id, goalData) {
    const updates = [];
    const values = [];
    
    const fields = [
      'title', 'description', 'target_date', 'achievement_percentage', 'status'
    ];
    
    fields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (goalData[camelField] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(goalData[camelField]);
      }
    });
    
    if (updates.length === 0) return await PerformanceGoal.findById(id);
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE performance_goals SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await PerformanceGoal.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM performance_goals WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findByEmployee(employeeId, options = {}) {
    let query = `
      SELECT pg.*,
             CONCAT(c.first_name, ' ', c.last_name) as created_by_name
      FROM performance_goals pg
      LEFT JOIN users u ON pg.created_by = u.id
      LEFT JOIN employees c ON u.id = c.user_id
      WHERE pg.employee_id = ?
    `;
    const params = [employeeId];

    // Only add status filter if status is provided and not null
    if (options.status && options.status !== null && options.status !== 'null') {
      query += ' AND pg.status = ?';
      params.push(options.status);
    }

    query += ' ORDER BY pg.target_date ASC';

    // Handle pagination - use string interpolation to avoid parameter issues
    const limit = parseInt(options.limit) || 100; // Default limit
    const page = parseInt(options.page) || 1;
    const offset = (page - 1) * limit;

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const rows = await executeQuery(query, params);
    return rows.map(row => new PerformanceGoal(row));
  }

  static async findAll(options = {}) {
    let query = `
      SELECT pg.*,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             CONCAT(c.first_name, ' ', c.last_name) as created_by_name
      FROM performance_goals pg
      LEFT JOIN employees e ON pg.employee_id = e.id
      LEFT JOIN users u ON pg.created_by = u.id
      LEFT JOIN employees c ON u.id = c.user_id
      WHERE 1=1
    `;
    const params = [];

    // Only add status filter if status is provided and not null
    if (options.status && options.status !== null && options.status !== 'null') {
      query += ' AND pg.status = ?';
      params.push(options.status);
    }

    query += ' ORDER BY pg.target_date ASC';

    // Handle pagination - use string interpolation to avoid parameter issues
    const limit = parseInt(options.limit) || 100; // Default limit
    const page = parseInt(options.page) || 1;
    const offset = (page - 1) * limit;

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const rows = await executeQuery(query, params);
    return rows.map(row => new PerformanceGoal(row));
  }

  static async count(options = {}) {
    let query = 'SELECT COUNT(*) as total FROM performance_goals WHERE 1=1';
    const params = [];

    // Only add status filter if status is provided and not null
    if (options.status && options.status !== null && options.status !== 'null') {
      query += ' AND status = ?';
      params.push(options.status);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async findByManager(managerId, options = {}) {
    let query = `
      SELECT pg.*,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM performance_goals pg
      JOIN employees e ON pg.employee_id = e.id
      WHERE e.manager_id = ?
    `;
    const params = [managerId];

    // Only add status filter if status is provided and not null
    if (options.status && options.status !== null && options.status !== 'null') {
      query += ' AND pg.status = ?';
      params.push(options.status);
    }

    query += ' ORDER BY pg.target_date ASC';

    // Handle pagination - use string interpolation to avoid parameter issues
    const limit = parseInt(options.limit) || 100; // Default limit
    const page = parseInt(options.page) || 1;
    const offset = (page - 1) * limit;

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const rows = await executeQuery(query, params);
    return rows.map(row => new PerformanceGoal(row));
  }

  static async countByManager(managerId, options = {}) {
    let query = `
      SELECT COUNT(*) as total FROM performance_goals pg
      JOIN employees e ON pg.employee_id = e.id
      WHERE e.manager_id = ?
    `;
    const params = [managerId];

    // Only add status filter if status is provided and not null
    if (options.status && options.status !== null && options.status !== 'null') {
      query += ' AND pg.status = ?';
      params.push(options.status);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async countByEmployee(employeeId, options = {}) {
    let query = 'SELECT COUNT(*) as total FROM performance_goals WHERE employee_id = ?';
    const params = [employeeId];

    // Only add status filter if status is provided and not null
    if (options.status && options.status !== null && options.status !== 'null') {
      query += ' AND status = ?';
      params.push(options.status);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  // Instance methods
  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await PerformanceGoal.update(this.id, this);
    } else {
      return await PerformanceGoal.create(this);
    }
  }
}

module.exports = PerformanceGoal;
