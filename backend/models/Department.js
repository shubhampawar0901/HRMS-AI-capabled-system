const { executeQuery } = require('../config/database');

class Department {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.managerId = data.manager_id;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT d.*, 
             CONCAT(e.first_name, ' ', e.last_name) as manager_name,
             e.employee_code as manager_code
      FROM departments d
      LEFT JOIN employees e ON d.manager_id = e.id
      WHERE d.id = ? AND d.is_active = 1
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new Department(rows[0]) : null;
  }

  static async findByName(name) {
    const query = 'SELECT * FROM departments WHERE name = ? AND is_active = 1';
    const rows = await executeQuery(query, [name]);
    return rows.length > 0 ? new Department(rows[0]) : null;
  }

  static async create(departmentData) {
    const query = `
      INSERT INTO departments (name, description, manager_id, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      departmentData.name,
      departmentData.description,
      departmentData.managerId,
      departmentData.isActive !== undefined ? departmentData.isActive : true
    ]);
    
    return await Department.findById(result.insertId);
  }

  static async update(id, departmentData) {
    const updates = [];
    const values = [];
    
    if (departmentData.name) {
      updates.push('name = ?');
      values.push(departmentData.name);
    }
    
    if (departmentData.description !== undefined) {
      updates.push('description = ?');
      values.push(departmentData.description);
    }
    
    if (departmentData.managerId !== undefined) {
      updates.push('manager_id = ?');
      values.push(departmentData.managerId);
    }
    
    if (departmentData.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(departmentData.isActive);
    }
    
    if (updates.length === 0) return await Department.findById(id);
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE departments SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await Department.findById(id);
  }

  static async delete(id) {
    const query = 'UPDATE departments SET is_active = 0, updated_at = NOW() WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findAll(options = {}) {
    let query = `
      SELECT d.*, 
             CONCAT(e.first_name, ' ', e.last_name) as manager_name,
             e.employee_code as manager_code,
             (SELECT COUNT(*) FROM employees WHERE department_id = d.id AND status = 'active') as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.manager_id = e.id
      WHERE d.is_active = 1
    `;
    const params = [];
    
    if (options.managerId) {
      query += ' AND d.manager_id = ?';
      params.push(options.managerId);
    }
    
    if (options.search) {
      query += ' AND (d.name LIKE ? OR d.description LIKE ?)';
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY d.name';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    
    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new Department(row));
  }

  static async getEmployeeCount(departmentId) {
    const query = 'SELECT COUNT(*) as count FROM employees WHERE department_id = ? AND status = "active"';
    const rows = await executeQuery(query, [departmentId]);
    return rows[0].count;
  }

  static async getEmployees(departmentId) {
    const query = `
      SELECT e.*, u.email as user_email
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.department_id = ? AND e.status = 'active'
      ORDER BY e.first_name, e.last_name
    `;
    const rows = await executeQuery(query, [departmentId]);
    return rows;
  }

  static async count(options = {}) {
    let query = 'SELECT COUNT(*) as total FROM departments WHERE is_active = 1';
    const params = [];
    
    if (options.managerId) {
      query += ' AND manager_id = ?';
      params.push(options.managerId);
    }
    
    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async getDepartmentStats() {
    const query = `
      SELECT 
        d.id,
        d.name,
        COUNT(e.id) as employee_count,
        AVG(e.basic_salary) as avg_salary,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
      LEFT JOIN employees m ON d.manager_id = m.id
      WHERE d.is_active = 1
      GROUP BY d.id, d.name, d.manager_id, m.first_name, m.last_name
      ORDER BY d.name
    `;
    return await executeQuery(query);
  }

  // Instance methods
  async getEmployeeCount() {
    return await Department.getEmployeeCount(this.id);
  }

  async getEmployees() {
    return await Department.getEmployees(this.id);
  }

  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await Department.update(this.id, this);
    } else {
      return await Department.create(this);
    }
  }
}

module.exports = Department;
