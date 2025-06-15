const { executeQuery } = require('../config/database');

async function populateAttendance() {
  try {
    console.log('📅 Starting attendance data population for Employee ID 3...');
    const employeeId = 3;
    
    // Analysis period: March 17, 2025 to June 15, 2025
    const startDate = new Date('2025-03-17');
    const endDate = new Date('2025-06-15');
    
    console.log(`📊 Generating attendance from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    const attendanceRecords = [];
    const currentDate = new Date(startDate);
    let totalWorkDays = 0;
    let attendanceDays = 0;
    
    while (currentDate <= endDate) {
      // Skip weekends (Sunday = 0, Saturday = 6)
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
    
    console.log(`📈 Generated ${attendanceRecords.length} attendance records out of ${totalWorkDays} work days`);
    console.log(`📊 Attendance Rate: ${((attendanceRecords.length/totalWorkDays)*100).toFixed(1)}%`);
    
    // Insert attendance records in batches
    console.log('💾 Inserting attendance records...');
    let insertedCount = 0;
    
    for (const record of attendanceRecords) {
      try {
        await executeQuery(`
          INSERT INTO attendance_records (employee_id, date, check_in_time, check_out_time, total_hours, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [employeeId, record.date, record.checkIn, record.checkOut, record.totalHours, record.status]);
        
        insertedCount++;
        
        if (insertedCount % 10 === 0) {
          console.log(`   Inserted ${insertedCount}/${attendanceRecords.length} records...`);
        }
      } catch (error) {
        console.error(`Error inserting record for ${record.date}:`, error.message);
      }
    }
    
    console.log('✅ Attendance data population completed!');
    console.log(`📊 Final Summary:`);
    console.log(`   - Total Work Days: ${totalWorkDays}`);
    console.log(`   - Attendance Records: ${insertedCount}`);
    console.log(`   - Attendance Rate: ${((insertedCount/totalWorkDays)*100).toFixed(1)}%`);
    console.log(`   - Average Hours: ${(attendanceRecords.reduce((sum, r) => sum + r.totalHours, 0) / attendanceRecords.length).toFixed(2)}`);
    console.log(`   - Late Days: ${attendanceRecords.filter(r => r.status === 'late').length}`);
    
    // Verify the data
    console.log('🔍 Verifying inserted data...');
    const verification = await executeQuery(`
      SELECT 
        COUNT(*) as total_records,
        AVG(total_hours) as avg_hours,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count
      FROM attendance_records 
      WHERE employee_id = ? AND date BETWEEN ? AND ?
    `, [employeeId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
    
    console.log('✅ Verification Results:', verification[0]);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

populateAttendance();
