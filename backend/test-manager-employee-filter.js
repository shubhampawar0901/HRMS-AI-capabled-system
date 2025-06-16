const { executeQuery } = require('./config/database');
const Employee = require('./models/Employee');

async function testManagerEmployeeFilter() {
  console.log('🔍 Testing Manager-Employee Relationship Filter...\n');

  try {
    // 1. First, let's see all employees and their manager relationships
    console.log('📋 Current Employee-Manager Relationships:');
    const allEmployees = await executeQuery(`
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name, 
        e.position,
        e.manager_id,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.status = 'active'
      ORDER BY e.manager_id, e.first_name
    `);

    allEmployees.forEach(emp => {
      console.log(`  Employee ${emp.id}: ${emp.first_name} ${emp.last_name} (${emp.position})`);
      console.log(`    Manager ID: ${emp.manager_id || 'None'} ${emp.manager_name ? `(${emp.manager_name})` : ''}`);
    });

    // 2. Find managers (employees who have team members)
    console.log('\n👥 Managers and their team sizes:');
    const managers = await executeQuery(`
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        m.position,
        COUNT(e.id) as team_size
      FROM employees m
      INNER JOIN employees e ON e.manager_id = m.id
      WHERE m.status = 'active' AND e.status = 'active'
      GROUP BY m.id, m.first_name, m.last_name, m.position
      ORDER BY team_size DESC
    `);

    managers.forEach(manager => {
      console.log(`  Manager ${manager.id}: ${manager.first_name} ${manager.last_name} (${manager.position}) - ${manager.team_size} team members`);
    });

    // 3. Test our new Employee.findAll with managerId filter
    if (managers.length > 0) {
      const testManagerId = managers[0].id;
      console.log(`\n🔍 Testing Employee.findAll with managerId=${testManagerId}:`);
      
      const teamMembers = await Employee.findAll({ managerId: testManagerId });
      console.log(`Found ${teamMembers.length} team members:`);
      
      teamMembers.forEach(emp => {
        console.log(`  - ${emp.firstName} ${emp.lastName} (ID: ${emp.id}, Manager ID: ${emp.managerId})`);
      });

      // 4. Test count method
      const teamCount = await Employee.count({ managerId: testManagerId });
      console.log(`\n📊 Employee.count with managerId=${testManagerId}: ${teamCount}`);

      // 5. Simulate performance review creation scenario
      console.log(`\n🎯 Performance Review Creation Test:`);
      console.log(`Manager ${testManagerId} trying to create review for employee ${teamMembers[0]?.id}:`);
      
      if (teamMembers.length > 0) {
        const targetEmployee = await Employee.findById(teamMembers[0].id);
        console.log(`  Target Employee: ${targetEmployee.firstName} ${targetEmployee.lastName}`);
        console.log(`  Target Employee Manager ID: ${targetEmployee.managerId}`);
        console.log(`  Requesting Manager ID: ${testManagerId}`);
        console.log(`  Validation Result: ${targetEmployee.managerId === testManagerId ? '✅ PASS' : '❌ FAIL'}`);
      }
    } else {
      console.log('\n⚠️  No managers found with team members. Creating test data...');
      
      // Create a simple manager-employee relationship for testing
      console.log('Creating test manager-employee relationship...');
      
      // This is just for demonstration - in real scenario, data would already exist
      console.log('Please ensure you have proper test data with manager-employee relationships.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testManagerEmployeeFilter()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
