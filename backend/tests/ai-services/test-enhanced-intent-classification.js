// Enhanced test script for Shubh HR Chatbot intent classification improvements
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const AIService = require('./services/AIService');

console.log('🎯 Testing Enhanced Intent Classification - Target: 100% Accuracy...\n');

async function testEnhancedIntentClassification() {
  try {
    console.log('1. Initializing Enhanced Shubh AI Service...');
    const aiService = new AIService();
    console.log('   ✅ Enhanced Shubh AI Service initialized');
    console.log('');

    // Focus on the three problematic categories
    const enhancedTestCases = [
      // OUT-OF-SCOPE TESTS - Previously 80% (4/5)
      {
        category: "OUT-OF-SCOPE (Enhanced)",
        tests: [
          { query: "What's the weather today?", expectedIntent: "out_of_scope" },
          { query: "Tell me a joke", expectedIntent: "out_of_scope" },
          { query: "Who is Sachin Tendulkar?", expectedIntent: "out_of_scope" },
          { query: "What's 2+2?", expectedIntent: "out_of_scope" }, // PREVIOUSLY FAILED
          { query: "Recommend a good restaurant", expectedIntent: "out_of_scope" },
          // Additional mathematical tests
          { query: "Calculate 5*3", expectedIntent: "out_of_scope" },
          { query: "What is 10-7?", expectedIntent: "out_of_scope" },
          { query: "Solve this equation", expectedIntent: "out_of_scope" },
          { query: "What's 15 divided by 3?", expectedIntent: "out_of_scope" },
          { query: "Add 4 plus 6", expectedIntent: "out_of_scope" }
        ]
      },
      
      // UNAUTHORIZED ACCESS TESTS - Previously 75% (3/4)
      {
        category: "UNAUTHORIZED ACCESS (Enhanced)",
        tests: [
          { query: "What's Raj's salary?", expectedIntent: "unauthorized_access" },
          { query: "Show me Priya's leave balance", expectedIntent: "unauthorized_access" },
          { query: "Tell me about other employee's performance", expectedIntent: "unauthorized_access" }, // PREVIOUSLY FAILED
          { query: "What's everyone's salary?", expectedIntent: "unauthorized_access" },
          // Additional unauthorized access tests
          { query: "Show me other employee's data", expectedIntent: "unauthorized_access" },
          { query: "What about colleague's information?", expectedIntent: "unauthorized_access" },
          { query: "Give me team member's details", expectedIntent: "unauthorized_access" },
          { query: "Tell me about another employee", expectedIntent: "unauthorized_access" },
          { query: "Show other people's performance", expectedIntent: "unauthorized_access" }
        ]
      },
      
      // POLICY QUESTIONS - Previously 75% (3/4)
      {
        category: "POLICY QUESTIONS (Enhanced)",
        tests: [
          { query: "What's the maternity leave policy?", expectedIntent: "policy_question" },
          { query: "How do I apply for annual leave?", expectedIntent: "policy_question" }, // PREVIOUSLY FAILED
          { query: "What are the working hours?", expectedIntent: "policy_question" },
          { query: "What's the dress code policy?", expectedIntent: "policy_question" },
          // Additional policy question tests
          { query: "How can I apply for sick leave?", expectedIntent: "policy_question" },
          { query: "What's the process for requesting time off?", expectedIntent: "policy_question" },
          { query: "How should I submit my leave application?", expectedIntent: "policy_question" },
          { query: "What are the steps to get approval?", expectedIntent: "policy_question" },
          { query: "Explain the attendance policy", expectedIntent: "policy_question" },
          { query: "Tell me about the company rules", expectedIntent: "policy_question" }
        ]
      },
      
      // CONTROL GROUPS - Should maintain 100% accuracy
      {
        category: "GREETING (Control)",
        tests: [
          { query: "Hi", expectedIntent: "greeting" },
          { query: "Hello", expectedIntent: "greeting" },
          { query: "Good morning", expectedIntent: "greeting" }
        ]
      },
      
      {
        category: "LEAVE BALANCE (Control)",
        tests: [
          { query: "What's my leave balance?", expectedIntent: "leave_balance" },
          { query: "How many leave days do I have left?", expectedIntent: "leave_balance" },
          { query: "Show me my remaining leave", expectedIntent: "leave_balance" }
        ]
      },
      
      {
        category: "EMPLOYEE DATA (Control)",
        tests: [
          { query: "Show me my profile", expectedIntent: "employee_data" },
          { query: "What's my attendance record?", expectedIntent: "employee_data" },
          { query: "My performance goals", expectedIntent: "employee_data" }
        ]
      }
    ];

    console.log('2. Testing Enhanced Intent Classification...\n');
    
    let totalTests = 0;
    let passedTests = 0;
    let categoryResults = {};
    
    for (const category of enhancedTestCases) {
      console.log(`📋 ${category.category}:`);
      
      let categoryPassed = 0;
      let categoryTotal = 0;
      
      for (const test of category.tests) {
        totalTests++;
        categoryTotal++;
        
        try {
          const intent = await aiService.detectQueryIntent(test.query);
          const passed = intent.type === test.expectedIntent;
          
          if (passed) {
            passedTests++;
            categoryPassed++;
            console.log(`   ✅ "${test.query}" → ${intent.type} (confidence: ${intent.confidence})`);
          } else {
            console.log(`   ❌ "${test.query}" → ${intent.type} (expected: ${test.expectedIntent})`);
          }
        } catch (error) {
          console.log(`   💥 "${test.query}" → ERROR: ${error.message}`);
        }
      }
      
      const categoryAccuracy = ((categoryPassed / categoryTotal) * 100).toFixed(1);
      categoryResults[category.category] = {
        passed: categoryPassed,
        total: categoryTotal,
        accuracy: categoryAccuracy
      };
      
      console.log(`   📊 Category Accuracy: ${categoryPassed}/${categoryTotal} (${categoryAccuracy}%)`);
      console.log('');
    }

    console.log('📊 ENHANCED INTENT CLASSIFICATION RESULTS:\n');
    
    // Overall results
    const overallAccuracy = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`🎯 Overall Accuracy: ${passedTests}/${totalTests} (${overallAccuracy}%)`);
    console.log('');
    
    // Category breakdown
    console.log('📈 Category Breakdown:');
    for (const [category, results] of Object.entries(categoryResults)) {
      const status = results.accuracy === '100.0' ? '✅' : '⚠️';
      console.log(`   ${status} ${category}: ${results.accuracy}%`);
    }
    console.log('');

    // Specific improvements analysis
    console.log('🔍 IMPROVEMENT ANALYSIS:');
    
    const previouslyFailedTests = [
      { query: "What's 2+2?", category: "Out-of-scope", expectedIntent: "out_of_scope" },
      { query: "Tell me about other employee's performance", category: "Unauthorized Access", expectedIntent: "unauthorized_access" },
      { query: "How do I apply for annual leave?", category: "Policy Questions", expectedIntent: "policy_question" }
    ];
    
    console.log('   Previously Failed Tests:');
    for (const test of previouslyFailedTests) {
      try {
        const intent = await aiService.detectQueryIntent(test.query);
        const fixed = intent.type === test.expectedIntent;
        const status = fixed ? '✅ FIXED' : '❌ STILL FAILING';
        console.log(`   ${status} "${test.query}" → ${intent.type} (${test.category})`);
      } catch (error) {
        console.log(`   💥 "${test.query}" → ERROR: ${error.message}`);
      }
    }
    console.log('');

    // Success criteria check
    const targetAccuracy = 100;
    const achievedTarget = overallAccuracy >= targetAccuracy;
    
    console.log('🎯 SUCCESS CRITERIA:');
    console.log(`   Target Accuracy: ${targetAccuracy}%`);
    console.log(`   Achieved Accuracy: ${overallAccuracy}%`);
    console.log(`   Status: ${achievedTarget ? '✅ TARGET ACHIEVED' : '❌ TARGET NOT MET'}`);
    console.log('');

    if (achievedTarget) {
      console.log('🎉 ENHANCEMENT SUCCESS!');
      console.log('✅ All intent classification categories now achieve 100% accuracy');
      console.log('✅ Mathematical expressions properly detected as out-of-scope');
      console.log('✅ Unauthorized access patterns comprehensively covered');
      console.log('✅ Policy question variations fully supported');
      console.log('✅ Control groups maintained perfect accuracy');
      console.log('\n🚀 Shubh\'s intent classification is now production-ready with 100% accuracy!');
    } else {
      console.log('⚠️ ENHANCEMENT INCOMPLETE');
      console.log('Some categories still need improvement to reach 100% accuracy');
      console.log('Review the failed test cases above for further pattern refinement');
    }

  } catch (error) {
    console.error('❌ Enhanced test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the enhanced test
testEnhancedIntentClassification().then(() => {
  console.log('\n🏁 Enhanced intent classification testing completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Enhanced test crashed:', error);
  process.exit(1);
});
