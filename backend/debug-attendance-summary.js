const { executeQuery } = require('./config/database');
const { Attendance } = require('./models');

async function debugAttendanceSummary() {
  try {
    const employeeId = 28; // Change this to the employee you're testing
    const month = 6;       // June
    const year = 2025;
    
    console.log('🔍 Debugging attendance summary...');
    console.log(`Employee ID: ${employeeId}, Month: ${month}, Year: ${year}`);
    
    // Step 1: Check raw attendance records for this employee/month
    console.log('\n📋 Step 1: Raw attendance records for this period...');
    const rawRecords = await executeQuery(`
      SELECT 
        id, employeeId, date, checkInTime, checkOutTime, 
        totalHours, status, location, createdAt
      FROM attendance 
      WHERE employeeId = ? AND MONTH(date) = ? AND YEAR(date) = ?
      ORDER BY date
    `, [employeeId, month, year]);
    
    console.log(`Found ${rawRecords.length} attendance records:`);
    rawRecords.forEach(record => {
      console.log(`  ${record.date}: ${record.status}, Hours: ${record.totalHours}, In: ${record.checkInTime}, Out: ${record.checkOutTime}`);
    });
    
    // Step 2: Test the getSummary method
    console.log('\n📋 Step 2: Testing Attendance.getSummary()...');
    const summary = await Attendance.getSummary(employeeId, month, year);
    console.log('Summary result:', summary);
    
    // Step 3: Manual calculation verification
    console.log('\n📋 Step 3: Manual calculation verification...');
    const presentDays = rawRecords.filter(r => r.status === 'present').length;
    const absentDays = rawRecords.filter(r => r.status === 'absent').length;
    const lateDays = rawRecords.filter(r => r.status === 'late').length;
    const halfDays = rawRecords.filter(r => r.status === 'half_day').length;
    const totalHours = rawRecords.reduce((sum, r) => sum + (parseFloat(r.totalHours) || 0), 0);
    const avgHours = rawRecords.length > 0 ? totalHours / rawRecords.length : 0;
    
    console.log('Manual calculations:');
    console.log(`  Total records: ${rawRecords.length}`);
    console.log(`  Present days: ${presentDays}`);
    console.log(`  Absent days: ${absentDays}`);
    console.log(`  Late days: ${lateDays}`);
    console.log(`  Half days: ${halfDays}`);
    console.log(`  Total hours: ${totalHours.toFixed(2)}`);
    console.log(`  Average hours: ${avgHours.toFixed(2)}`);
    
    // Step 4: Check overtime calculation
    console.log('\n📋 Step 4: Overtime calculation analysis...');
    const standardHoursPerDay = 8;
    let totalOvertimeHours = 0;
    
    rawRecords.forEach(record => {
      const dailyHours = parseFloat(record.totalHours) || 0;
      const overtime = Math.max(0, dailyHours - standardHoursPerDay);
      if (overtime > 0) {
        console.log(`  ${record.date}: ${dailyHours}h worked, ${overtime.toFixed(2)}h overtime`);
        totalOvertimeHours += overtime;
      }
    });
    
    console.log(`Total overtime hours: ${totalOvertimeHours.toFixed(2)}`);
    
    // Step 5: Check working days for the month
    console.log('\n📋 Step 5: Working days calculation...');
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    
    console.log(`Working days in ${month}/${year}: ${workingDays}`);
    console.log(`Attendance rate: ${((presentDays + lateDays) / workingDays * 100).toFixed(1)}%`);
    
    // Step 6: Check if there are records from other months
    console.log('\n📋 Step 6: Check for records from other months...');
    const allRecords = await executeQuery(`
      SELECT 
        YEAR(date) as year, MONTH(date) as month, COUNT(*) as count,
        SUM(totalHours) as total_hours
      FROM attendance 
      WHERE employeeId = ?
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY year, month
    `, [employeeId]);
    
    console.log('Records by month:');
    allRecords.forEach(record => {
      console.log(`  ${record.month}/${record.year}: ${record.count} records, ${record.total_hours} total hours`);
    });
    
    // Step 7: Final recommendation
    console.log('\n🎯 Analysis Summary:');
    if (summary.total_hours > 100) {
      console.log('⚠️  WARNING: Total hours seems very high for one month');
      console.log('   This might indicate data from multiple months or incorrect calculation');
    }
    
    if (summary.present_days > workingDays) {
      console.log('⚠️  WARNING: Present days exceeds working days in month');
      console.log('   This might indicate duplicate records or data from multiple months');
    }
    
    if (summary.total_days === 0) {
      console.log('⚠️  WARNING: No attendance records found for this period');
      console.log('   Payroll calculation will use default values');
    }
    
  } catch (error) {
    console.error('❌ Error during attendance debug:', error);
  }
  
  process.exit(0);
}

debugAttendanceSummary();
