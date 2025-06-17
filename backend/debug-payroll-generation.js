const { executeQuery } = require('./config/database');
const { Payroll, Employee, Attendance } = require('./models');

async function debugPayrollGeneration() {
  try {
    const employeeId = 28;
    const month = 6;
    const year = 2025;
    
    console.log('🔍 Debugging payroll generation...');
    console.log(`Employee ID: ${employeeId}, Month: ${month}, Year: ${year}`);
    
    // Step 1: Check if employee exists
    console.log('\n📋 Step 1: Checking employee...');
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      console.error('❌ Employee not found');
      return;
    }
    console.log('✅ Employee found:', {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      basicSalary: employee.basicSalary,
      status: employee.status
    });
    
    // Step 2: Check if payroll already exists
    console.log('\n📋 Step 2: Checking existing payroll...');
    const existing = await Payroll.findByEmployeeAndPeriod(employeeId, month, year);
    if (existing) {
      console.error('❌ Payroll already exists for this period');
      console.log('Existing payroll:', existing);
      return;
    }
    console.log('✅ No existing payroll found');
    
    // Step 3: Get attendance data
    console.log('\n📋 Step 3: Getting attendance data...');
    const attendanceData = await Attendance.getSummary(employeeId, month, year);
    console.log('Attendance data:', attendanceData);
    
    // Step 4: Test payroll calculation
    console.log('\n📋 Step 4: Testing payroll calculation...');
    const PayrollController = require('./controllers/PayrollController');
    const payrollData = await PayrollController.calculatePayroll(employee, attendanceData, month, year);
    console.log('Calculated payroll data:', payrollData);
    
    // Step 5: Test payroll creation
    console.log('\n📋 Step 5: Testing payroll creation...');
    const payrollRecord = {
      employeeId,
      month,
      year,
      ...payrollData,
      status: 'draft'
    };
    console.log('Payroll record to create:', payrollRecord);
    
    // Try to create the payroll
    const payroll = await Payroll.create(payrollRecord);
    console.log('✅ Payroll created successfully:', payroll);
    
  } catch (error) {
    console.error('❌ Error during payroll generation debug:', error);
    console.error('Error stack:', error.stack);
    
    // Check specific error types
    if (error.code) {
      console.error('Database error code:', error.code);
      console.error('SQL State:', error.sqlState);
      console.error('SQL Message:', error.sqlMessage);
    }
  }
  
  process.exit(0);
}

// Also test attendance table structure
async function testAttendanceTable() {
  try {
    console.log('\n🔍 Testing attendance table structure...');
    
    // Check if attendance table exists
    try {
      const attendanceStructure = await executeQuery('DESCRIBE attendance');
      console.log('✅ attendance table structure:', attendanceStructure);
    } catch (error) {
      console.log('❌ attendance table error:', error.message);
    }
    
    // Check if attendance_records table exists
    try {
      const attendanceRecordsStructure = await executeQuery('DESCRIBE attendance_records');
      console.log('✅ attendance_records table structure:', attendanceRecordsStructure);
    } catch (error) {
      console.log('❌ attendance_records table error:', error.message);
    }
    
    // Test attendance query
    try {
      const testQuery = await executeQuery(`
        SELECT COUNT(*) as count FROM attendance WHERE employeeId = ?
      `, [28]);
      console.log('✅ attendance query test:', testQuery);
    } catch (error) {
      console.log('❌ attendance query error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Attendance table test error:', error);
  }
}

// Run both tests
async function runAllTests() {
  await testAttendanceTable();
  await debugPayrollGeneration();
}

runAllTests();
