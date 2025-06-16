const { executeQuery } = require('./config/database');

async function testQuery() {
  try {
    console.log('Testing database connection...');
    
    // Test departments
    const departments = await executeQuery('SELECT * FROM departments WHERE is_active = 1');
    console.log('Departments found:', departments.length);
    console.log('Departments:', departments);
    
    // Test employees with department join
    const employees = await executeQuery(`
      SELECT e.*, d.name as department_name,
             CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.status != 'deleted' AND e.status = 'active'
      LIMIT 5
    `);
    console.log('Employees found:', employees.length);
    console.log('Employees with departments:', employees);
    
    // Check specific employee data
    if (employees.length > 0) {
      console.log('\nFirst employee details:');
      console.log('- ID:', employees[0].id);
      console.log('- Name:', employees[0].first_name, employees[0].last_name);
      console.log('- Department ID:', employees[0].department_id);
      console.log('- Department Name:', employees[0].department_name);
    }
    
  } catch (error) {
    console.error('Database test error:', error);
  }
  process.exit(0);
}

testQuery();
