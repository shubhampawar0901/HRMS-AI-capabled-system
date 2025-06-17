const { executeQuery } = require('./config/database');
const { Employee, Attendance } = require('./models');

// Helper function to calculate working days in a month (excluding weekends)
const getWorkingDaysInMonth = (month, year) => {
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
  
  return workingDays;
};

async function testCorrectedCalculation() {
  try {
    const employeeId = 28;
    const month = 6;
    const year = 2025;
    
    console.log('🧪 Testing corrected payroll calculation...');
    console.log(`Employee ID: ${employeeId}, Month: ${month}, Year: ${year}`);
    
    // Get employee
    const employee = await Employee.findById(employeeId);
    console.log(`Employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`Basic Salary: ₹${employee.basicSalary}`);
    
    // Get attendance data
    const attendanceData = await Attendance.getSummary(employeeId, month, year);
    console.log('\nAttendance Data:', attendanceData);
    
    // Calculate working days for June 2025
    const workingDays = getWorkingDaysInMonth(month, year);
    console.log(`\nWorking days in ${month}/${year}: ${workingDays}`);
    
    // Corrected calculation
    const basicSalary = parseFloat(employee.basicSalary) || 0;
    let presentDays = parseInt(attendanceData?.present_days) || 0;
    let lateDays = parseInt(attendanceData?.late_days) || 0;
    let halfDays = parseInt(attendanceData?.half_days) || 0;
    
    const totalAttendanceDays = presentDays + lateDays + halfDays;
    const absentDays = Math.max(0, workingDays - totalAttendanceDays);
    
    console.log('\n📊 CORRECTED CALCULATIONS:');
    console.log(`Present Days: ${presentDays}`);
    console.log(`Late Days: ${lateDays}`);
    console.log(`Half Days: ${halfDays}`);
    console.log(`Total Attendance Days: ${totalAttendanceDays}`);
    console.log(`Absent Days: ${absentDays}`);
    
    // Overtime calculation
    const totalHours = parseFloat(attendanceData?.total_hours) || 0;
    const standardHours = totalAttendanceDays * 8;
    const overtimeHours = Math.max(0, totalHours - standardHours);
    
    console.log(`\nTotal Hours Worked: ${totalHours}`);
    console.log(`Standard Hours (${totalAttendanceDays} days × 8h): ${standardHours}`);
    console.log(`Overtime Hours: ${overtimeHours.toFixed(2)}`);
    
    // Salary calculation
    const dailySalary = basicSalary / workingDays;
    const absenceDeduction = dailySalary * absentDays;
    const fullBasicSalary = basicSalary;
    const hra = fullBasicSalary * 0.4;
    const transportAllowance = 2000;
    const overtimePay = overtimeHours * (dailySalary / 8) * 1.5;
    const grossSalary = fullBasicSalary + hra + transportAllowance + overtimePay;
    const pfDeduction = fullBasicSalary * 0.12;
    const taxDeduction = grossSalary > 50000 ? grossSalary * 0.1 : 0;
    const totalDeductions = pfDeduction + taxDeduction + absenceDeduction;
    const netSalary = grossSalary - totalDeductions;
    
    console.log('\n💰 SALARY BREAKDOWN:');
    console.log(`Basic Salary (Full): ₹${fullBasicSalary.toFixed(2)}`);
    console.log(`HRA (40%): ₹${hra.toFixed(2)}`);
    console.log(`Transport Allowance: ₹${transportAllowance.toFixed(2)}`);
    console.log(`Overtime Pay: ₹${overtimePay.toFixed(2)}`);
    console.log(`Gross Salary: ₹${grossSalary.toFixed(2)}`);
    console.log(`\nDEDUCTIONS:`);
    console.log(`PF (12%): ₹${pfDeduction.toFixed(2)}`);
    console.log(`Tax: ₹${taxDeduction.toFixed(2)}`);
    console.log(`Absence Deduction (${absentDays} days): ₹${absenceDeduction.toFixed(2)}`);
    console.log(`Total Deductions: ₹${totalDeductions.toFixed(2)}`);
    console.log(`\nNET SALARY: ₹${netSalary.toFixed(2)}`);
    
    // Attendance rate
    const attendanceRate = (totalAttendanceDays / workingDays) * 100;
    console.log(`\nAttendance Rate: ${attendanceRate.toFixed(1)}%`);
    
    console.log('\n✅ This should match the UI preview!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testCorrectedCalculation();
