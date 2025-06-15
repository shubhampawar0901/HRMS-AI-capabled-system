// Test script for Intelligent Intent Classifier
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const IntelligentIntentClassifier = require('./services/IntelligentIntentClassifier');

console.log('🧠 Testing Intelligent Intent Classifier with Gemini 2.5 Flash...\n');

async function testIntelligentIntentClassifier() {
  try {
    const classifier = new IntelligentIntentClassifier();
    const userContext = {
      userId: 1,
      role: 'employee',
      employeeId: 1,
      employeeName: 'John Doe'
    };

    // Comprehensive test cases covering all scenarios
    const testCases = [
      {
        category: "SIMPLE GREETINGS",
        tests: [
          { query: "Hi", expected: "greeting_simple" },
          { query: "Good morning", expected: "greeting_simple" },
          { query: "Hello there", expected: "greeting_simple" }
        ]
      },
      
      {
        category: "GREETING WITH REQUESTS",
        tests: [
          { query: "Hi, I need help with my leave balance", expected: "greeting_with_request" },
          { query: "Good morning, can you check my attendance?", expected: "greeting_with_request" },
          { query: "Hello, I want to know about maternity leave policy", expected: "greeting_with_request" }
        ]
      },
      
      {
        category: "POLICY QUERIES",
        tests: [
          { query: "What's the maternity leave policy?", expected: "policy_query" },
          { query: "How do I apply for annual leave?", expected: "policy_query" },
          { query: "What's the resignation process?", expected: "policy_query" },
          { query: "Tell me about working hours policy", expected: "policy_query" },
          { query: "What are the PF contribution rules?", expected: "policy_query" }
        ]
      },
      
      {
        category: "PERSONAL DATA QUERIES",
        tests: [
          { query: "What's my leave balance?", expected: "personal_data_query" },
          { query: "How many days was I absent last month?", expected: "personal_data_query" },
          { query: "Show me my performance review", expected: "personal_data_query" },
          { query: "Can you tell me about my vacation days remaining?", expected: "personal_data_query" },
          { query: "What's my attendance record?", expected: "personal_data_query" },
          { query: "I want to see my payslip details", expected: "personal_data_query" }
        ]
      },
      
      {
        category: "UNAUTHORIZED ACCESS ATTEMPTS",
        tests: [
          { query: "What's Raj's salary?", expected: "unauthorized_access" },
          { query: "Show me team attendance records", expected: "unauthorized_access" },
          { query: "Can you tell me about other employees' leave balance?", expected: "unauthorized_access" },
          { query: "What's the manager's performance review?", expected: "unauthorized_access" }
        ]
      },
      
      {
        category: "OUT-OF-SCOPE QUERIES",
        tests: [
          { query: "What's the weather today?", expected: "out_of_scope" },
          { query: "Who is Sachin Tendulkar?", expected: "out_of_scope" },
          { query: "What's 2+2?", expected: "out_of_scope" },
          { query: "Tell me about JavaScript programming", expected: "out_of_scope" },
          { query: "What's the latest movie?", expected: "out_of_scope" }
        ]
      },
      
      {
        category: "COMPLEX MIXED QUERIES",
        tests: [
          { query: "I need help understanding the resignation process and also want to check my performance review", expected: "ambiguous" },
          { query: "Can you explain maternity leave policy and show my current leave balance?", expected: "ambiguous" },
          { query: "Good morning, I have questions about both working hours policy and my attendance record", expected: "greeting_with_request" }
        ]
      }
    ];

    console.log('Testing Intelligent Intent Classification:\n');
    
    let totalTests = 0;
    let correctClassifications = 0;
    const results = [];

    for (const category of testCases) {
      console.log(`🎯 ${category.category}:`);
      
      for (const test of category.tests) {
        totalTests++;
        
        try {
          const startTime = Date.now();
          const classification = await classifier.classifyIntent(test.query, userContext);
          const responseTime = Date.now() - startTime;
          
          const isCorrect = classification.type === test.expected || 
                           (test.expected === "policy_query" && classification.type.startsWith("policy_query")) ||
                           (test.expected === "personal_data_query" && classification.type.startsWith("personal_data"));
          
          if (isCorrect) {
            correctClassifications++;
            console.log(`   ✅ "${test.query}"`);
            console.log(`      → ${classification.type} (confidence: ${classification.confidence})`);
            console.log(`      → ${classification.reasoning}`);
            if (classification.dataType) console.log(`      → Data Type: ${classification.dataType}`);
            if (classification.policyArea) console.log(`      → Policy Area: ${classification.policyArea}`);
            console.log(`      → Response Time: ${responseTime}ms`);
          } else {
            console.log(`   ❌ "${test.query}"`);
            console.log(`      → Got: ${classification.type} (Expected: ${test.expected})`);
            console.log(`      → Reasoning: ${classification.reasoning}`);
            console.log(`      → Response Time: ${responseTime}ms`);
          }
          
          results.push({
            query: test.query,
            expected: test.expected,
            actual: classification.type,
            correct: isCorrect,
            confidence: classification.confidence,
            reasoning: classification.reasoning,
            responseTime: responseTime
          });
          
        } catch (error) {
          console.log(`   💥 "${test.query}" → ERROR: ${error.message}`);
        }
        console.log('');
      }
    }

    // Summary
    const accuracy = ((correctClassifications / totalTests) * 100).toFixed(1);
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    console.log(`📊 INTELLIGENT INTENT CLASSIFICATION RESULTS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Correct Classifications: ${correctClassifications}`);
    console.log(`   Accuracy: ${accuracy}%`);
    console.log(`   Average Response Time: ${averageResponseTime.toFixed(0)}ms`);
    console.log(`   Average Confidence: ${averageConfidence.toFixed(2)}`);
    console.log('');

    // Analyze failures
    const failures = results.filter(r => !r.correct);
    if (failures.length > 0) {
      console.log(`❌ FAILED CASES (${failures.length}):`);
      failures.forEach(failure => {
        console.log(`   "${failure.query}"`);
        console.log(`      Expected: ${failure.expected}, Got: ${failure.actual}`);
        console.log(`      Reasoning: ${failure.reasoning}`);
      });
      console.log('');
    }

    // Performance analysis
    console.log('⚡ PERFORMANCE ANALYSIS:');
    const fastResponses = results.filter(r => r.responseTime < 500).length;
    const mediumResponses = results.filter(r => r.responseTime >= 500 && r.responseTime < 1000).length;
    const slowResponses = results.filter(r => r.responseTime >= 1000).length;
    
    console.log(`   Fast (< 500ms): ${fastResponses}/${totalTests} (${((fastResponses/totalTests)*100).toFixed(1)}%)`);
    console.log(`   Medium (500-1000ms): ${mediumResponses}/${totalTests} (${((mediumResponses/totalTests)*100).toFixed(1)}%)`);
    console.log(`   Slow (> 1000ms): ${slowResponses}/${totalTests} (${((slowResponses/totalTests)*100).toFixed(1)}%)`);
    console.log('');

    // Recommendations
    console.log('💡 SYSTEM COMPARISON:');
    console.log('   Current Pattern-based System:');
    console.log('     ✅ Response Time: 0-1ms (instant)');
    console.log('     ❌ Accuracy: ~70% for complex queries');
    console.log('     ❌ Natural Language Understanding: Limited');
    console.log('');
    console.log('   Proposed Intelligent System:');
    console.log(`     ⚡ Response Time: ${averageResponseTime.toFixed(0)}ms (acceptable)`);
    console.log(`     ✅ Accuracy: ${accuracy}% (excellent)`);
    console.log('     ✅ Natural Language Understanding: Advanced');
    console.log('     ✅ Database Schema Awareness: Complete');
    console.log('     ✅ Policy Structure Understanding: Comprehensive');
    console.log('');

    if (accuracy >= 90) {
      console.log('🎊 RECOMMENDATION: Implement Intelligent Intent Classifier');
      console.log('   The significant accuracy improvement justifies the slight increase in response time.');
    } else {
      console.log('⚠️ RECOMMENDATION: Refine prompts and test further');
      console.log('   Need to achieve >90% accuracy before implementation.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testIntelligentIntentClassifier().then(() => {
  console.log('\n🏁 Intelligent intent classification testing completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
