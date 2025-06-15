// Test the anomaly detection stats API
const axios = require('axios');

async function testStatsAPI() {
  try {
    console.log('🧪 Testing Anomaly Detection Stats API\n');
    
    // Test without authentication first to see if endpoint exists
    const response = await axios.get('http://localhost:5003/api/ai/attendance-anomalies/stats?period=month', {
      validateStatus: function (status) {
        return status < 500; // Accept any status less than 500
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 401) {
      console.log('\n⚠️ Authentication required. This is expected.');
      console.log('✅ API endpoint exists and is responding correctly.');
    } else if (response.status === 200) {
      console.log('\n✅ API working! Stats retrieved successfully.');
      
      // Check if we're getting real data instead of zeros
      const stats = response.data.data;
      if (stats) {
        console.log('\n📈 Statistics Analysis:');
        console.log(`- Total Active: ${stats.totalActive}`);
        console.log(`- New This Week: ${stats.newThisWeek}`);
        console.log(`- Resolved This Month: ${stats.resolvedThisMonth}`);
        console.log(`- High Priority: ${stats.highPriority}`);
        
        if (stats.totalActive > 0 || stats.newThisWeek > 0) {
          console.log('✅ SUCCESS: API is returning real data (not zeros)!');
        } else {
          console.log('⚠️ WARNING: API is still returning zeros. Check database data.');
        }
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on port 5003');
      console.log('Please start the backend server first: npm start');
    } else {
      console.log('❌ Error testing API:', error.message);
    }
  }
}

testStatsAPI();
