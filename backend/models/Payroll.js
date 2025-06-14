const { executeQuery } = require('../config/database');

class Payroll {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.month = data.month;
    this.year = data.year;
    this.basicSalary = data.basic_salary;
    this.hra = data.hra;
    this.transportAllowance = data.transport_allowance;
    this.overtimePay = data.overtime_pay;
    this.grossSalary = data.gross_salary;
    this.pfDeduction = data.pf_deduction;
    this.taxDeduction = data.tax_deduction;
    this.totalDeductions = data.total_deductions;
    this.netSalary = data.net_salary;
    this.workingDays = data.working_days;
    this.presentDays = data.present_days;
    this.overtimeHours = data.overtime_hours;
    this.status = data.status;
    this.processedBy = data.processed_by;
    this.processedAt = data.processed_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT p.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             CONCAT(proc.first_name, ' ', proc.last_name) as processed_by_name
      FROM payroll_records p
      LEFT JOIN employees e ON p.employee_id = e.id
      LEFT JOIN users u ON p.processed_by = u.id
      LEFT JOIN employees proc ON u.id = proc.user_id
      WHERE p.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new Payroll(rows[0]) : null;
  }

  static async findByEmployeeAndPeriod(employeeId, month, year) {
    const query = 'SELECT * FROM payroll_records WHERE employee_id = ? AND month = ? AND year = ?';
    const rows = await executeQuery(query, [employeeId, month, year]);
    return rows.length > 0 ? new Payroll(rows[0]) : null;
  }

  static async create(payrollData) {
    const query = `
      INSERT INTO payroll_records (
        employee_id, month, year, basic_salary, hra, transport_allowance,
        overtime_pay, gross_salary, pf_deduction, tax_deduction, 
        total_deductions, net_salary, working_days, present_days,
        overtime_hours, status, processed_by, processed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      payrollData.employeeId,
      payrollData.month,
      payrollData.year,
      payrollData.basicSalary,
      payrollData.hra || 0,
      payrollData.transportAllowance || 0,
      payrollData.overtimePay || 0,
      payrollData.grossSalary,
      payrollData.pfDeduction || 0,
      payrollData.taxDeduction || 0,
      payrollData.totalDeductions || 0,
      payrollData.netSalary,
      payrollData.workingDays,
      payrollData.presentDays,
      payrollData.overtimeHours || 0,
      payrollData.status || 'draft',
      payrollData.processedBy,
      payrollData.processedAt
    ]);
    
    return await Payroll.findById(result.insertId);
  }

  static async update(id, payrollData) {
    const updates = [];
    const values = [];
    
    const fields = [
      'basic_salary', 'hra', 'transport_allowance', 'overtime_pay',
      'gross_salary', 'pf_deduction', 'tax_deduction', 'total_deductions',
      'net_salary', 'working_days', 'present_days', 'overtime_hours',
      'status', 'processed_by', 'processed_at'
    ];
    
    fields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (payrollData[camelField] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(payrollData[camelField]);
      }
    });
    
    if (updates.length === 0) return await Payroll.findById(id);
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE payroll_records SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await Payroll.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM payroll_records WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findByEmployee(employeeId, options = {}) {
    console.log('🔍 Payroll.findByEmployee called with:', employeeId, options);

    let query = `
      SELECT p.*,
             CONCAT(proc.first_name, ' ', proc.last_name) as processed_by_name
      FROM payroll_records p
      LEFT JOIN users u ON p.processed_by = u.id
      LEFT JOIN employees proc ON u.id = proc.user_id
      WHERE p.employee_id = ?
    `;
    const params = [employeeId];

    console.log('🔍 Base query:', query);
    console.log('🔍 Base params:', params);

    if (options.month && options.month !== 'null' && options.month !== null) {
      query += ' AND p.month = ?';
      params.push(options.month);
    }

    if (options.year) {
      query += ' AND p.year = ?';
      params.push(parseInt(options.year));
    }

    if (options.status) {
      query += ' AND p.status = ?';
      params.push(options.status);
    }

    query += ' ORDER BY p.year DESC, p.month DESC';

    if (options.limit) {
      const limit = parseInt(options.limit);
      query += ` LIMIT ${limit}`;

      if (options.page) {
        const offset = (parseInt(options.page) - 1) * limit;
        query += ` OFFSET ${offset}`;
      }
    }

    console.log('🔍 Final query:', query);
    console.log('🔍 Final params:', params);

    try {
      const rows = await executeQuery(query, params);
      console.log('✅ Query executed successfully, rows:', rows.length);
      console.log('📄 Sample row:', rows[0] || 'No rows found');
      return rows.map(row => new Payroll(row));
    } catch (error) {
      console.error('❌ Query execution failed:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    let query = `
      SELECT p.*,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             d.name as department_name,
             CONCAT(proc.first_name, ' ', proc.last_name) as processed_by_name
      FROM payroll_records p
      LEFT JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON p.processed_by = u.id
      LEFT JOIN employees proc ON u.id = proc.user_id
      WHERE 1=1
    `;
    const params = [];

    if (options.month && options.month !== 'null' && options.month !== null) {
      query += ' AND p.month = ?';
      params.push(options.month);
    }

    if (options.year) {
      query += ' AND p.year = ?';
      params.push(options.year);
    }

    if (options.status) {
      query += ' AND p.status = ?';
      params.push(options.status);
    }

    if (options.departmentId) {
      query += ' AND e.department_id = ?';
      params.push(options.departmentId);
    }

    query += ' ORDER BY p.year DESC, p.month DESC, e.first_name, e.last_name';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.page && options.limit) {
      const offset = (options.page - 1) * options.limit;
      query += ' OFFSET ?';
      params.push(offset);
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => new Payroll(row));
  }

  static async count(options = {}) {
    let query = 'SELECT COUNT(*) as total FROM payroll_records p LEFT JOIN employees e ON p.employee_id = e.id WHERE 1=1';
    const params = [];

    if (options.month && options.month !== 'null' && options.month !== null) {
      query += ' AND p.month = ?';
      params.push(options.month);
    }

    if (options.year) {
      query += ' AND p.year = ?';
      params.push(options.year);
    }

    if (options.status) {
      query += ' AND p.status = ?';
      params.push(options.status);
    }

    if (options.departmentId) {
      query += ' AND e.department_id = ?';
      params.push(options.departmentId);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async countByEmployee(employeeId, options = {}) {
    let query = 'SELECT COUNT(*) as total FROM payroll_records WHERE employee_id = ?';
    const params = [employeeId];

    if (options.month && options.month !== 'null' && options.month !== null) {
      query += ' AND month = ?';
      params.push(options.month);
    }

    if (options.year) {
      query += ' AND year = ?';
      params.push(options.year);
    }

    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async getSummary(month, year) {
    const query = `
      SELECT
        COUNT(*) as total_employees,
        SUM(p.gross_salary) as total_gross,
        SUM(p.total_deductions) as total_deductions,
        SUM(p.net_salary) as total_net,
        AVG(p.net_salary) as avg_net_salary,
        COUNT(CASE WHEN p.status = 'processed' THEN 1 END) as processed_count,
        COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN p.status = 'draft' THEN 1 END) as draft_count
      FROM payroll_records p
      WHERE p.month = ? AND p.year = ?
    `;

    const rows = await executeQuery(query, [month, year]);
    return rows[0];
  }

  static async findByPeriod(month, year, options = {}) {
    let query = `
      SELECT p.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             d.name as department_name
      FROM payroll_records p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.month = ? AND p.year = ?
    `;
    const params = [month, year];
    
    if (options.departmentId) {
      query += ' AND e.department_id = ?';
      params.push(options.departmentId);
    }
    
    if (options.status) {
      query += ' AND p.status = ?';
      params.push(options.status);
    }
    
    query += ' ORDER BY e.first_name, e.last_name';
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new Payroll(row));
  }

  static async getPayrollSummary(month, year, departmentId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_employees,
        SUM(p.gross_salary) as total_gross,
        SUM(p.total_deductions) as total_deductions,
        SUM(p.net_salary) as total_net,
        AVG(p.net_salary) as avg_net_salary,
        COUNT(CASE WHEN p.status = 'processed' THEN 1 END) as processed_count,
        COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_count
      FROM payroll_records p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.month = ? AND p.year = ?
    `;
    const params = [month, year];
    
    if (departmentId) {
      query += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    
    const rows = await executeQuery(query, params);
    return rows[0];
  }

  // Instance methods
  calculateGrossSalary() {
    return this.basicSalary + this.hra + this.transportAllowance + this.overtimePay;
  }

  calculateNetSalary() {
    return this.grossSalary - this.totalDeductions;
  }

  getPayslipData() {
    return {
      employee: {
        id: this.employeeId,
        name: this.employee_name,
        code: this.employee_code
      },
      period: {
        month: this.month,
        year: this.year
      },
      earnings: {
        basic: this.basicSalary,
        hra: this.hra,
        transport: this.transportAllowance,
        overtime: this.overtimePay,
        gross: this.grossSalary
      },
      deductions: {
        pf: this.pfDeduction,
        tax: this.taxDeduction,
        total: this.totalDeductions
      },
      attendance: {
        workingDays: this.workingDays,
        presentDays: this.presentDays,
        overtimeHours: this.overtimeHours
      },
      net: this.netSalary,
      status: this.status,
      processedAt: this.processedAt
    };
  }

  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await Payroll.update(this.id, this);
    } else {
      return await Payroll.create(this);
    }
  }
}

module.exports = Payroll;
