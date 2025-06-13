const { executeQuery } = require('../config/database');

class Employee {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.employeeCode = data.employee_code;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
    this.phone = data.phone;
    this.dateOfBirth = data.date_of_birth;
    this.gender = data.gender;
    this.address = data.address;
    this.departmentId = data.department_id;
    this.position = data.position;
    this.hireDate = data.hire_date;
    this.basicSalary = data.basic_salary;
    this.status = data.status;
    this.managerId = data.manager_id;
    this.emergencyContact = data.emergency_contact;
    this.emergencyPhone = data.emergency_phone;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT e.*, d.name as department_name, 
             CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ? AND e.status != 'deleted'
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new Employee(rows[0]) : null;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT e.*, d.name as department_name,
             CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.user_id = ? AND e.status != 'deleted'
    `;
    const rows = await executeQuery(query, [userId]);
    return rows.length > 0 ? new Employee(rows[0]) : null;
  }

  static async findByEmployeeCode(employeeCode) {
    const query = 'SELECT * FROM employees WHERE employee_code = ? AND status != "deleted"';
    const rows = await executeQuery(query, [employeeCode]);
    return rows.length > 0 ? new Employee(rows[0]) : null;
  }

  static async create(employeeData) {
    const query = `
      INSERT INTO employees (
        user_id, employee_code, first_name, last_name, email, phone,
        date_of_birth, gender, address, department_id, position,
        hire_date, basic_salary, status, manager_id, emergency_contact,
        emergency_phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      employeeData.userId,
      employeeData.employeeCode,
      employeeData.firstName,
      employeeData.lastName,
      employeeData.email,
      employeeData.phone,
      employeeData.dateOfBirth,
      employeeData.gender,
      employeeData.address,
      employeeData.departmentId,
      employeeData.position,
      employeeData.hireDate,
      employeeData.basicSalary,
      employeeData.status || 'active',
      employeeData.managerId,
      employeeData.emergencyContact,
      employeeData.emergencyPhone
    ]);
    
    return await Employee.findById(result.insertId);
  }

  static async update(id, employeeData) {
    const updates = [];
    const values = [];
    
    const fields = [
      'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
      'gender', 'address', 'department_id', 'position', 'basic_salary',
      'status', 'manager_id', 'emergency_contact', 'emergency_phone'
    ];
    
    fields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (employeeData[camelField] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(employeeData[camelField]);
      }
    });
    
    if (updates.length === 0) return await Employee.findById(id);
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await Employee.findById(id);
  }

  static async delete(id) {
    const query = 'UPDATE employees SET status = "deleted", updated_at = NOW() WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findAll(options = {}) {
    // Start with the simplest possible query for testing
    let query = 'SELECT * FROM employees WHERE status != "deleted"';
    const params = [];

    // Only add status filter for now
    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }

    // Add simple ordering
    query += ' ORDER BY first_name, last_name';

    const rows = await executeQuery(query, params);
    return rows.map(row => new Employee(row));
  }

  static async generateEmployeeCode() {
    const query = 'SELECT employee_code FROM employees ORDER BY id DESC LIMIT 1';
    const rows = await executeQuery(query);
    
    if (rows.length === 0) {
      return 'EMP001';
    }
    
    const lastCode = rows[0].employee_code;
    const number = parseInt(lastCode.replace('EMP', '')) + 1;
    return `EMP${number.toString().padStart(3, '0')}`;
  }

  static async getByDepartment(departmentId) {
    return await Employee.findAll({ departmentId });
  }

  static async getByManager(managerId) {
    return await Employee.findAll({ managerId });
  }

  static async count(options = {}) {
    let query = 'SELECT COUNT(*) as total FROM employees WHERE status != "deleted"';
    const params = [];
    
    if (options.departmentId) {
      query += ' AND department_id = ?';
      params.push(options.departmentId);
    }
    
    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }
    
    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  // Instance methods
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await Employee.update(this.id, this);
    } else {
      return await Employee.create(this);
    }
  }
}

module.exports = Employee;
