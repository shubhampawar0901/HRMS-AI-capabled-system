const Employee = require('./models/Employee');

async function testEmployeeModel() {
  try {
    console.log('Testing Employee model...');
    
    // Test Employee.findAll method
    const employees = await Employee.findAll({ limit: 3 });
    console.log('Employees found:', employees.length);
    
    if (employees.length > 0) {
      console.log('\nFirst employee from model:');
      const firstEmployee = employees[0];
      console.log('- ID:', firstEmployee.id);
      console.log('- Name:', firstEmployee.firstName, firstEmployee.lastName);
      console.log('- Department ID:', firstEmployee.departmentId);
      console.log('- Department Name:', firstEmployee.departmentName);
      console.log('- Position:', firstEmployee.position);
      console.log('- Email:', firstEmployee.email);
      
      console.log('\nFull employee object:');
      console.log(JSON.stringify(firstEmployee, null, 2));
    }
    
  } catch (error) {
    console.error('Employee model test error:', error);
  }
  process.exit(0);
}

testEmployeeModel();
