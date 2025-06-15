const axios = require('axios');

async function testHealth() {
  try {
    console.log('🔍 Testing Health endpoint...');
    
    const response = await axios.get('http://localhost:5003/health');
    
    console.log('✅ Health endpoint response:');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.error('❌ Error testing health endpoint:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testHealth();
