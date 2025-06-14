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
        emergency_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      employeeData.userId || null,
      employeeData.employeeCode || null,
      employeeData.firstName || null,
      employeeData.lastName || null,
      employeeData.email || null,
      employeeData.phone || null,
      employeeData.dateOfBirth || null,
      employeeData.gender || null,
      employeeData.address || null,
      employeeData.departmentId || null,
      employeeData.position || null,
      employeeData.hireDate || null,
      employeeData.basicSalary || null,
      employeeData.status || 'active',
      employeeData.managerId || null,
      employeeData.emergencyContact || null,
      employeeData.emergencyPhone || null
    ];

    console.log('Employee.create params:', params);
    console.log('Params with undefined:', params.map((p, i) => p === undefined ? `Index ${i}: undefined` : null).filter(Boolean));

    // Check each parameter individually
    const paramNames = [
      'userId', 'employeeCode', 'firstName', 'lastName', 'email', 'phone',
      'dateOfBirth', 'gender', 'address', 'departmentId', 'position',
      'hireDate', 'basicSalary', 'status', 'managerId', 'emergencyContact', 'emergencyPhone'
    ];

    params.forEach((param, index) => {
      console.log(`Param ${index} (${paramNames[index]}):`, param, typeof param);
      if (param === undefined) {
        console.error(`❌ UNDEFINED PARAMETER at index ${index}: ${paramNames[index]}`);
        throw new Error(`Parameter ${paramNames[index]} is undefined. All parameters must be null or have a value.`);
      }
    });

    try {
      console.log('🔍 Executing SQL Query:');
      console.log('Query:', query);
      console.log('Params:', params);
      console.log('Params count:', params.length);

      const result = await executeQuery(query, params);
      console.log('✅ SQL execution successful, insertId:', result.insertId);

      return await Employee.findById(result.insertId);
    } catch (error) {
      console.error('❌ Employee.create SQL Error:');
      console.error('Error Message:', error.message);
      console.error('Error Code:', error.code);
      console.error('Error SQL State:', error.sqlState);
      console.error('Error SQL Message:', error.sqlMessage);
      console.error('Query:', query);
      console.error('Params:', params);
      console.error('Params Types:', params.map(p => typeof p));
      console.error('Full Error Object:', JSON.stringify(error, null, 2));
      console.error('Node.js Stack Trace:', error.stack);

      // Re-throw with more context
      const enhancedError = new Error(`Employee creation failed: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.query = query;
      enhancedError.params = params;
      throw enhancedError;
    }
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
    let query = 'SELECT * FROM employees WHERE status != "deleted"';
    const params = [];

    // Add filters
    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }

    if (options.departmentId) {
      query += ' AND department_id = ?';
      params.push(options.departmentId);
    }

    if (options.search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR employee_code LIKE ? OR email LIKE ?)';
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add ordering
    query += ' ORDER BY first_name, last_name';

    // Add pagination
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    console.log('🔍 Employee.findAll SQL:', query);
    console.log('🔍 Employee.findAll params:', params);

    const rows = await executeQuery(query, params);
    console.log('🔍 Employee.findAll results:', rows.length, 'rows');

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

    if (options.search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR employee_code LIKE ? OR email LIKE ?)';
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    console.log('🔍 Employee.count SQL:', query);
    console.log('🔍 Employee.count params:', params);

    const rows = await executeQuery(query, params);
    console.log('🔍 Employee.count result:', rows[0].total);

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
