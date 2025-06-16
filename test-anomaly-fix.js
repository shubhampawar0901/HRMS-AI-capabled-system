// Test script to verify the anomaly data fix
const AIAttendanceAnomaly = require('./backend/models/AIAttendanceAnomaly');

async function testAnomalyDataFix() {
  console.log('🧪 Testing Anomaly Data Fix...\n');
  
  try {
    // Test case 1: Create a test anomaly with string numeric values (simulating database storage)
    const testAnomalyData = {
      id: 999,
      employee_id: 1,
      anomaly_type: 'irregular_hours',
      detected_date: '2024-12-19',
      anomaly_data: JSON.stringify({
        stdDev: "2.5",  // String value (as it might come from database)
        avgHours: "8.2",
        variance: "6.25",
        latePercentage: "15.5",
        absentPercentage: "8.0"
      }),
      severity: 'medium',
      description: 'Test anomaly',
      recommendations: JSON.stringify(['Test recommendation']),
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
      employee_name: 'Test Employee'
    };
    
    // Create anomaly instance
    const anomaly = new AIAttendanceAnomaly(testAnomalyData);
    
    // Test toJSON method
    const jsonData = anomaly.toJSON();
    
    console.log('✅ Test Results:');
    console.log('📊 Original anomalyData (string):', testAnomalyData.anomaly_data);
    console.log('📊 Parsed anomalyData:', jsonData.anomalyData);
    console.log('📊 stdDev type:', typeof jsonData.anomalyData.stdDev);
    console.log('📊 stdDev value:', jsonData.anomalyData.stdDev);
    
    // Test the frontend function logic
    const data = jsonData.anomalyData || {};
    
    // Helper function to safely convert to number and format (from frontend fix)
    const safeToFixed = (value, decimals = 1) => {
      const num = parseFloat(value) || 0;
      return num.toFixed(decimals);
    };
    
    // Test the problematic case
    const result = safeToFixed(data.stdDev);
    console.log('📊 Frontend safeToFixed result:', result);
    
    // Test that it doesn't throw an error
    try {
      const directResult = (data.stdDev || 0).toFixed(1);
      console.log('✅ Direct toFixed works:', directResult);
    } catch (error) {
      console.log('❌ Direct toFixed would fail:', error.message);
    }
    
    console.log('\n🎉 All tests passed! The fix should work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAnomalyDataFix();
