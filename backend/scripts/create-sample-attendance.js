const { executeQuery } = require('../config/database');

async function createSampleAttendance() {
  try {
    console.log('📅 Creating sample attendance data...');
    
    // Get all active employees
    const employees = await executeQuery('SELECT id, first_name, last_name FROM employees WHERE status = "active"');
    console.log(`👥 Found ${employees.length} active employees`);
    
    if (employees.length === 0) {
      console.log('❌ No active employees found. Please create employees first.');
      return;
    }
    
    // Create attendance for the last 3 months
    const currentDate = new Date();
    const months = [
      { month: currentDate.getMonth() + 1, year: currentDate.getFullYear() }, // Current month
      { month: currentDate.getMonth(), year: currentDate.getFullYear() }, // Last month
      { month: currentDate.getMonth() - 1, year: currentDate.getFullYear() } // 2 months ago
    ];
    
    // Handle year rollover
    months.forEach(period => {
      if (period.month <= 0) {
        period.month += 12;
        period.year -= 1;
      }
    });
    
    let totalRecords = 0;
    
    for (const employee of employees) {
      console.log(`📊 Creating attendance for ${employee.first_name} ${employee.last_name}...`);
      
      for (const period of months) {
        // Get working days in the month (excluding weekends)
        const workingDays = getWorkingDaysInMonth(period.month, period.year);
        
        // Create attendance for 85-95% of working days (realistic attendance)
        const attendanceRate = 0.85 + Math.random() * 0.1; // 85-95%
        const attendanceDays = Math.floor(workingDays.length * attendanceRate);
        
        // Randomly select which days the employee attended
        const shuffledDays = [...workingDays].sort(() => Math.random() - 0.5);
        const attendedDays = shuffledDays.slice(0, attendanceDays);
        
        for (const date of attendedDays) {
          // Generate realistic check-in/out times
          const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkInTime = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}:00`;
          
          const workHours = 8 + Math.random() * 2; // 8-10 hours
          const checkOutHour = checkInHour + Math.floor(workHours);
          const checkOutMinute = checkInMinute + Math.floor((workHours % 1) * 60);
          const checkOutTime = `${checkOutHour.toString().padStart(2, '0')}:${(checkOutMinute % 60).toString().padStart(2, '0')}:00`;
          
          // Determine status
          let status = 'present';
          if (checkInHour >= 9 && checkInMinute > 15) {
            status = 'late';
          }
          
          try {
            await executeQuery(`
              INSERT INTO attendance (
                employeeId, date, checkInTime, checkOutTime,
                totalHours, status, location, createdAt, updatedAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
              employee.id,
              date,
              checkInTime,
              checkOutTime,
              workHours.toFixed(2),
              status,
              'Office'
            ]);
            totalRecords++;
          } catch (error) {
            if (!error.message.includes('Duplicate entry')) {
              console.error(`❌ Error creating attendance for ${employee.first_name}: ${error.message}`);
            }
          }
        }
        
        console.log(`  ✅ ${period.month}/${period.year}: ${attendedDays.length} attendance records`);
      }
    }
    
    console.log(`🎉 Successfully created ${totalRecords} attendance records!`);
    
    // Show summary
    const summary = await executeQuery(`
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT employeeId) as employees_with_attendance,
        MIN(date) as earliest_date,
        MAX(date) as latest_date
      FROM attendance
    `);
    
    console.log('\n📊 Attendance Data Summary:');
    console.log(`Total Records: ${summary[0].total_records}`);
    console.log(`Employees with Attendance: ${summary[0].employees_with_attendance}`);
    console.log(`Date Range: ${summary[0].earliest_date} to ${summary[0].latest_date}`);
    
  } catch (error) {
    console.error('❌ Error creating sample attendance:', error);
  }
}

function getWorkingDaysInMonth(month, year) {
  const workingDays = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      workingDays.push(dateString);
    }
  }
  
  return workingDays;
}

// Run the script
if (require.main === module) {
  createSampleAttendance()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSampleAttendance };
