const { executeQuery } = require('../config/database');

async function createPayrollData() {
  console.log('💰 Creating payroll test data...');
  
  try {
    // Create payroll records for employee ID 3 (our test employee)
    const payrollRecords = [
      // 2024 records
      {
        employee_id: 3,
        month: 10,
        year: 2024,
        basic_salary: 55000,
        hra: 22000,
        transport_allowance: 2000,
        overtime_pay: 0,
        gross_salary: 79000,
        pf_deduction: 6600,
        tax_deduction: 7900,
        total_deductions: 14500,
        net_salary: 64500,
        working_days: 22,
        present_days: 22,
        overtime_hours: 0,
        status: 'paid'
      },
      {
        employee_id: 3,
        month: 11,
        year: 2024,
        basic_salary: 55000,
        hra: 22000,
        transport_allowance: 2000,
        overtime_pay: 0,
        gross_salary: 79000,
        pf_deduction: 6600,
        tax_deduction: 7900,
        total_deductions: 14500,
        net_salary: 64500,
        working_days: 22,
        present_days: 21,
        overtime_hours: 0,
        status: 'paid'
      },
      {
        employee_id: 3,
        month: 12,
        year: 2024,
        basic_salary: 55000,
        hra: 22000,
        transport_allowance: 2000,
        overtime_pay: 0,
        gross_salary: 79000,
        pf_deduction: 6600,
        tax_deduction: 7900,
        total_deductions: 14500,
        net_salary: 64500,
        working_days: 22,
        present_days: 22,
        overtime_hours: 0,
        status: 'processed'
      },
      // 2025 records (current year)
      {
        employee_id: 3,
        month: 1,
        year: 2025,
        basic_salary: 55000,
        hra: 22000,
        transport_allowance: 2000,
        overtime_pay: 0,
        gross_salary: 79000,
        pf_deduction: 6600,
        tax_deduction: 7900,
        total_deductions: 14500,
        net_salary: 64500,
        working_days: 22,
        present_days: 22,
        overtime_hours: 0,
        status: 'paid'
      },
      {
        employee_id: 3,
        month: 2,
        year: 2025,
        basic_salary: 55000,
        hra: 22000,
        transport_allowance: 2000,
        overtime_pay: 0,
        gross_salary: 79000,
        pf_deduction: 6600,
        tax_deduction: 7900,
        total_deductions: 14500,
        net_salary: 64500,
        working_days: 20,
        present_days: 20,
        overtime_hours: 0,
        status: 'paid'
      },
      {
        employee_id: 3,
        month: 3,
        year: 2025,
        basic_salary: 55000,
        hra: 22000,
        transport_allowance: 2000,
        overtime_pay: 0,
        gross_salary: 79000,
        pf_deduction: 6600,
        tax_deduction: 7900,
        total_deductions: 14500,
        net_salary: 64500,
        working_days: 22,
        present_days: 21,
        overtime_hours: 0,
        status: 'paid'
      },
      {
        employee_id: 3,
        month: 4,
        year: 2025,
        basic_salary: 55000,
        hra: 22000,
        transport_allowance: 2000,
        overtime_pay: 0,
        gross_salary: 79000,
        pf_deduction: 6600,
        tax_deduction: 7900,
        total_deductions: 14500,
        net_salary: 64500,
        working_days: 22,
        present_days: 22,
        overtime_hours: 0,
        status: 'paid'
      },
      {
        employee_id: 3,
        month: 5,
        year: 2025,
        basic_salary: 55000,
        hra: 22000,
        transport_allowance: 2000,
        overtime_pay: 0,
        gross_salary: 79000,
        pf_deduction: 6600,
        tax_deduction: 7900,
        total_deductions: 14500,
        net_salary: 64500,
        working_days: 22,
        present_days: 22,
        overtime_hours: 0,
        status: 'paid'
      },
      {
        employee_id: 3,
        month: 6,
        year: 2025,
        basic_salary: 55000,
        hra: 22000,
        transport_allowance: 2000,
        overtime_pay: 0,
        gross_salary: 79000,
        pf_deduction: 6600,
        tax_deduction: 7900,
        total_deductions: 14500,
        net_salary: 64500,
        working_days: 22,
        present_days: 22,
        overtime_hours: 0,
        status: 'processed'
      }
    ];

    let created = 0;
    
    for (const record of payrollRecords) {
      try {
        const query = `
          INSERT INTO payroll_records (
            employee_id, month, year, basic_salary, hra, transport_allowance,
            overtime_pay, gross_salary, pf_deduction, tax_deduction, 
            total_deductions, net_salary, working_days, present_days,
            overtime_hours, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        await executeQuery(query, [
          record.employee_id, record.month, record.year, record.basic_salary,
          record.hra, record.transport_allowance, record.overtime_pay,
          record.gross_salary, record.pf_deduction, record.tax_deduction,
          record.total_deductions, record.net_salary, record.working_days,
          record.present_days, record.overtime_hours, record.status
        ]);
        
        created++;
        console.log(`✅ Created payroll record: Employee ${record.employee_id}, ${record.month}/${record.year}`);
      } catch (error) {
        if (error.message.includes('Duplicate')) {
          console.log(`⏭️  Record already exists: Employee ${record.employee_id}, ${record.month}/${record.year}`);
        } else {
          console.error(`❌ Error creating record:`, error.message);
        }
      }
    }
    
    console.log(`🎉 Created ${created} new payroll records`);
    
    // Verify the data
    const count = await executeQuery('SELECT COUNT(*) as count FROM payroll_records');
    console.log(`📊 Total payroll records in database: ${count[0].count}`);
    
    // Show records for employee 3
    const employeeRecords = await executeQuery('SELECT * FROM payroll_records WHERE employee_id = 3 ORDER BY year DESC, month DESC');
    console.log(`📄 Records for employee 3: ${employeeRecords.length}`);
    
    employeeRecords.forEach(record => {
      console.log(`  - ${record.month}/${record.year}: $${record.net_salary} (${record.status})`);
    });
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Run the script
createPayrollData().catch(console.error);
