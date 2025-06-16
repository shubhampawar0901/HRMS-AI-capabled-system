// Clear require cache to ensure we get the updated model
delete require.cache[require.resolve('../models/LeaveApplication')];

const { executeQuery } = require('../config/database');
const LeaveApplication = require('../models/LeaveApplication');

async function testFixedModel() {
  try {
    console.log('🧪 Testing FIXED LeaveApplication model...\n');
    
    // Test the findByManager method with the fixed constructor
    console.log('1️⃣ Testing LeaveApplication.findByManager with fixed constructor:');
    const managerApplications = await LeaveApplication.findByManager(2, {});
    console.log(`Found ${managerApplications.length} applications`);
    
    managerApplications.forEach((app, index) => {
      console.log(`   ${index + 1}. Employee: ${app.employeeName || 'undefined'}`);
      console.log(`      Leave Type: ${app.leaveTypeName || 'undefined'}`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Employee Code: ${app.employeeCode || 'undefined'}`);
      console.log(`      Dates: ${app.startDate} to ${app.endDate}`);
      console.log(`      Reason: ${app.reason}`);
      console.log('');
    });
    
    // Test with pending status filter
    console.log('2️⃣ Testing with pending status filter:');
    const pendingApplications = await LeaveApplication.findByManager(2, { status: 'pending' });
    console.log(`Found ${pendingApplications.length} pending applications`);
    
    pendingApplications.forEach((app, index) => {
      console.log(`   ${index + 1}. ${app.employeeName} - ${app.leaveTypeName} (${app.status})`);
    });
    
    // Test the controller response format
    console.log('\n3️⃣ Testing controller response format:');
    const applications = await LeaveApplication.findByManager(2, { page: 1, limit: 10 });
    const total = await LeaveApplication.countByManager(2, {});
    
    const responseData = {
      applications: applications,
      pagination: {
        page: 1,
        limit: 10,
        total: total,
        pages: Math.ceil(total / 10)
      }
    };
    
    console.log('Response data structure:');
    console.log('- Total applications:', responseData.applications.length);
    console.log('- Pagination:', responseData.pagination);
    console.log('- Sample application data:');
    if (responseData.applications.length > 0) {
      const sample = responseData.applications[0];
      console.log('  * ID:', sample.id);
      console.log('  * Employee Name:', sample.employeeName);
      console.log('  * Employee Code:', sample.employeeCode);
      console.log('  * Leave Type:', sample.leaveTypeName);
      console.log('  * Status:', sample.status);
      console.log('  * Start Date:', sample.startDate);
      console.log('  * End Date:', sample.endDate);
      console.log('  * Total Days:', sample.totalDays);
      console.log('  * Reason:', sample.reason);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFixedModel()
  .then(() => {
    console.log('\n✅ Fixed model test completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fixed model test failed:', error);
    process.exit(1);
  });
