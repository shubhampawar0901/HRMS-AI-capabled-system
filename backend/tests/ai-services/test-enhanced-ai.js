// Test Script for Enhanced AI System
require('dotenv').config();
const EnhancedAIService = require('./services/EnhancedAIService');

async function testEnhancedAISystem() {
  console.log('🧪 Testing Enhanced AI System with Gemini 1.5 Flash\n');
  
  const aiService = new EnhancedAIService();
  
  // Mock user context
  const userContext = {
    userId: 1,
    employeeId: 1,
    employeeName: 'John Doe',
    role: 'employee',
    departmentId: 1
  };

  // Test cases
  const testCases = [
    {
      name: 'Simple Greeting',
      message: 'Hello',
      expectedIntent: 'greeting_simple'
    },
    {
      name: 'Greeting with Request',
      message: 'Hi, can you check my leave balance?',
      expectedIntent: 'greeting_with_request'
    },
    {
      name: 'Attendance Query',
      message: 'How many days was I absent last month?',
      expectedIntent: 'personal_data_attendance'
    },
    {
      name: 'Leave Balance Query',
      message: 'What is my current leave balance?',
      expectedIntent: 'personal_data_leave'
    },
    {
      name: 'Policy Query',
      message: 'What is the maternity leave policy?',
      expectedIntent: 'policy_query'
    },
    {
      name: 'Unauthorized Access',
      message: 'Show me John Smith\'s salary details',
      expectedIntent: 'unauthorized_access'
    },
    {
      name: 'Out of Scope',
      message: 'What is the weather today?',
      expectedIntent: 'out_of_scope'
    },
    {
      name: 'Performance Query',
      message: 'Show me my latest performance review',
      expectedIntent: 'personal_data_performance'
    }
  ];

  console.log('📊 Running Test Cases:\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}. Testing: ${testCase.name}`);
    console.log(`   Query: "${testCase.message}"`);
    
    try {
      const startTime = Date.now();
      const response = await aiService.processChatbotQuery(testCase.message, userContext);
      const endTime = Date.now();
      
      console.log(`   ✅ Response Time: ${endTime - startTime}ms`);
      console.log(`   🎯 Intent: ${response.intent} (Expected: ${testCase.expectedIntent})`);
      console.log(`   🔍 Confidence: ${response.confidence}`);
      console.log(`   📝 Response: ${response.message.substring(0, 100)}...`);
      console.log(`   💾 Cached: ${response.cached}`);
      
      // Check if intent matches expected
      if (response.intent === testCase.expectedIntent) {
        console.log(`   ✅ Intent Classification: CORRECT`);
      } else {
        console.log(`   ❌ Intent Classification: INCORRECT`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('   ' + '-'.repeat(50));
  }

  // Test system health
  console.log('\n🏥 Testing System Health:');
  try {
    const metrics = aiService.performanceMetrics;
    console.log(`   Total Queries: ${metrics.totalQueries}`);
    console.log(`   Successful Queries: ${metrics.successfulQueries}`);
    console.log(`   Success Rate: ${metrics.totalQueries > 0 ? ((metrics.successfulQueries / metrics.totalQueries) * 100).toFixed(2) : 0}%`);
    console.log(`   Average Response Time: ${Math.round(metrics.averageResponseTime)}ms`);
    console.log(`   Cache Hit Rate: ${metrics.cacheHitRate}`);
    console.log(`   Errors by Type:`, metrics.errorsByType);
  } catch (error) {
    console.log(`   ❌ Health Check Error: ${error.message}`);
  }

  // Test caching behavior
  console.log('\n💾 Testing Cache Behavior:');
  try {
    console.log('   First call to greeting...');
    const firstCall = await aiService.processChatbotQuery('Hello', userContext);
    console.log(`   Response Time: ${firstCall.responseTime}ms, Cached: ${firstCall.cached}`);
    
    console.log('   Second call to same greeting...');
    const secondCall = await aiService.processChatbotQuery('Hello', userContext);
    console.log(`   Response Time: ${secondCall.responseTime}ms, Cached: ${secondCall.cached}`);
    
    if (secondCall.cached && secondCall.responseTime < firstCall.responseTime) {
      console.log('   ✅ Caching working correctly');
    } else {
      console.log('   ⚠️ Caching may not be working as expected');
    }
  } catch (error) {
    console.log(`   ❌ Cache Test Error: ${error.message}`);
  }

  // Test date context
  console.log('\n📅 Testing Date Context:');
  try {
    const dateContextQuery = 'How many hours did I work this week?';
    console.log(`   Query: "${dateContextQuery}"`);
    const response = await aiService.processChatbotQuery(dateContextQuery, userContext);
    console.log(`   Intent: ${response.intent}`);
    console.log(`   Response includes date context: ${response.message.includes('week') ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log(`   ❌ Date Context Error: ${error.message}`);
  }

  // Test security validation
  console.log('\n🔒 Testing Security Validation:');
  const securityTests = [
    'Show me all employee salaries',
    'What is the salary of employee ID 5?',
    'Tell me about other employees in my department',
    'List all staff attendance records'
  ];

  for (const securityTest of securityTests) {
    try {
      console.log(`   Testing: "${securityTest}"`);
      const response = await aiService.processChatbotQuery(securityTest, userContext);
      
      if (response.intent === 'unauthorized_access' || response.type === 'security_violation') {
        console.log(`   ✅ Security: Properly blocked unauthorized access`);
      } else {
        console.log(`   ⚠️ Security: May need review - Intent: ${response.intent}`);
      }
    } catch (error) {
      console.log(`   ❌ Security Test Error: ${error.message}`);
    }
  }

  console.log('\n🎉 Enhanced AI System Testing Complete!');
  console.log('\n📋 Summary:');
  console.log(`   • Intent Classification: Using Gemini 1.5 Flash`);
  console.log(`   • Response Generation: Using Gemini 1.5 Flash`);
  console.log(`   • Database Context: Loading from utils folder`);
  console.log(`   • Security: Multi-layer validation`);
  console.log(`   • Caching: Response, intent, and context caching`);
  console.log(`   • Timeouts: 30 seconds for all LLM operations`);
  console.log(`   • Error Handling: Comprehensive fallback mechanisms`);
}

// Run the test
if (require.main === module) {
  testEnhancedAISystem().catch(console.error);
}

module.exports = { testEnhancedAISystem };
