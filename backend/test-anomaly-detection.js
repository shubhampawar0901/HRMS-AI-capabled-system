// Test anomaly detection functionality directly
console.log('🧪 Testing Anomaly Detection...');

async function testAnomalyDetection() {
  try {
    // Load environment
    require('dotenv').config();
    console.log('✅ Environment loaded');
    
    // Test database connection
    const { connectDB } = require('./config/database');
    await connectDB();
    console.log('✅ Database connected');
    
    // Test AI Service initialization
    const AIService = require('./services/AIService');
    const aiService = new AIService();
    console.log('✅ AI Service initialized');
    
    // Test anomaly detection method
    console.log('\n🔍 Testing detectAttendanceAnomalies...');
    
    const dateRange = {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };
    
    // Test with null employeeId (admin view)
    console.log('Testing with employeeId: null (admin view)');
    const result = await aiService.detectAttendanceAnomalies(null, dateRange);
    
    console.log('✅ Anomaly detection result:');
    console.log('- Success:', result.success);
    console.log('- Anomalies found:', result.data?.anomalies?.length || 0);
    console.log('- Summary:', result.data?.summary);
    
    if (result.success) {
      console.log('\n✅ Anomaly detection is working correctly!');
    } else {
      console.log('\n❌ Anomaly detection failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testAnomalyDetection();
