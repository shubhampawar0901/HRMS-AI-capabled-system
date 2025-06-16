// Clear require cache to ensure we get the updated model
delete require.cache[require.resolve('../models/LeaveApplication')];
delete require.cache[require.resolve('../controllers/LeaveController')];

const LeaveController = require('../controllers/LeaveController');

async function testAPIResponse() {
  try {
    console.log('🧪 Testing Leave API Response for Manager ID 2...\n');
    
    // Mock request object for manager ID 2
    const mockReq = {
      user: {
        role: 'manager',
        employeeId: 2,
        userId: 2
      },
      query: {
        status: 'pending',
        page: 1,
        limit: 20
      }
    };
    
    // Mock response object
    let responseData = null;
    let statusCode = null;
    
    const mockRes = {
      status: (code) => {
        statusCode = code;
        return mockRes;
      },
      json: (data) => {
        responseData = data;
        return mockRes;
      }
    };
    
    console.log('1️⃣ Testing getTeamLeaveApplications controller method...');
    
    // Call the controller method
    await LeaveController.getTeamLeaveApplications(mockReq, mockRes);
    
    console.log('Response Status Code:', statusCode);
    console.log('Response Data:', JSON.stringify(responseData, null, 2));
    
    if (responseData && responseData.success) {
      console.log('\n✅ API Response Analysis:');
      console.log(`- Success: ${responseData.success}`);
      console.log(`- Message: ${responseData.message}`);
      console.log(`- Applications Count: ${responseData.data.applications.length}`);
      console.log(`- Total: ${responseData.data.pagination.total}`);
      
      if (responseData.data.applications.length > 0) {
        console.log('\n📋 Sample Application Data:');
        const sample = responseData.data.applications[0];
        console.log(`- ID: ${sample.id}`);
        console.log(`- Employee Name: ${sample.employeeName}`);
        console.log(`- Employee Code: ${sample.employeeCode}`);
        console.log(`- Leave Type: ${sample.leaveTypeName}`);
        console.log(`- Status: ${sample.status}`);
        console.log(`- Start Date: ${sample.startDate}`);
        console.log(`- End Date: ${sample.endDate}`);
        console.log(`- Reason: ${sample.reason}`);
      }
    } else {
      console.log('\n❌ API Response Issues:');
      console.log('- Response:', responseData);
    }
    
    // Test with 'all' status
    console.log('\n2️⃣ Testing with "all" status...');
    mockReq.query.status = 'all';
    
    responseData = null;
    statusCode = null;
    
    await LeaveController.getTeamLeaveApplications(mockReq, mockRes);
    
    console.log('Response Status Code:', statusCode);
    if (responseData && responseData.success) {
      console.log(`- Applications Count (all): ${responseData.data.applications.length}`);
      console.log(`- Total (all): ${responseData.data.pagination.total}`);
    }
    
    // Test with no status filter
    console.log('\n3️⃣ Testing with no status filter...');
    delete mockReq.query.status;
    
    responseData = null;
    statusCode = null;
    
    await LeaveController.getTeamLeaveApplications(mockReq, mockRes);
    
    console.log('Response Status Code:', statusCode);
    if (responseData && responseData.success) {
      console.log(`- Applications Count (no filter): ${responseData.data.applications.length}`);
      console.log(`- Total (no filter): ${responseData.data.pagination.total}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAPIResponse()
  .then(() => {
    console.log('\n✅ API response test completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ API response test failed:', error);
    process.exit(1);
  });
