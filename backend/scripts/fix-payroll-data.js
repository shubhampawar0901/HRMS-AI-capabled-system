const mysql = require('mysql2/promise');
const config = require('../config/database');

class PayrollDataFixer {
  constructor() {
    this.connection = null;
  }

  async connect() {
    this.connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Disconnected from database');
    }
  }

  async executeQuery(query, params = []) {
    const [rows] = await this.connection.execute(query, params);
    return rows;
  }

  async checkPayrollTable() {
    console.log('🔍 Checking payroll_records table...');
    
    try {
      // Check if table exists
      const tables = await this.executeQuery('SHOW TABLES LIKE "payroll_records"');
      
      if (tables.length === 0) {
        console.log('❌ payroll_records table does not exist!');
        return false;
      }
      
      console.log('✅ payroll_records table exists');
      
      // Check record count
      const count = await this.executeQuery('SELECT COUNT(*) as count FROM payroll_records');
      console.log(`📊 Current payroll records: ${count[0].count}`);
      
      return count[0].count;
    } catch (error) {
      console.error('❌ Error checking payroll table:', error.message);
      return false;
    }
  }

  async getEmployees() {
    console.log('👥 Getting employees...');
    
    const employees = await this.executeQuery(`
      SELECT id, first_name, last_name, basic_salary, user_id
      FROM employees 
      WHERE status = 'active' AND basic_salary > 0
      ORDER BY id
    `);
    
    console.log(`📋 Found ${employees.length} active employees with salary`);
    return employees;
  }

  async createPayrollRecords() {
    console.log('💰 Creating payroll records...');
    
    const employees = await this.getEmployees();
    
    if (employees.length === 0) {
      console.log('❌ No employees found to create payroll records');
      return;
    }

    let created = 0;
    const months = [10, 11, 12]; // Oct, Nov, Dec 2024
    const year = 2024;

    for (const employee of employees) {
      for (const month of months) {
        try {
          // Check if record already exists
          const existing = await this.executeQuery(
            'SELECT id FROM payroll_records WHERE employee_id = ? AND month = ? AND year = ?',
            [employee.id, month, year]
          );

          if (existing.length > 0) {
            console.log(`⏭️  Payroll record already exists for employee ${employee.id}, month ${month}`);
            continue;
          }

          const basicSalary = parseFloat(employee.basic_salary);
          const hra = basicSalary * 0.40; // 40% HRA
          const transportAllowance = 2000; // Fixed transport allowance
          const grossSalary = basicSalary + hra + transportAllowance;
          
          const pfDeduction = basicSalary * 0.12; // 12% PF
          const taxDeduction = grossSalary * 0.10; // 10% tax
          const totalDeductions = pfDeduction + taxDeduction;
          const netSalary = grossSalary - totalDeductions;

          const query = `
            INSERT INTO payroll_records (
              employee_id, month, year, basic_salary, hra, transport_allowance,
              overtime_pay, gross_salary, pf_deduction, tax_deduction, 
              total_deductions, net_salary, working_days, present_days,
              overtime_hours, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `;

          await this.executeQuery(query, [
            employee.id, month, year, basicSalary, hra, transportAllowance,
            0, grossSalary, pfDeduction, taxDeduction,
            totalDeductions, netSalary, 22, 22,
            0, 'paid'
          ]);

          created++;
          console.log(`✅ Created payroll record for ${employee.first_name} ${employee.last_name} - ${month}/${year}`);
        } catch (error) {
          console.error(`❌ Error creating payroll for employee ${employee.id}:`, error.message);
        }
      }
    }

    console.log(`🎉 Created ${created} payroll records`);
  }

  async verifyPayrollData() {
    console.log('🔍 Verifying payroll data...');
    
    const records = await this.executeQuery(`
      SELECT p.*, e.first_name, e.last_name, e.employee_code
      FROM payroll_records p
      JOIN employees e ON p.employee_id = e.id
      ORDER BY p.year DESC, p.month DESC, e.first_name
      LIMIT 5
    `);

    console.log('\n📄 Sample payroll records:');
    records.forEach(record => {
      console.log(`  ${record.first_name} ${record.last_name} (${record.employee_code}) - ${record.month}/${record.year} - Net: $${record.net_salary}`);
    });
  }

  async run() {
    try {
      await this.connect();
      
      const recordCount = await this.checkPayrollTable();
      
      if (recordCount === false) {
        console.log('❌ Cannot proceed - payroll table issues');
        return;
      }
      
      if (recordCount === 0) {
        console.log('📝 No payroll records found, creating sample data...');
        await this.createPayrollRecords();
      } else {
        console.log('✅ Payroll records already exist');
      }
      
      await this.verifyPayrollData();
      
    } catch (error) {
      console.error('💥 Error:', error);
    } finally {
      await this.disconnect();
    }
  }
}

// Run the fixer
const fixer = new PayrollDataFixer();
fixer.run().catch(console.error);
