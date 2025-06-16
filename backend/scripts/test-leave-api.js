const { executeQuery } = require('../config/database');
const LeaveApplication = require('../models/LeaveApplication');

async function testLeaveAPI() {
  try {
    console.log('🧪 Testing Leave API for Manager ID 2...\n');
    
    // 1. Test direct database query
    console.log('1️⃣ Direct database query:');
    const directQuery = await executeQuery(`
      SELECT la.*,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             lt.name as leave_type_name
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE e.manager_id = 2
      ORDER BY la.created_at DESC
    `);
    console.log(`Found ${directQuery.length} applications via direct query`);
    directQuery.forEach(app => {
      console.log(`   - ${app.employee_name}: ${app.leave_type_name} (${app.status})`);
    });
    
    // 2. Test LeaveApplication.findByManager method
    console.log('\n2️⃣ Testing LeaveApplication.findByManager method:');
    const managerApplications = await LeaveApplication.findByManager(2, {});
    console.log(`Found ${managerApplications.length} applications via model method`);
    managerApplications.forEach(app => {
      console.log(`   - ${app.employee_name}: ${app.leave_type_name} (${app.status})`);
    });
    
    // 3. Test with status filter
    console.log('\n3️⃣ Testing with status filter (pending):');
    const pendingApplications = await LeaveApplication.findByManager(2, { status: 'pending' });
    console.log(`Found ${pendingApplications.length} pending applications`);
    pendingApplications.forEach(app => {
      console.log(`   - ${app.employee_name}: ${app.leave_type_name} (${app.status})`);
    });
    
    // 4. Test count method
    console.log('\n4️⃣ Testing count method:');
    const totalCount = await LeaveApplication.countByManager(2, {});
    console.log(`Total count: ${totalCount}`);
    
    const pendingCount = await LeaveApplication.countByManager(2, { status: 'pending' });
    console.log(`Pending count: ${pendingCount}`);
    
    // 5. Test pagination
    console.log('\n5️⃣ Testing pagination:');
    const paginatedApplications = await LeaveApplication.findByManager(2, {
      page: 1,
      limit: 10
    });
    console.log(`Found ${paginatedApplications.length} applications with pagination`);
    
    // 6. Check if the issue is in the controller logic
    console.log('\n6️⃣ Simulating controller logic:');
    const managerId = 2;
    const role = 'manager';
    const options = {
      status: undefined, // This simulates 'all' status
      page: 1,
      limit: 20
    };
    
    let applications;
    let total;
    
    if (role === 'admin') {
      applications = await LeaveApplication.findAll(options);
      total = await LeaveApplication.count(options);
    } else {
      applications = await LeaveApplication.findByManager(managerId, options);
      total = await LeaveApplication.countByManager(managerId, options);
    }
    
    console.log(`Controller simulation - Found ${applications.length} applications, total: ${total}`);
    
    // 7. Test with different status values
    console.log('\n7️⃣ Testing different status values:');
    const statusTests = ['pending', 'approved', 'rejected', 'all', undefined, null];
    
    for (const status of statusTests) {
      const testOptions = { status: status && status !== 'all' ? status : undefined };
      const results = await LeaveApplication.findByManager(2, testOptions);
      console.log(`   Status '${status}': ${results.length} applications`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLeaveAPI()
  .then(() => {
    console.log('\n✅ Test completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
