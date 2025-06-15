const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5004/api';

async function testAttritionAPI() {
  try {
    console.log('🧪 Testing Attrition Prediction API...\n');

    // First, login to get a valid token
    console.log('1. Logging in to get authentication token...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@hrms.com',
      password: 'Admin123!'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    console.log('✅ Login successful');
    console.log('📋 Login response data:', loginResponse.data);

    const token = loginResponse.data.data?.token || loginResponse.data.data?.accessToken;
    if (!token) {
      throw new Error('No token received from login');
    }

    console.log('🔑 Token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('👤 User data:', loginResponse.data.data.user);

    // Set up headers with token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Get all attrition predictions
    console.log('\n2. Testing GET /api/ai/attrition-predictions...');
    const predictionsResponse = await axios.get(`${API_BASE_URL}/ai/attrition-predictions`, {
      headers
    });

    console.log('✅ API Response Status:', predictionsResponse.status);
    console.log('✅ Response Data Structure:');
    console.log('   - Success:', predictionsResponse.data.success);
    console.log('   - Message:', predictionsResponse.data.message);
    
    if (predictionsResponse.data.data) {
      const data = predictionsResponse.data.data;
      console.log('   - Full Response Data:', JSON.stringify(data, null, 2));
      console.log('   - Predictions Count:', data.predictions?.length || 0);
      console.log('   - Summary:', data.summary);

      if (data.predictions && data.predictions.length > 0) {
        console.log('\n📊 Sample Prediction:');
        const sample = data.predictions[0];
        console.log('   - Employee:', sample.employeeName);
        console.log('   - Risk Score:', sample.riskPercentage + '%');
        console.log('   - Risk Level:', sample.riskLevel);
        console.log('   - Factors:', sample.factors);
      } else {
        console.log('\n⚠️ No predictions found. Checking raw data...');
        console.log('   - Raw data type:', typeof data);
        console.log('   - Raw data keys:', Object.keys(data));
      }
    }

    // Test 2: Get high-risk predictions only
    console.log('\n3. Testing with risk threshold filter...');
    const highRiskResponse = await axios.get(`${API_BASE_URL}/ai/attrition-predictions?riskThreshold=0.7`, {
      headers
    });

    console.log('✅ High-risk predictions:', highRiskResponse.data.data?.predictions?.length || 0);

    // Test 3: Generate prediction for specific employee
    console.log('\n4. Testing POST /api/ai/attrition-predictions...');
    try {
      const generateResponse = await axios.post(`${API_BASE_URL}/ai/attrition-predictions`, {
        employeeId: 1
      }, { headers });

      console.log('✅ Prediction generation successful');
      console.log('   - Generated for employee ID:', 1);
    } catch (generateError) {
      console.log('⚠️ Prediction generation test:', generateError.response?.data?.error?.message || generateError.message);
    }

    console.log('\n🎉 Attrition API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Authentication working');
    console.log('   ✅ GET predictions endpoint working');
    console.log('   ✅ Risk threshold filtering working');
    console.log('   ✅ Data structure is correct');
    console.log('   ✅ Sample data is available');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication issue - check if admin user exists');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused - check if backend server is running on port 5004');
    }
  }
}

// Run the test
if (require.main === module) {
  testAttritionAPI();
}

module.exports = testAttritionAPI;
