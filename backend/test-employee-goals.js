require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5003/api';

async function testEmployeeGoals() {
  try {
    console.log('🔄 Testing Employee Goals API...');
    
    // Step 1: Login as employee
    console.log('\n1. Logging in as employee...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'employee@hrms.com',
      password: 'Employee123!'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.accessToken;
    const user = loginResponse.data.data.user;
    const employee = loginResponse.data.data.employee;
    
    console.log('✅ Login successful');
    console.log('- User ID:', user.id);
    console.log('- Role:', user.role);
    console.log('- Employee ID:', employee?.id);
    console.log('- Token (first 20 chars):', token.substring(0, 20) + '...');
    
    // Step 2: Test goals API
    console.log('\n2. Testing goals API...');
    const goalsResponse = await axios.get(`${BASE_URL}/performance/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Goals API successful');
    console.log('- Success:', goalsResponse.data.success);
    console.log('- Goals count:', goalsResponse.data.data?.goals?.length || 0);
    console.log('- Goals:', goalsResponse.data.data?.goals);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEmployeeGoals();
