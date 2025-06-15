// Test the anomaly detection stats API with authentication
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testStatsAPIWithAuth() {
  try {
    console.log('🧪 Testing Anomaly Detection Stats API with Authentication\n');
    
    // Create a test JWT token for admin user
    const testPayload = {
      id: 1,
      role: 'admin',
      employeeId: 1,
      email: 'admin@test.com'
    };
    
    const token = jwt.sign(testPayload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
    
    console.log('🔑 Generated test token for admin user');
    
    // Test the stats API
    const response = await axios.get('http://localhost:5003/api/ai/attendance-anomalies/stats?period=month', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status < 500; // Accept any status less than 500
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('\n✅ API working! Stats retrieved successfully.');
      
      // Check if we're getting real data instead of zeros
      const stats = response.data.data;
      if (stats) {
        console.log('\n📈 Statistics Analysis:');
        console.log(`- Total Active: ${stats.totalActive}`);
        console.log(`- New This Week: ${stats.newThisWeek}`);
        console.log(`- Resolved This Month: ${stats.resolvedThisMonth}`);
        console.log(`- High Priority: ${stats.highPriority}`);
        console.log(`- Period: ${stats.period}`);
        
        if (stats.trends) {
          console.log(`- Weekly Change: ${stats.trends.weeklyChange}%`);
          console.log(`- Monthly Change: ${stats.trends.monthlyChange}%`);
          console.log(`- Severity Distribution:`, stats.trends.severityDistribution);
        }
        
        if (stats.totalActive > 0 || stats.newThisWeek > 0) {
          console.log('\n🎉 SUCCESS: API is returning real data (not zeros)!');
          console.log('✅ Stats API fix is working correctly!');
        } else {
          console.log('\n⚠️ WARNING: API is still returning zeros.');
          console.log('This might mean:');
          console.log('1. No anomaly data exists in the database');
          console.log('2. The database queries need adjustment');
          console.log('3. The date filtering is too restrictive');
        }
      }
    } else {
      console.log('\n❌ API call failed:', response.data);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on port 5003');
      console.log('Please start the backend server first: npm start');
    } else {
      console.log('❌ Error testing API:', error.message);
      if (error.response) {
        console.log('Response data:', error.response.data);
      }
    }
  }
}

// Load environment variables
require('dotenv').config();

testStatsAPIWithAuth();
