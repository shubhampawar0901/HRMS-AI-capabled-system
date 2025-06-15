// Quick test for model selection optimization
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const AIService = require('./services/AIService');

console.log('🚀 Testing Model Selection Optimization...\n');

async function testModelSelection() {
  try {
    const aiService = new AIService();
    const userContext = {
      userId: 1,
      role: 'employee',
      employeeId: 1,
      employeeName: 'John Doe'
    };

    const testQueries = [
      { query: "Hi", expectedModel: "none", description: "Greeting - No LLM needed" },
      { query: "What's the dress code?", expectedModel: "fast", description: "Simple policy - Fast model" },
      { query: "Tell me about all compensation benefits including detailed PF calculations, gratuity rules, insurance coverage, and tax implications", expectedModel: "advanced", description: "Complex query - Advanced model" }
    ];

    console.log('Testing model selection for different query types:\n');

    for (const test of testQueries) {
      console.log(`📝 Query: "${test.query}"`);
      console.log(`   Expected: ${test.expectedModel} model`);
      
      const startTime = Date.now();
      const response = await aiService.processChatbotQuery(test.query, userContext);
      const responseTime = Date.now() - startTime;
      
      console.log(`   Actual: ${response.modelUsed || 'none'} model`);
      console.log(`   Response time: ${responseTime}ms`);
      console.log(`   Intent: ${response.intent}`);
      console.log(`   Description: ${test.description}`);
      
      if (response.modelUsed === test.expectedModel || (!response.modelUsed && test.expectedModel === 'none')) {
        console.log(`   ✅ Correct model selection`);
      } else {
        console.log(`   ⚠️ Unexpected model selection`);
      }
      console.log('');
    }

    console.log('🎯 Model Selection Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testModelSelection().then(() => {
  console.log('\n🏁 Model selection testing completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
