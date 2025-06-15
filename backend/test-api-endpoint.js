// Test the anomaly detection API endpoint directly
console.log('🧪 Testing Anomaly Detection API Endpoint...');

async function testAPIEndpoint() {
  try {
    // Load environment
    require('dotenv').config();
    console.log('✅ Environment loaded');
    
    // Test database connection
    const { connectDB } = require('./config/database');
    await connectDB();
    console.log('✅ Database connected');
    
    // Import the controller
    const AIController = require('./controllers/aiController');
    console.log('✅ AI Controller loaded');

    // Mock request and response objects for POST /api/ai/detect-anomalies
    const mockReq = {
      user: {
        userId: 1,
        employeeId: null, // Admin user
        role: 'admin',
        email: 'admin@hrms.com'
      },
      body: {
        employeeId: null, // null for admin to analyze all employees
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      }
    };
    
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      },
      statusCode: 200,
      responseData: null
    };
    
    console.log('\n🔍 Testing API endpoint with mock request...');
    console.log('Request user:', mockReq.user);
    console.log('Request body:', mockReq.body);

    // Call the controller function (POST /api/ai/detect-anomalies)
    await AIController.detectAnomalies(mockReq, mockRes);
    
    console.log('\n✅ API Response:');
    console.log('Status Code:', mockRes.statusCode);
    console.log('Response Data:', JSON.stringify(mockRes.responseData, null, 2));
    
    if ((mockRes.statusCode === 200 || mockRes.statusCode === 201) && mockRes.responseData?.success) {
      console.log('\n🎉 API endpoint is working correctly!');
      console.log('Anomalies found:', mockRes.responseData.data?.length || 0);
      console.log('Response message:', mockRes.responseData.message);
    } else {
      console.log('\n❌ API endpoint failed');
      console.log('Status:', mockRes.statusCode);
      console.log('Response:', mockRes.responseData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testAPIEndpoint();
