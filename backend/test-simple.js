const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testAPI() {
  try {
    console.log('🔍 Testing HRMS Performance API...');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthOptions = {
      hostname: 'localhost',
      port: 5003,
      path: '/health',
      method: 'GET'
    };
    
    const healthResponse = await makeRequest(healthOptions);
    console.log('✅ Health Response:', healthResponse.status, healthResponse.data);
    
    // Test 2: Login
    console.log('2. Testing login...');
    const loginData = JSON.stringify({
      email: 'admin@hrms.com',
      password: 'Admin123!'
    });
    
    const loginOptions = {
      hostname: 'localhost',
      port: 5003,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('✅ Login Response:', loginResponse.status);
    console.log('Success:', loginResponse.data.success);
    console.log('Message:', loginResponse.data.message);
    console.log('Full login data:', JSON.stringify(loginResponse.data, null, 2));

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data?.accessToken;
    console.log('Token obtained:', token ? token.substring(0, 20) + '...' : 'No token');
    
    // Test 3: Performance Goals API
    console.log('3. Testing Performance Goals API...');
    const goalsOptions = {
      hostname: 'localhost',
      port: 5003,
      path: '/api/performance/goals?status=null&page=1&limit=100',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const goalsResponse = await makeRequest(goalsOptions);
    console.log('✅ Goals Response:', goalsResponse.status);
    console.log('Success:', goalsResponse.data.success);
    console.log('Message:', goalsResponse.data.message);
    
    if (goalsResponse.data.success) {
      console.log('Goals Count:', goalsResponse.data.data?.goals?.length || 0);
      console.log('Pagination:', goalsResponse.data.data?.pagination);
    } else {
      console.error('❌ Goals API Error:', goalsResponse.data);
    }
    
    // Test 4: Performance Reviews API
    console.log('4. Testing Performance Reviews API...');
    const reviewsOptions = {
      hostname: 'localhost',
      port: 5003,
      path: '/api/performance/reviews?status=null&page=1&limit=100',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const reviewsResponse = await makeRequest(reviewsOptions);
    console.log('✅ Reviews Response:', reviewsResponse.status);
    console.log('Success:', reviewsResponse.data.success);
    console.log('Message:', reviewsResponse.data.message);
    
    if (reviewsResponse.data.success) {
      console.log('Reviews Count:', reviewsResponse.data.data?.reviews?.length || 0);
      console.log('Pagination:', reviewsResponse.data.data?.pagination);
    } else {
      console.error('❌ Reviews API Error:', reviewsResponse.data);
    }
    
    console.log('🎉 API Testing completed!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPI();
