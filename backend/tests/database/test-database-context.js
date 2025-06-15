// Test Database Context Generation
require('dotenv').config();
const DatabaseContextService = require('./services/DatabaseContextService');

async function testDatabaseContext() {
  console.log('🔍 Testing Database Context Generation...\n');
  
  try {
    const dbContextService = new DatabaseContextService();
    
    const userContext = {
      employeeId: 3,
      role: 'employee',
      employeeName: 'John Doe'
    };
    
    // Test attendance query context
    console.log('📊 Testing personal_data_attendance context:');
    const attendanceContext = await dbContextService.getLLMOptimizedContext(
      'personal_data_attendance',
      'Show me my attendance for this month',
      userContext
    );
    
    console.log('Schema Context:');
    console.log(attendanceContext.schemaContext);
    console.log('\nSecurity Rules:');
    console.log(attendanceContext.securityRules);
    console.log('\nExample Queries:');
    attendanceContext.exampleQueries.forEach((query, index) => {
      console.log(`${index + 1}. ${query}`);
    });
    
    // Test the specific table context
    console.log('\n🗄️ Testing attendance table context:');
    const basicContext = await dbContextService.getContextForQuery('personal_data_attendance', ['attendance'], userContext);
    console.log('Relevant Tables:', basicContext.relevantTables);
    console.log('Business Context:', basicContext.businessContext);
    
  } catch (error) {
    console.error('❌ Error testing database context:', error);
  }
}

// Run the test
if (require.main === module) {
  testDatabaseContext().catch(console.error);
}
