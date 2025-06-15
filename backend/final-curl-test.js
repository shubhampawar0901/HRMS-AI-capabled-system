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

async function finalCurlTest() {
  console.log('🎯 FINAL PERFORMANCE API CURL TEST');
  console.log('=====================================');
  
  try {
    // Step 1: Login
    console.log('1️⃣ STEP 1: Admin Login');
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
    console.log(`✅ Login Status: ${loginResponse.status}`);
    console.log(`✅ Login Success: ${loginResponse.data.success}`);
    
    const token = loginResponse.data.data.accessToken;
    console.log(`✅ Token: ${token.substring(0, 30)}...`);
    
    // Step 2: Test Performance Goals API
    console.log('\n2️⃣ STEP 2: Performance Goals API');
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
    console.log(`✅ Goals Status: ${goalsResponse.status}`);
    console.log(`✅ Goals Success: ${goalsResponse.data.success}`);
    console.log(`✅ Goals Message: ${goalsResponse.data.message}`);
    console.log(`✅ Goals Count: ${goalsResponse.data.data?.goals?.length || 0}`);
    console.log(`✅ Goals Pagination:`, goalsResponse.data.data?.pagination);
    
    if (goalsResponse.data.data?.goals?.length > 0) {
      console.log(`✅ Sample Goal:`, {
        id: goalsResponse.data.data.goals[0].id,
        title: goalsResponse.data.data.goals[0].title,
        employee_name: goalsResponse.data.data.goals[0].employee_name,
        status: goalsResponse.data.data.goals[0].status
      });
    }
    
    // Step 3: Test Performance Reviews API
    console.log('\n3️⃣ STEP 3: Performance Reviews API');
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
    console.log(`✅ Reviews Status: ${reviewsResponse.status}`);
    console.log(`✅ Reviews Success: ${reviewsResponse.data.success}`);
    console.log(`✅ Reviews Message: ${reviewsResponse.data.message}`);
    console.log(`✅ Reviews Count: ${reviewsResponse.data.data?.reviews?.length || 0}`);
    console.log(`✅ Reviews Pagination:`, reviewsResponse.data.data?.pagination);
    
    if (reviewsResponse.data.data?.reviews?.length > 0) {
      console.log(`✅ Sample Review:`, {
        id: reviewsResponse.data.data.reviews[0].id,
        review_period: reviewsResponse.data.data.reviews[0].review_period,
        employee_name: reviewsResponse.data.data.reviews[0].employee_name,
        overall_rating: reviewsResponse.data.data.reviews[0].overall_rating,
        status: reviewsResponse.data.data.reviews[0].status
      });
    }
    
    // Step 4: Test Performance Dashboard API
    console.log('\n4️⃣ STEP 4: Performance Dashboard API');
    const dashboardOptions = {
      hostname: 'localhost',
      port: 5003,
      path: '/api/performance/dashboard',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const dashboardResponse = await makeRequest(dashboardOptions);
    console.log(`✅ Dashboard Status: ${dashboardResponse.status}`);
    console.log(`✅ Dashboard Success: ${dashboardResponse.data.success}`);
    console.log(`✅ Dashboard Data:`, dashboardResponse.data.data);
    
    // Final Summary
    console.log('\n🎉 FINAL RESULTS SUMMARY');
    console.log('========================');
    console.log(`✅ Login API: ${loginResponse.status === 200 ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Goals API: ${goalsResponse.status === 200 ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Reviews API: ${reviewsResponse.status === 200 ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Dashboard API: ${dashboardResponse.status === 200 ? 'WORKING' : 'FAILED'}`);
    
    const allWorking = [loginResponse, goalsResponse, reviewsResponse, dashboardResponse]
      .every(r => r.status === 200);
    
    console.log(`\n🎯 OVERALL STATUS: ${allWorking ? '✅ ALL APIS WORKING PERFECTLY!' : '❌ SOME APIS FAILED'}`);
    
  } catch (error) {
    console.error('❌ Error in final test:', error.message);
  }
}

finalCurlTest();
