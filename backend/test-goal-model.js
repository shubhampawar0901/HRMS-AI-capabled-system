const PerformanceGoal = require('./models/PerformanceGoal');

async function testGoalModel() {
  try {
    console.log('🔍 Testing PerformanceGoal Model directly...');
    
    // Test the findAll method with the same parameters that are failing
    const options = {
      status: null,
      page: 1,
      limit: 100
    };
    
    console.log('Testing with options:', options);
    
    const goals = await PerformanceGoal.findAll(options);
    console.log('✅ Goals retrieved:', goals.length);
    
    // Test count method
    const count = await PerformanceGoal.count(options);
    console.log('✅ Total count:', count);
    
  } catch (error) {
    console.error('❌ Error testing PerformanceGoal model:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGoalModel();
