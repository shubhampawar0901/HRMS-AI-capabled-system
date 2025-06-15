const axios = require('axios');

async function testPerformanceAPI() {
  try {
    console.log('🔍 Testing Performance Goals API...');
    
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5003/api/auth/login', {
      email: 'admin@hrms.com',
      password: 'Admin123!'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful. Token obtained.');
    
    // Step 2: Test Performance Goals API
    console.log('2. Testing Performance Goals API...');
    const goalsResponse = await axios.get('http://localhost:5003/api/performance/goals', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        status: 'null',
        page: 1,
        limit: 100
      }
    });
    
    console.log('✅ Performance Goals API Response:');
    console.log('Status:', goalsResponse.status);
    console.log('Success:', goalsResponse.data.success);
    console.log('Message:', goalsResponse.data.message);
    console.log('Goals Count:', goalsResponse.data.data?.goals?.length || 0);
    console.log('Pagination:', goalsResponse.data.data?.pagination);
    
    // Step 3: Test Performance Reviews API
    console.log('3. Testing Performance Reviews API...');
    const reviewsResponse = await axios.get('http://localhost:5003/api/performance/reviews', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        status: 'null',
        page: 1,
        limit: 100
      }
    });
    
    console.log('✅ Performance Reviews API Response:');
    console.log('Status:', reviewsResponse.status);
    console.log('Success:', reviewsResponse.data.success);
    console.log('Message:', reviewsResponse.data.message);
    console.log('Reviews Count:', reviewsResponse.data.data?.reviews?.length || 0);
    console.log('Pagination:', reviewsResponse.data.data?.pagination);
    
    console.log('🎉 All Performance APIs working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Performance API:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.error('Stack:', error.stack);
  }
}

testPerformanceAPI();
