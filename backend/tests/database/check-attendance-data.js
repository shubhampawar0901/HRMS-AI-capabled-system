// Check Attendance Data for Employee ID 3
require('dotenv').config();
const { executeQuery } = require('./config/database');

async function checkAttendanceData() {
  console.log('🔍 Checking Attendance Data for Employee ID 3...\n');
  
  try {
    // Check all attendance records for employee ID 3
    const allRecords = await executeQuery(
      'SELECT * FROM attendance WHERE employeeId = ? ORDER BY date DESC LIMIT 20',
      [3]
    );
    
    console.log(`📊 Total attendance records for Employee ID 3: ${allRecords.length}\n`);
    
    if (allRecords.length > 0) {
      console.log('📋 Recent Attendance Records:');
      allRecords.forEach((record, index) => {
        console.log(`${index + 1}. Date: ${record.date}`);
        console.log(`   Status: ${record.status}`);
        console.log(`   Hours: ${record.totalHours || 'N/A'}`);
        console.log(`   Check In: ${record.checkInTime || 'N/A'}`);
        console.log(`   Check Out: ${record.checkOutTime || 'N/A'}`);
        console.log('   ---');
      });
      
      // Check date ranges
      const dates = allRecords.map(r => new Date(r.date));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      console.log(`\n📅 Date Range: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`);
      
      // Check for May 2025 data specifically
      const may2025Records = allRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === 2025 && recordDate.getMonth() === 4; // May = month 4
      });
      
      console.log(`\n🗓️ May 2025 Records: ${may2025Records.length}`);
      if (may2025Records.length > 0) {
        console.log('May 2025 attendance:');
        may2025Records.forEach(record => {
          console.log(`   ${record.date}: ${record.status} (${record.totalHours || 0} hours)`);
        });
      }
      
      // Check for June 2025 data
      const june2025Records = allRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === 2025 && recordDate.getMonth() === 5; // June = month 5
      });
      
      console.log(`\n🗓️ June 2025 Records: ${june2025Records.length}`);
      if (june2025Records.length > 0) {
        console.log('June 2025 attendance:');
        june2025Records.forEach(record => {
          console.log(`   ${record.date}: ${record.status} (${record.totalHours || 0} hours)`);
        });
      }
      
      // Check for June 2024 data (the problematic data)
      const june2024Records = allRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === 2024 && recordDate.getMonth() === 5; // June = month 5
      });
      
      console.log(`\n🗓️ June 2024 Records: ${june2024Records.length}`);
      if (june2024Records.length > 0) {
        console.log('June 2024 attendance (this is the wrong data being returned):');
        june2024Records.forEach(record => {
          console.log(`   ${record.date}: ${record.status} (${record.totalHours || 0} hours)`);
        });
      }
      
    } else {
      console.log('❌ No attendance records found for Employee ID 3');
    }
    
    // Test the specific query that might be generated for "last month"
    console.log('\n🧪 Testing "Last Month" Query (May 2025):');
    const lastMonthQuery = `
      SELECT * FROM attendance 
      WHERE employeeId = ? 
        AND date >= '2025-05-01' 
        AND date <= '2025-05-31'
      ORDER BY date DESC
    `;
    
    const lastMonthResults = await executeQuery(lastMonthQuery, [3]);
    console.log(`Results: ${lastMonthResults.length} records`);
    
    if (lastMonthResults.length > 0) {
      lastMonthResults.forEach(record => {
        console.log(`   ${record.date}: ${record.status}`);
      });
    }
    
    // Test absence count for May 2025
    console.log('\n🧪 Testing Absence Count for May 2025:');
    const absenceQuery = `
      SELECT COUNT(CASE WHEN status = 'Absent' THEN 1 END) AS absent_days,
             COUNT(*) AS total_days
      FROM attendance 
      WHERE employeeId = ? 
        AND date >= '2025-05-01' 
        AND date <= '2025-05-31'
    `;
    
    const absenceResults = await executeQuery(absenceQuery, [3]);
    console.log(`Absence results:`, absenceResults[0]);
    
  } catch (error) {
    console.error('❌ Error checking attendance data:', error);
  }
}

// Run the check
if (require.main === module) {
  checkAttendanceData().catch(console.error);
}
