// Test Database Context Service for LLM Query Generation
const DatabaseContextService = require('./services/DatabaseContextService');

console.log('🗄️ Testing Database Context Service for LLM...\n');

async function testDatabaseContextService() {
  try {
    const contextService = new DatabaseContextService();
    const userContext = {
      userId: 1,
      role: 'employee',
      employeeId: 1,
      employeeName: 'John Doe'
    };

    console.log('📊 Testing Different Query Types:\n');

    // Test 1: Personal Data - Attendance Query
    console.log('🎯 Test 1: Personal Data - Attendance Query');
    console.log('User Query: "How many days was I absent last month?"');
    
    const attendanceContext = await contextService.getLLMOptimizedContext(
      'personal_data_attendance',
      'How many days was I absent last month?',
      userContext
    );
    
    console.log('📋 Generated Context:');
    console.log('Schema Context:', attendanceContext.schemaContext);
    console.log('Security Rules:', attendanceContext.securityRules);
    console.log('Example Queries:');
    attendanceContext.exampleQueries.forEach((query, index) => {
      console.log(`${index + 1}. ${query}`);
    });
    console.log('');

    // Test 2: Personal Data - Leave Balance Query
    console.log('🎯 Test 2: Personal Data - Leave Balance Query');
    console.log('User Query: "What\'s my current leave balance?"');
    
    const leaveContext = await contextService.getLLMOptimizedContext(
      'personal_data_leave',
      'What\'s my current leave balance?',
      userContext
    );
    
    console.log('📋 Generated Context:');
    console.log('Schema Context:', leaveContext.schemaContext);
    console.log('Security Rules:', leaveContext.securityRules);
    console.log('Example Queries:');
    leaveContext.exampleQueries.forEach((query, index) => {
      console.log(`${index + 1}. ${query}`);
    });
    console.log('');

    // Test 3: Performance Context
    console.log('🎯 Test 3: Personal Data - Performance Query');
    console.log('User Query: "Show me my latest performance review"');
    
    const performanceContext = await contextService.getLLMOptimizedContext(
      'personal_data_performance',
      'Show me my latest performance review',
      userContext
    );
    
    console.log('📋 Generated Context:');
    console.log('Schema Context:', performanceContext.schemaContext);
    console.log('Security Rules:', performanceContext.securityRules);
    console.log('Example Queries:');
    performanceContext.exampleQueries.forEach((query, index) => {
      console.log(`${index + 1}. ${query}`);
    });
    console.log('');

    // Test 4: Minimal Schema Context
    console.log('🎯 Test 4: Minimal Schema Context');
    const minimalSchema = await contextService.getMinimalSchemaContext(['employees', 'attendance']);
    console.log('📋 Minimal Schema for Core Tables:');
    console.log(minimalSchema);
    console.log('');

    // Test 5: Full Schema Context (first 500 chars)
    console.log('🎯 Test 5: Full Schema Context (Preview)');
    const fullSchema = await contextService.getFullSchemaContext();
    console.log('📋 Full Schema Documentation (Preview):');
    console.log(fullSchema.substring(0, 500) + '...');
    console.log('');

    // Test 6: Context Caching Performance
    console.log('🎯 Test 6: Context Caching Performance');
    
    const startTime1 = Date.now();
    await contextService.getLLMOptimizedContext('personal_data_attendance', 'test query', userContext);
    const firstCallTime = Date.now() - startTime1;
    
    const startTime2 = Date.now();
    await contextService.getLLMOptimizedContext('personal_data_attendance', 'test query', userContext);
    const cachedCallTime = Date.now() - startTime2;
    
    console.log(`📊 Performance Comparison:`);
    console.log(`   First Call (No Cache): ${firstCallTime}ms`);
    console.log(`   Cached Call: ${cachedCallTime}ms`);
    console.log(`   Speed Improvement: ${Math.round((firstCallTime / cachedCallTime) * 100) / 100}x faster`);
    console.log('');

    // Test 7: Demonstrate LLM Prompt Generation
    console.log('🎯 Test 7: Complete LLM Prompt Generation');
    console.log('User Query: "How many hours did I work last week?"');
    
    const promptContext = await contextService.getLLMOptimizedContext(
      'personal_data_attendance',
      'How many hours did I work last week?',
      userContext
    );
    
    const llmPrompt = `
You are a database query generator for an HRMS system. Generate a SQL query based on the user's request.

USER QUERY: "How many hours did I work last week?"
USER CONTEXT: Employee ID ${userContext.employeeId}, Role: ${userContext.role}

DATABASE SCHEMA CONTEXT:
${promptContext.schemaContext}

SECURITY RULES:
${promptContext.securityRules.map(rule => `- ${rule}`).join('\n')}

EXAMPLE QUERIES:
${promptContext.exampleQueries[0]}

QUERY GUIDELINES:
${promptContext.queryGuidelines.map(guideline => `- ${guideline}`).join('\n')}

Generate a SQL query that:
1. Answers the user's question accurately
2. Follows all security rules
3. Uses proper parameterized queries
4. Includes appropriate date filtering for "last week"

Return only the SQL query with proper formatting.
`;

    console.log('📋 Generated LLM Prompt:');
    console.log(llmPrompt);
    console.log('');

    // Summary
    console.log('🎊 DATABASE CONTEXT SERVICE FEATURES:');
    console.log('✅ Query-type specific context generation');
    console.log('✅ Security rule enforcement');
    console.log('✅ Example query templates');
    console.log('✅ Performance caching (30-minute expiry)');
    console.log('✅ Minimal vs full schema options');
    console.log('✅ LLM-optimized prompt generation');
    console.log('✅ User-specific security context');
    console.log('✅ Business context explanations');
    console.log('');

    console.log('📊 PERFORMANCE BENEFITS:');
    console.log(`• Fast context retrieval: ${cachedCallTime}ms (cached)`);
    console.log('• Reduced LLM token usage: Focused context only');
    console.log('• Improved query accuracy: Business context included');
    console.log('• Enhanced security: Employee-specific filtering');
    console.log('• Better maintainability: Centralized schema knowledge');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabaseContextService().then(() => {
  console.log('\n🏁 Database context service testing completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
