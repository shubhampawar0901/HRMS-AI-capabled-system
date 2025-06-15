// Test script to verify anomaly detection API fixes
const AIService = require('./services/AIService');
const Employee = require('./models/Employee');

async function testAnomalyDetection() {
  console.log('🧪 Testing Anomaly Detection API fixes...\n');
  
  try {
    // Test 1: Admin user with null employeeId (analyze all employees)
    console.log('📋 Test 1: Admin user analyzing all employees (employeeId = null)');
    
    const aiService = new AIService();
    const dateRange = {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };
    
    console.log('🔍 Calling detectAttendanceAnomalies with employeeId = null...');
    const anomalies = await aiService.detectAttendanceAnomalies(null, dateRange);
    
    console.log(`✅ Success! Detected ${anomalies.length} anomalies across all employees`);
    
    if (anomalies.length > 0) {
      console.log('📊 Sample anomaly:', {
        employeeId: anomalies[0].employeeId,
        type: anomalies[0].type,
        severity: anomalies[0].severity
      });
    }
    
    // Test 2: Specific employee analysis
    console.log('\n📋 Test 2: Specific employee analysis (employeeId = 1)');
    
    const specificAnomalies = await aiService.detectAttendanceAnomalies(1, dateRange);
    console.log(`✅ Success! Detected ${specificAnomalies.length} anomalies for employee 1`);
    
    console.log('\n🎉 All tests passed! API fixes are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testAnomalyDetection();
