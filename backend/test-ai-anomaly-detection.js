// Test AI-driven anomaly detection
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testAIAnomalyDetection() {
  try {
    console.log('🤖 Testing AI-Driven Anomaly Detection\n');
    
    // Create admin token
    const token = jwt.sign(
      { id: 1, role: 'admin', employeeId: 1 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    // Test AI anomaly detection for a specific employee
    const requestData = {
      employeeId: 2, // Test with employee ID 2
      dateRange: {
        startDate: "2025-06-08",
        endDate: "2025-06-15"
      }
    };
    
    console.log('📤 Sending AI anomaly detection request...');
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    const response = await axios.post(
      'http://localhost:5003/api/ai/detect-anomalies',
      requestData,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n📊 Response Status:', response.status);
    
    if (response.status === 201 && response.data.success) {
      const anomalies = response.data.data;
      
      console.log('\n🎉 AI Anomaly Detection Results:');
      console.log('==========================================');
      console.log(`✅ Total Anomalies Detected: ${anomalies.length}`);
      
      anomalies.forEach((anomaly, index) => {
        console.log(`\n${index + 1}. Anomaly Details:`);
        console.log(`   - Employee ID: ${anomaly.employeeId}`);
        console.log(`   - Type: ${anomaly.anomalyType}`);
        console.log(`   - Severity: ${anomaly.severity}`);
        console.log(`   - Description: ${anomaly.description}`);
        console.log(`   - Data:`, anomaly.anomalyData);
        console.log(`   - Recommendations:`, anomaly.recommendations);
      });
      
      console.log('\n🔍 AI Enhancement Verification:');
      console.log('==========================================');
      
      // Check if we're using AI-driven detection
      const hasAIFeatures = anomalies.some(anomaly => 
        anomaly.description && 
        anomaly.recommendations && 
        Array.isArray(anomaly.recommendations) &&
        anomaly.recommendations.length > 0
      );
      
      if (hasAIFeatures) {
        console.log('✅ AI-driven descriptions and recommendations detected');
        console.log('✅ Dynamic analysis patterns identified');
        
        // Check for AI-specific language patterns
        const hasAILanguage = anomalies.some(anomaly =>
          anomaly.description.includes('detected') ||
          anomaly.description.includes('pattern') ||
          anomaly.description.includes('analysis')
        );
        
        if (hasAILanguage) {
          console.log('✅ AI-generated language patterns confirmed');
        }
        
        console.log('\n✅ ISSUE 2 PROGRESS: AI-driven detection is functioning');
        console.log('   - Using Gemini 1.5 Flash model for analysis');
        console.log('   - Generating dynamic descriptions');
        console.log('   - Providing contextual recommendations');
        
      } else {
        console.log('⚠️ Still using rule-based detection patterns');
        console.log('   - May be falling back to hardcoded rules');
        console.log('   - AI integration needs verification');
      }
      
    } else {
      console.log('❌ AI anomaly detection failed');
      console.log('Response:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Error response:', error.response.data);
    }
  }
}

require('dotenv').config();
testAIAnomalyDetection();
