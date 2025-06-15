const { executeQuery } = require('../config/database');

/**
 * Comprehensive data population script for Employee ID 3 (John Doe)
 * Analysis Period: March 17, 2025 to June 15, 2025 (90 days)
 * 
 * This script will populate:
 * 1. Performance Reviews (3-4 reviews with ratings 3.5-4.5)
 * 2. Attendance Records (85-95% attendance rate, ~90 days)
 * 3. Performance Goals (5-8 goals with varied completion)
 * 4. Leave Applications (3-5 applications with different statuses)
 * 5. Leave Balances (proper allocation)
 */

async function populateEmployeeData() {
  try {
    console.log('🚀 Starting comprehensive data population for Employee ID 3 (John Doe)...');
    
    // Analysis period
    const startDate = new Date('2025-03-17');
    const endDate = new Date('2025-06-15');
    const employeeId = 3;
    
    // 1. Clear existing data for clean slate
    console.log('🧹 Cleaning existing data...');
    await executeQuery('DELETE FROM performance_reviews WHERE employee_id = ?', [employeeId]);
    await executeQuery('DELETE FROM attendance_records WHERE employee_id = ?', [employeeId]);
    await executeQuery('DELETE FROM performance_goals WHERE employee_id = ?', [employeeId]);
    await executeQuery('DELETE FROM leave_applications WHERE employee_id = ?', [employeeId]);
    await executeQuery('DELETE FROM leave_balances WHERE employee_id = ?', [employeeId]);
    
    // 2. Insert Performance Reviews
    console.log('📊 Inserting performance reviews...');
    const performanceReviews = [
      {
        reviewer_id: 2, // Manager
        review_period: 'Q1 2025',
        overall_rating: 4.2,
        comments: 'John demonstrates excellent analytical skills and consistently delivers high-quality financial reports. Shows strong attention to detail and proactive approach to identifying cost-saving opportunities. Recommended for advanced Excel training to enhance efficiency.',
        status: 'approved',
        created_at: '2025-04-01 10:00:00'
      },
      {
        reviewer_id: 2,
        review_period: 'Q4 2024',
        overall_rating: 3.8,
        comments: 'Solid performance in financial analysis with good understanding of company processes. Improved communication skills noted. Areas for development include presentation skills and cross-departmental collaboration.',
        status: 'approved',
        created_at: '2025-01-15 14:30:00'
      },
      {
        reviewer_id: 2,
        review_period: 'Mid-Year 2024',
        overall_rating: 4.0,
        comments: 'John has shown consistent improvement in his analytical capabilities. Successfully completed the budget variance analysis project ahead of schedule. Strong technical skills with room for growth in leadership areas.',
        status: 'approved',
        created_at: '2024-07-20 09:15:00'
      },
      {
        reviewer_id: 2,
        review_period: 'Q2 2025',
        overall_rating: 4.3,
        comments: 'Outstanding performance this quarter. Led the financial forecasting initiative with exceptional results. Demonstrates strong problem-solving abilities and excellent stakeholder management. Ready for increased responsibilities.',
        status: 'approved',
        created_at: '2025-06-10 11:45:00'
      }
    ];
    
    for (const review of performanceReviews) {
      await executeQuery(`
        INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, overall_rating, comments, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [employeeId, review.reviewer_id, review.review_period, review.overall_rating, review.comments, review.status, review.created_at, review.created_at]);
    }
    
    // 3. Insert Attendance Records (90 days with 88% attendance rate)
    console.log('📅 Inserting attendance records...');
    const attendanceRecords = [];
    const currentDate = new Date(startDate);
    let attendanceDays = 0;
    let totalWorkDays = 0;
    
    while (currentDate <= endDate) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        totalWorkDays++;
        
        // 88% attendance rate - randomly skip some days
        const shouldAttend = Math.random() < 0.88;
        
        if (shouldAttend) {
          attendanceDays++;
          
          // Generate realistic check-in/out times
          const baseCheckIn = 9; // 9 AM base
          const checkInVariation = (Math.random() - 0.5) * 1; // ±30 minutes
          const checkInHour = Math.max(8, Math.min(10, baseCheckIn + checkInVariation));
          const checkInMinute = Math.floor(Math.random() * 60);
          
          const workHours = 8 + (Math.random() - 0.5) * 2; // 7-9 hours
          const checkOutHour = Math.floor(checkInHour + workHours);
          const checkOutMinute = Math.floor((checkInHour + workHours - checkOutHour) * 60);
          
          const checkInTime = `${String(Math.floor(checkInHour)).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}:00`;
          const checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}:00`;
          
          const status = checkInHour > 9.25 ? 'late' : 'present';
          const totalHours = parseFloat((workHours).toFixed(2));
          
          attendanceRecords.push({
            date: currentDate.toISOString().split('T')[0],
            checkIn: checkInTime,
            checkOut: checkOutTime,
            totalHours: totalHours,
            status: status
          });
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`📈 Generated ${attendanceRecords.length} attendance records out of ${totalWorkDays} work days (${((attendanceRecords.length/totalWorkDays)*100).toFixed(1)}% attendance)`);
    
    for (const record of attendanceRecords) {
      await executeQuery(`
        INSERT INTO attendance_records (employee_id, date, check_in_time, check_out_time, total_hours, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [employeeId, record.date, record.checkIn, record.checkOut, record.totalHours, record.status]);
    }

    // 4. Insert Performance Goals
    console.log('🎯 Inserting performance goals...');
    const performanceGoals = [
      {
        title: 'Complete Financial Forecasting Model',
        description: 'Develop comprehensive 12-month financial forecasting model for the department with scenario analysis capabilities.',
        target_date: '2025-05-31',
        achievement_percentage: 95.00,
        status: 'completed',
        created_by: 2,
        created_at: '2025-03-20 09:00:00'
      },
      {
        title: 'Reduce Monthly Reporting Time by 25%',
        description: 'Streamline monthly financial reporting process through automation and process improvements.',
        target_date: '2025-06-30',
        achievement_percentage: 78.00,
        status: 'active',
        created_by: 2,
        created_at: '2025-03-25 14:30:00'
      },
      {
        title: 'Complete Advanced Excel Certification',
        description: 'Obtain Microsoft Excel Expert certification to enhance analytical capabilities and efficiency.',
        target_date: '2025-07-15',
        achievement_percentage: 65.00,
        status: 'active',
        created_by: 2,
        created_at: '2025-04-01 10:15:00'
      },
      {
        title: 'Lead Cost Analysis Project',
        description: 'Lead cross-departmental cost analysis initiative to identify 10% cost reduction opportunities.',
        target_date: '2025-08-31',
        achievement_percentage: 45.00,
        status: 'active',
        created_by: 2,
        created_at: '2025-04-15 11:00:00'
      },
      {
        title: 'Implement Budget Variance Dashboard',
        description: 'Create automated dashboard for real-time budget variance tracking and alerts.',
        target_date: '2025-06-15',
        achievement_percentage: 88.00,
        status: 'completed',
        created_by: 2,
        created_at: '2025-03-18 08:45:00'
      },
      {
        title: 'Mentor Junior Analyst',
        description: 'Provide mentorship and training to new junior financial analyst team member.',
        target_date: '2025-09-30',
        achievement_percentage: 72.00,
        status: 'active',
        created_by: 2,
        created_at: '2025-05-01 13:20:00'
      },
      {
        title: 'Improve Stakeholder Communication',
        description: 'Enhance presentation skills and stakeholder communication through training and practice.',
        target_date: '2025-07-31',
        achievement_percentage: 60.00,
        status: 'active',
        created_by: 2,
        created_at: '2025-04-10 16:00:00'
      }
    ];

    for (const goal of performanceGoals) {
      await executeQuery(`
        INSERT INTO performance_goals (employee_id, title, description, target_date, achievement_percentage, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [employeeId, goal.title, goal.description, goal.target_date, goal.achievement_percentage, goal.status, goal.created_by, goal.created_at, goal.created_at]);
    }

    // 5. Insert Leave Applications
    console.log('🏖️ Inserting leave applications...');
    const leaveApplications = [
      {
        leave_type_id: 1, // Annual Leave
        start_date: '2025-04-14',
        end_date: '2025-04-18',
        total_days: 5,
        reason: 'Family vacation - pre-planned spring break trip',
        status: 'approved',
        approved_by: 2,
        approved_at: '2025-04-01 10:30:00',
        comments: 'Approved. Coverage arranged with team.',
        created_at: '2025-03-25 14:20:00'
      },
      {
        leave_type_id: 2, // Sick Leave
        start_date: '2025-05-22',
        end_date: '2025-05-23',
        total_days: 2,
        reason: 'Medical appointment and recovery',
        status: 'approved',
        approved_by: 2,
        approved_at: '2025-05-21 16:45:00',
        comments: 'Approved. Get well soon.',
        created_at: '2025-05-21 09:15:00'
      },
      {
        leave_type_id: 1, // Annual Leave
        start_date: '2025-06-25',
        end_date: '2025-06-27',
        total_days: 3,
        reason: 'Personal matters - family event',
        status: 'pending',
        approved_by: null,
        approved_at: null,
        comments: null,
        created_at: '2025-06-10 11:30:00'
      },
      {
        leave_type_id: 3, // Personal Leave
        start_date: '2025-07-08',
        end_date: '2025-07-08',
        total_days: 1,
        reason: 'Personal appointment',
        status: 'rejected',
        approved_by: 2,
        approved_at: '2025-06-12 09:00:00',
        comments: 'Rejected due to critical project deadline. Please reschedule.',
        created_at: '2025-06-05 15:45:00'
      }
    ];

    for (const leave of leaveApplications) {
      await executeQuery(`
        INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, comments, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [employeeId, leave.leave_type_id, leave.start_date, leave.end_date, leave.total_days, leave.reason, leave.status, leave.approved_by, leave.approved_at, leave.comments, leave.created_at, leave.created_at]);
    }

    // 6. Insert Leave Balances
    console.log('📋 Inserting leave balances...');
    const leaveBalances = [
      {
        leave_type_id: 1, // Annual Leave
        year: 2025,
        allocated_days: 21,
        used_days: 5,
        remaining_days: 16
      },
      {
        leave_type_id: 2, // Sick Leave
        year: 2025,
        allocated_days: 10,
        used_days: 2,
        remaining_days: 8
      },
      {
        leave_type_id: 3, // Personal Leave
        year: 2025,
        allocated_days: 5,
        used_days: 0,
        remaining_days: 5
      }
    ];

    for (const balance of leaveBalances) {
      await executeQuery(`
        INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, remaining_days, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [employeeId, balance.leave_type_id, balance.year, balance.allocated_days, balance.used_days, balance.remaining_days]);
    }

    console.log('✅ Data population completed successfully!');
    console.log(`📊 Summary for Employee ID ${employeeId}:`);
    console.log(`   - Performance Reviews: ${performanceReviews.length}`);
    console.log(`   - Attendance Records: ${attendanceRecords.length}`);
    console.log(`   - Performance Goals: ${performanceGoals.length}`);
    console.log(`   - Leave Applications: ${leaveApplications.length}`);
    console.log(`   - Leave Balances: ${leaveBalances.length}`);
    console.log(`   - Work Days in Period: ${totalWorkDays}`);
    console.log(`   - Attendance Rate: ${((attendanceRecords.length/totalWorkDays)*100).toFixed(1)}%`);
    console.log(`   - Average Goal Achievement: ${(performanceGoals.reduce((sum, g) => sum + g.achievement_percentage, 0) / performanceGoals.length).toFixed(1)}%`);

    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error populating data:', error);
    process.exit(1);
  }
}

// Run the script
populateEmployeeData();
