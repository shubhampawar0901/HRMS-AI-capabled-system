// Debug what the frontend is actually calling
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function debugFrontendAPICall() {
  try {
    console.log('🔍 Debugging Frontend API Call\n');
    
    // Create admin token (same as frontend would)
    const token = jwt.sign(
      { id: 1, role: 'admin', employeeId: 1 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    // Test the exact URL the frontend is calling
    const baseURL = 'http://localhost:5003/api';
    const endpoint = '/ai/attendance-anomalies/stats';
    const params = '?period=month';
    const fullURL = `${baseURL}${endpoint}${params}`;
    
    console.log('🌐 Testing Frontend URL:', fullURL);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await axios.get(fullURL, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000, // 10 second timeout
      validateStatus: function (status) {
        return status < 500; // Accept any status less than 500
      }
    });
    
    console.log('\n📊 Response Details:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      const stats = response.data.data;
      
      if (stats.totalActive === 0 && stats.newThisWeek === 0) {
        console.log('\n❌ PROBLEM IDENTIFIED:');
        console.log('API is returning zeros even though backend logs show it should return 3');
        console.log('This suggests there might be:');
        console.log('1. Multiple backend instances running');
        console.log('2. Database connection issues');
        console.log('3. Caching problems');
        console.log('4. Different environment/database being used');
      } else {
        console.log('\n✅ API is working correctly!');
      }
    } else {
      console.log('\n⚠️ API call failed with status:', response.status);
    }
    
  } catch (error) {
    console.log('\n❌ API Call Failed:');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 DIAGNOSIS: Backend server is not running or not accessible');
      console.log('- Check if backend is running on port 5003');
      console.log('- Check if firewall is blocking the connection');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔍 DIAGNOSIS: DNS/hostname resolution issue');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n🔍 DIAGNOSIS: Request timeout - backend is slow or unresponsive');
    } else {
      console.log('\n🔍 DIAGNOSIS: Other network or server error');
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
  }
}

require('dotenv').config();
debugFrontendAPICall();
