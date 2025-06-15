// Single Scenario Test - Gemini 1.5 Flash
require('dotenv').config();
const EnhancedAIService = require('./services/EnhancedAIService');

async function testSingleScenario() {
  console.log('🧪 Testing Single Scenario with Gemini 1.5 Flash\n');
  
  const aiService = new EnhancedAIService();
  
  // Mock user context
  const userContext = {
    userId: 1,
    employeeId: 1,
    employeeName: 'John Doe',
    role: 'employee',
    departmentId: 1
  };

  // Test simple greeting first
  console.log('📝 Testing Simple Greeting:');
  console.log('Query: "Hello"');
  
  try {
    const startTime = Date.now();
    const response = await aiService.processChatbotQuery('Hello', userContext);
    const endTime = Date.now();
    
    console.log('\n✅ Results:');
    console.log(`   Response Time: ${endTime - startTime}ms`);
    console.log(`   Intent: ${response.intent}`);
    console.log(`   Confidence: ${response.confidence}`);
    console.log(`   Type: ${response.type}`);
    console.log(`   Cached: ${response.cached}`);
    console.log(`   Request ID: ${response.requestId}`);
    console.log('\n📝 Response:');
    console.log(`   "${response.message}"`);
    
    // Check if it's working correctly
    if (response.intent === 'greeting_simple' && response.confidence > 0.8) {
      console.log('\n🎉 SUCCESS: Gemini 1.5 Flash is working correctly!');
      
      // Test caching by running same query again
      console.log('\n💾 Testing Cache Performance:');
      const cachedStart = Date.now();
      const cachedResponse = await aiService.processChatbotQuery('Hello', userContext);
      const cachedEnd = Date.now();
      
      console.log(`   Cached Response Time: ${cachedEnd - cachedStart}ms`);
      console.log(`   Cached: ${cachedResponse.cached}`);
      
      if (cachedResponse.cached && cachedResponse.responseTime < 100) {
        console.log('   ✅ Caching working perfectly!');
      }
      
    } else {
      console.log('\n⚠️ WARNING: Response may not be optimal');
      console.log(`   Expected intent: greeting_simple, Got: ${response.intent}`);
      console.log(`   Expected confidence > 0.8, Got: ${response.confidence}`);
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:');
    console.log(`   ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }
  
  // Test system health
  console.log('\n🏥 System Health Check:');
  try {
    const metrics = aiService.performanceMetrics;
    console.log(`   Total Queries: ${metrics.totalQueries}`);
    console.log(`   Successful Queries: ${metrics.successfulQueries}`);
    console.log(`   Success Rate: ${metrics.totalQueries > 0 ? ((metrics.successfulQueries / metrics.totalQueries) * 100).toFixed(2) : 0}%`);
    console.log(`   Average Response Time: ${Math.round(metrics.averageResponseTime)}ms`);
    console.log(`   Cache Hit Rate: ${metrics.cacheHitRate}`);
    console.log(`   Errors:`, metrics.errorsByType);
  } catch (error) {
    console.log(`   ❌ Health Check Error: ${error.message}`);
  }
  
  console.log('\n🎯 Test Complete!');
}

// Run the test
if (require.main === module) {
  testSingleScenario().catch(console.error);
}

module.exports = { testSingleScenario };
