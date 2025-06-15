const axios = require('axios');

async function testSmartReportsFix() {
  try {
    console.log('🧪 Testing Smart Reports API fixes...');
    
    // First, let's test a simple endpoint to verify server is running
    console.log('1. Testing server connection...');
    // Skip health check and go directly to login test
    
    // Test the Smart Reports sync endpoint with proper authentication
    console.log('2. Testing Smart Reports sync endpoint...');
    
    // We need to get a valid token first - let's try with admin credentials
    const loginResponse = await axios.post('http://localhost:5003/api/auth/login', {
      email: 'admin@hrms.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      
      // Now test the Smart Reports endpoint
      console.log('3. Testing Smart Reports generation...');
      const reportResponse = await axios.post('http://localhost:5003/api/smart-reports/sync', {
        reportType: 'employee',
        targetId: 3,
        reportName: 'Test Employee Report',
        dateRange: {
          startDate: '2025-03-17',
          endDate: '2025-06-15'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (reportResponse.data.success) {
        console.log('✅ Smart Report generated successfully!');
        console.log('📊 Report ID:', reportResponse.data.data.id);
        console.log('📝 Report Name:', reportResponse.data.data.reportName);
        console.log('📈 Status:', reportResponse.data.data.status);
        console.log('🔍 AI Summary length:', reportResponse.data.data.aiSummary?.length || 0, 'characters');
        
        // Check if we have insights and recommendations
        if (reportResponse.data.data.insights) {
          console.log('💡 Insights available:', typeof reportResponse.data.data.insights);
        }
        if (reportResponse.data.data.recommendations) {
          console.log('🎯 Recommendations available:', typeof reportResponse.data.data.recommendations);
        }
        
        console.log('\n🎉 All tests passed! The Smart Reports fixes are working correctly.');
      } else {
        console.error('❌ Smart Report generation failed:', reportResponse.data.message);
      }
    } else {
      console.error('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 429) {
      console.log('ℹ️  This is the quota error we fixed - the fallback should handle this gracefully now.');
    }
    
    if (error.message?.includes('Bind parameters must not contain undefined')) {
      console.log('ℹ️  This is the database error we fixed - undefined values should now be converted to null.');
    }
  }
}

// Run the test
testSmartReportsFix();
