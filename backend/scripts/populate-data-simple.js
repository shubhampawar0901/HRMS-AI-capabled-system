const { executeQuery } = require('../config/database');

async function populateData() {
  try {
    console.log('🚀 Starting data population for Employee ID 3...');
    const employeeId = 3;
    
    // 1. Clear existing data
    console.log('🧹 Cleaning existing data...');
    await executeQuery('DELETE FROM performance_reviews WHERE employee_id = ?', [employeeId]);
    await executeQuery('DELETE FROM attendance_records WHERE employee_id = ?', [employeeId]);
    await executeQuery('DELETE FROM performance_goals WHERE employee_id = ?', [employeeId]);
    await executeQuery('DELETE FROM leave_applications WHERE employee_id = ?', [employeeId]);
    await executeQuery('DELETE FROM leave_balances WHERE employee_id = ?', [employeeId]);
    
    // 2. Insert Performance Reviews
    console.log('📊 Inserting performance reviews...');
    await executeQuery(`
      INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, overall_rating, comments, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 2, 'Q1 2025', 4.2, 'John demonstrates excellent analytical skills and consistently delivers high-quality financial reports. Shows strong attention to detail and proactive approach to identifying cost-saving opportunities.', 'approved', '2025-04-01 10:00:00', '2025-04-01 10:00:00']);
    
    await executeQuery(`
      INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, overall_rating, comments, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 2, 'Q4 2024', 3.8, 'Solid performance in financial analysis with good understanding of company processes. Improved communication skills noted. Areas for development include presentation skills.', 'approved', '2025-01-15 14:30:00', '2025-01-15 14:30:00']);
    
    await executeQuery(`
      INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, overall_rating, comments, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 2, 'Q2 2025', 4.3, 'Outstanding performance this quarter. Led the financial forecasting initiative with exceptional results. Demonstrates strong problem-solving abilities and excellent stakeholder management.', 'approved', '2025-06-10 11:45:00', '2025-06-10 11:45:00']);
    
    // 3. Insert Goals
    console.log('🎯 Inserting performance goals...');
    await executeQuery(`
      INSERT INTO performance_goals (employee_id, title, description, target_date, achievement_percentage, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 'Complete Financial Forecasting Model', 'Develop comprehensive 12-month financial forecasting model for the department with scenario analysis capabilities.', '2025-05-31', 95.00, 'completed', 2, '2025-03-20 09:00:00', '2025-03-20 09:00:00']);
    
    await executeQuery(`
      INSERT INTO performance_goals (employee_id, title, description, target_date, achievement_percentage, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 'Reduce Monthly Reporting Time by 25%', 'Streamline monthly financial reporting process through automation and process improvements.', '2025-06-30', 78.00, 'active', 2, '2025-03-25 14:30:00', '2025-03-25 14:30:00']);
    
    await executeQuery(`
      INSERT INTO performance_goals (employee_id, title, description, target_date, achievement_percentage, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 'Complete Advanced Excel Certification', 'Obtain Microsoft Excel Expert certification to enhance analytical capabilities and efficiency.', '2025-07-15', 65.00, 'active', 2, '2025-04-01 10:15:00', '2025-04-01 10:15:00']);
    
    await executeQuery(`
      INSERT INTO performance_goals (employee_id, title, description, target_date, achievement_percentage, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 'Lead Cost Analysis Project', 'Lead cross-departmental cost analysis initiative to identify 10% cost reduction opportunities.', '2025-08-31', 45.00, 'active', 2, '2025-04-15 11:00:00', '2025-04-15 11:00:00']);
    
    await executeQuery(`
      INSERT INTO performance_goals (employee_id, title, description, target_date, achievement_percentage, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 'Implement Budget Variance Dashboard', 'Create automated dashboard for real-time budget variance tracking and alerts.', '2025-06-15', 88.00, 'completed', 2, '2025-03-18 08:45:00', '2025-03-18 08:45:00']);
    
    await executeQuery(`
      INSERT INTO performance_goals (employee_id, title, description, target_date, achievement_percentage, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 'Mentor Junior Analyst', 'Provide mentorship and training to new junior financial analyst team member.', '2025-09-30', 72.00, 'active', 2, '2025-05-01 13:20:00', '2025-05-01 13:20:00']);
    
    // 4. Insert Leave Applications
    console.log('🏖️ Inserting leave applications...');
    await executeQuery(`
      INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, comments, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 1, '2025-04-14', '2025-04-18', 5, 'Family vacation - pre-planned spring break trip', 'approved', 2, '2025-04-01 10:30:00', 'Approved. Coverage arranged with team.', '2025-03-25 14:20:00', '2025-03-25 14:20:00']);
    
    await executeQuery(`
      INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, comments, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 2, '2025-05-22', '2025-05-23', 2, 'Medical appointment and recovery', 'approved', 2, '2025-05-21 16:45:00', 'Approved. Get well soon.', '2025-05-21 09:15:00', '2025-05-21 09:15:00']);
    
    await executeQuery(`
      INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, comments, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, 1, '2025-06-25', '2025-06-27', 3, 'Personal matters - family event', 'pending', null, null, null, '2025-06-10 11:30:00', '2025-06-10 11:30:00']);
    
    // 5. Insert Leave Balances
    console.log('📋 Inserting leave balances...');
    await executeQuery(`
      INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, remaining_days, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [employeeId, 1, 2025, 21, 5, 16]);
    
    await executeQuery(`
      INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, remaining_days, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [employeeId, 2, 2025, 10, 2, 8]);
    
    await executeQuery(`
      INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, remaining_days, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [employeeId, 3, 2025, 5, 0, 5]);
    
    console.log('✅ Basic data inserted successfully!');
    console.log('📅 Now inserting attendance records...');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

populateData();
