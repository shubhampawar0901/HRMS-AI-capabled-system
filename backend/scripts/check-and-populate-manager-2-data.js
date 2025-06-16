const { executeQuery } = require('../config/database');

async function checkAndPopulateManagerData() {
  try {
    console.log('🔍 Checking current data for manager ID 2...\n');
    
    // 1. Check if manager ID 2 exists
    const manager = await executeQuery('SELECT * FROM employees WHERE id = 2');
    console.log('Manager ID 2:', manager.length > 0 ? manager[0] : 'Not found');
    
    if (manager.length === 0) {
      console.log('❌ Manager ID 2 not found. Cannot proceed.');
      return;
    }
    
    // 2. Check employees under manager ID 2
    const teamMembers = await executeQuery(`
      SELECT id, first_name, last_name, employee_code, position 
      FROM employees 
      WHERE manager_id = 2 AND status = 'active'
    `);
    console.log('\n👥 Team members under manager ID 2:', teamMembers);
    
    if (teamMembers.length === 0) {
      console.log('❌ No team members found under manager ID 2. Creating sample employees...');
      await createSampleEmployees();
      
      // Re-fetch team members
      const newTeamMembers = await executeQuery(`
        SELECT id, first_name, last_name, employee_code, position 
        FROM employees 
        WHERE manager_id = 2 AND status = 'active'
      `);
      console.log('✅ Created team members:', newTeamMembers);
      teamMembers.push(...newTeamMembers);
    }
    
    // 3. Check existing leave applications for team members
    if (teamMembers.length > 0) {
      const employeeIds = teamMembers.map(emp => emp.id);
      const existingLeaveApps = await executeQuery(`
        SELECT la.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               lt.name as leave_type_name
        FROM leave_applications la 
        JOIN employees e ON la.employee_id = e.id 
        JOIN leave_types lt ON la.leave_type_id = lt.id
        WHERE la.employee_id IN (${employeeIds.join(',')})
        ORDER BY la.created_at DESC
      `);
      console.log('\n📋 Existing leave applications for team members:', existingLeaveApps.length);
      
      if (existingLeaveApps.length === 0) {
        console.log('❌ No leave applications found. Creating sample leave applications...');
        await createSampleLeaveApplications(teamMembers);
      } else {
        console.log('✅ Found existing leave applications:', existingLeaveApps);
      }
    }
    
    // 4. Final verification
    console.log('\n🔍 Final verification - checking team leave applications...');
    const finalCheck = await executeQuery(`
      SELECT la.*,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             lt.name as leave_type_name
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE e.manager_id = 2
      ORDER BY la.created_at DESC
    `);
    
    console.log(`\n✅ Total leave applications for manager ID 2's team: ${finalCheck.length}`);
    finalCheck.forEach(app => {
      console.log(`   - ${app.employee_name} (${app.employee_code}): ${app.leave_type_name} - ${app.status} (${app.start_date} to ${app.end_date})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function createSampleEmployees() {
  try {
    console.log('👤 Creating sample employees under manager ID 2...');
    
    // First, check if users exist for these employees
    const sampleEmployees = [
      {
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice.johnson@company.com',
        employee_code: 'EMP004',
        position: 'Software Developer',
        department_id: 1,
        hire_date: '2024-01-15'
      },
      {
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob.smith@company.com',
        employee_code: 'EMP005',
        position: 'UI/UX Designer',
        department_id: 1,
        hire_date: '2024-02-01'
      }
    ];
    
    for (const emp of sampleEmployees) {
      // Check if employee already exists
      const existing = await executeQuery('SELECT id FROM employees WHERE employee_code = ?', [emp.employee_code]);
      if (existing.length > 0) {
        console.log(`   - Employee ${emp.employee_code} already exists, skipping...`);
        continue;
      }
      
      // Create user first
      const userResult = await executeQuery(`
        INSERT INTO users (username, email, password, role, created_at, updated_at)
        VALUES (?, ?, ?, 'employee', NOW(), NOW())
      `, [emp.email, emp.email, '$2b$10$defaulthashedpassword']);
      
      const userId = userResult.insertId;
      
      // Create employee
      await executeQuery(`
        INSERT INTO employees (
          user_id, employee_code, first_name, last_name, email, 
          position, department_id, manager_id, hire_date, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 2, ?, 'active', NOW(), NOW())
      `, [userId, emp.employee_code, emp.first_name, emp.last_name, emp.email, 
          emp.position, emp.department_id, emp.hire_date]);
      
      console.log(`   ✅ Created employee: ${emp.first_name} ${emp.last_name} (${emp.employee_code})`);
    }
  } catch (error) {
    console.error('❌ Error creating sample employees:', error);
  }
}

async function createSampleLeaveApplications(teamMembers) {
  try {
    console.log('📝 Creating sample leave applications...');
    
    // Get leave types
    const leaveTypes = await executeQuery('SELECT * FROM leave_types WHERE is_active = 1');
    
    const sampleApplications = [
      {
        employeeIndex: 0,
        leave_type_id: 1, // Annual Leave
        start_date: '2025-07-15',
        end_date: '2025-07-19',
        total_days: 5,
        reason: 'Summer vacation with family',
        status: 'pending'
      },
      {
        employeeIndex: 0,
        leave_type_id: 2, // Sick Leave
        start_date: '2025-06-20',
        end_date: '2025-06-21',
        total_days: 2,
        reason: 'Medical appointment and recovery',
        status: 'approved',
        approved_by: 2,
        approved_at: '2025-06-18 14:30:00',
        comments: 'Approved. Get well soon.'
      },
      {
        employeeIndex: 1,
        leave_type_id: 1, // Annual Leave
        start_date: '2025-08-01',
        end_date: '2025-08-05',
        total_days: 5,
        reason: 'Personal vacation - visiting family',
        status: 'pending'
      },
      {
        employeeIndex: 1,
        leave_type_id: 3, // Casual Leave
        start_date: '2025-06-25',
        end_date: '2025-06-25',
        total_days: 1,
        reason: 'Personal work - bank visit',
        status: 'approved',
        approved_by: 2,
        approved_at: '2025-06-24 10:15:00',
        comments: 'Approved for personal work.'
      }
    ];
    
    for (const app of sampleApplications) {
      if (app.employeeIndex >= teamMembers.length) continue;
      
      const employee = teamMembers[app.employeeIndex];
      
      await executeQuery(`
        INSERT INTO leave_applications (
          employee_id, leave_type_id, start_date, end_date, total_days,
          reason, status, approved_by, approved_at, comments,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        employee.id, app.leave_type_id, app.start_date, app.end_date, app.total_days,
        app.reason, app.status, app.approved_by || null, app.approved_at || null, app.comments || null
      ]);
      
      console.log(`   ✅ Created leave application for ${employee.first_name} ${employee.last_name}: ${app.reason} (${app.status})`);
    }
  } catch (error) {
    console.error('❌ Error creating sample leave applications:', error);
  }
}

// Run the script
checkAndPopulateManagerData()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
