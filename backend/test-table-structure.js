const { executeQuery } = require('./config/database');

async function testTableStructure() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check all tables
    const tables = await executeQuery('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Check for attendance-related tables
    const attendanceTables = tables.filter(t => 
      Object.values(t)[0].toLowerCase().includes('attendance')
    );
    console.log('📅 Attendance tables:', attendanceTables);
    
    // Try to describe attendance table
    try {
      const attendanceStructure = await executeQuery('DESCRIBE attendance');
      console.log('📊 attendance table structure:', attendanceStructure);
    } catch (error) {
      console.log('❌ attendance table does not exist');
    }
    
    // Try to describe attendance_records table
    try {
      const attendanceRecordsStructure = await executeQuery('DESCRIBE attendance_records');
      console.log('📊 attendance_records table structure:', attendanceRecordsStructure);
    } catch (error) {
      console.log('❌ attendance_records table does not exist');
    }
    
    // Check employees table
    const employeesStructure = await executeQuery('DESCRIBE employees');
    console.log('👥 employees table structure:', employeesStructure);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testTableStructure();
