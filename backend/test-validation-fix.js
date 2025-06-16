const axios = require('axios');

async function testValidationFix() {
  try {
    console.log('🧪 Testing Performance Review Validation Fix...\n');

    // First, let's try to login to get a valid token
    console.log('🔐 Attempting login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@hrms.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token obtained\n');

    // Test 1: Create review with short comments (should work now)
    console.log('📝 Test 1: Creating review with short comments...');
    const reviewData = {
      employeeId: 1,
      reviewPeriod: 'Q1 2024',
      overallRating: 4.5,
      comments: 'Good'  // Only 4 characters - previously would fail
    };

    const reviewResponse = await axios.post(
      'http://localhost:5000/api/performance/reviews',
      reviewData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Review created successfully!');
    console.log('Response:', JSON.stringify(reviewResponse.data, null, 2));

    // Test 2: Create review with empty comments (should work now)
    console.log('\n📝 Test 2: Creating review with empty comments...');
    const reviewData2 = {
      employeeId: 2,
      reviewPeriod: 'Q1 2024',
      overallRating: 3.8,
      comments: ''  // Empty comments - previously would fail
    };

    const reviewResponse2 = await axios.post(
      'http://localhost:5000/api/performance/reviews',
      reviewData2,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Review with empty comments created successfully!');
    console.log('Response:', JSON.stringify(reviewResponse2.data, null, 2));

    console.log('\n🎉 All tests passed! Validation has been successfully removed.');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testValidationFix();
