// Test script for spelling mistakes in Shubh HR Chatbot
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const AIService = require('./services/AIService');

console.log('🔤 Testing Spelling Mistakes in Shubh HR Chatbot...\n');

async function testSpellingMistakes() {
  try {
    const aiService = new AIService();
    const userContext = {
      userId: 1,
      role: 'employee',
      employeeId: 1,
      employeeName: 'John Doe'
    };

    // Test cases with common spelling mistakes
    const spellingTestCases = [
      // GREETING VARIATIONS
      {
        category: "GREETING SPELLING MISTAKES",
        tests: [
          { query: "hi", expected: "greeting", description: "Correct spelling" },
          { query: "gud mrng", expected: "greeting", description: "Good morning misspelled" },
          { query: "gud morning", expected: "greeting", description: "Good misspelled" },
          { query: "good mrng", expected: "greeting", description: "Morning misspelled" },
          { query: "helo", expected: "greeting", description: "Hello misspelled" },
          { query: "hii", expected: "greeting", description: "Hi with extra i" },
          { query: "heyyy", expected: "greeting", description: "Hey with extra y" }
        ]
      },
      
      // LEAVE BALANCE VARIATIONS
      {
        category: "LEAVE BALANCE SPELLING MISTAKES",
        tests: [
          { query: "what's my leave balance", expected: "leave_balance", description: "Correct spelling" },
          { query: "whats my leav balance", expected: "leave_balance", description: "Leave misspelled" },
          { query: "what's my leave balence", expected: "leave_balance", description: "Balance misspelled" },
          { query: "my leav balence", expected: "leave_balance", description: "Both misspelled" },
          { query: "leave balanc", expected: "leave_balance", description: "Balance truncated" }
        ]
      },
      
      // POLICY QUESTIONS VARIATIONS
      {
        category: "POLICY SPELLING MISTAKES",
        tests: [
          { query: "what's the maternity leave policy", expected: "policy_question", description: "Correct spelling" },
          { query: "whats the maturnity leave policy", expected: "policy_question", description: "Maternity misspelled" },
          { query: "what's the maternity leav policy", expected: "policy_question", description: "Leave misspelled" },
          { query: "maturnity leav policey", expected: "policy_question", description: "Multiple misspellings" },
          { query: "dress cod policy", expected: "policy_question", description: "Code misspelled" }
        ]
      },
      
      // OUT-OF-SCOPE VARIATIONS
      {
        category: "OUT-OF-SCOPE SPELLING MISTAKES",
        tests: [
          { query: "what's 2+2", expected: "out_of_scope", description: "Correct spelling" },
          { query: "whats 2+2", expected: "out_of_scope", description: "What's without apostrophe" },
          { query: "tell me a jok", expected: "out_of_scope", description: "Joke misspelled" },
          { query: "wether today", expected: "out_of_scope", description: "Weather misspelled" }
        ]
      }
    ];

    console.log('Testing current system with spelling mistakes:\n');
    
    let totalTests = 0;
    let correctClassifications = 0;
    const results = [];

    for (const category of spellingTestCases) {
      console.log(`📝 ${category.category}:`);
      
      for (const test of category.tests) {
        totalTests++;
        
        try {
          const intent = await aiService.detectQueryIntent(test.query);
          const isCorrect = intent.type === test.expected;
          
          if (isCorrect) {
            correctClassifications++;
            console.log(`   ✅ "${test.query}" → ${intent.type} (${test.description})`);
          } else {
            console.log(`   ❌ "${test.query}" → ${intent.type} (expected: ${test.expected}) - ${test.description}`);
          }
          
          results.push({
            query: test.query,
            expected: test.expected,
            actual: intent.type,
            correct: isCorrect,
            description: test.description
          });
          
        } catch (error) {
          console.log(`   💥 "${test.query}" → ERROR: ${error.message}`);
        }
      }
      console.log('');
    }

    // Summary
    const accuracy = ((correctClassifications / totalTests) * 100).toFixed(1);
    console.log(`📊 SPELLING MISTAKE TEST RESULTS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Correct Classifications: ${correctClassifications}`);
    console.log(`   Accuracy: ${accuracy}%`);
    console.log('');

    // Analyze failures
    const failures = results.filter(r => !r.correct);
    if (failures.length > 0) {
      console.log(`❌ FAILED CASES (${failures.length}):`);
      failures.forEach(failure => {
        console.log(`   "${failure.query}" → ${failure.actual} (expected: ${failure.expected})`);
      });
      console.log('');
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (accuracy < 80) {
      console.log('   ⚠️ Current system struggles with spelling mistakes');
      console.log('   🔧 Consider implementing fuzzy matching or spell correction');
    } else {
      console.log('   ✅ Current system handles most spelling variations well');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpellingMistakes().then(() => {
  console.log('\n🏁 Spelling mistake testing completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
