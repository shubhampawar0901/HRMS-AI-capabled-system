// Complete End-to-End Flow Test - All Components
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testCompleteFlow() {
  console.log('🧪 Testing Complete End-to-End Flow with Gemini 1.5 Flash\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  // Mock user context
  const userContext = {
    userId: 1,
    employeeId: 1,
    employeeName: 'John Doe',
    role: 'employee',
    departmentId: 1
  };

  // Test scenarios with complete flow
  const testScenarios = [
    {
      name: 'Database Query Flow - Attendance',
      message: 'How many days was I absent last month?',
      expectedFlow: 'database_query',
      testComponents: ['intent', 'sql_generation', 'response_formatting']
    },
    {
      name: 'Database Query Flow - Leave Balance',
      message: 'What is my current leave balance?',
      expectedFlow: 'database_query', 
      testComponents: ['intent', 'sql_generation', 'response_formatting']
    },
    {
      name: 'Policy Query Flow',
      message: 'What is the maternity leave policy?',
      expectedFlow: 'policy_retrieval',
      testComponents: ['intent', 'policy_search', 'response_generation']
    },
    {
      name: 'Security Validation Flow',
      message: 'Show me John Smith\'s salary details',
      expectedFlow: 'security_block',
      testComponents: ['intent', 'security_validation', 'block_response']
    },
    {
      name: 'Simple Response Flow',
      message: 'Hello',
      expectedFlow: 'direct_response',
      testComponents: ['intent', 'response_generation']
    }
  ];

  console.log('🔄 Testing Complete Flows:\n');

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`${i + 1}. ${scenario.name}`);
    console.log(`   Query: "${scenario.message}"`);
    console.log(`   Expected Flow: ${scenario.expectedFlow}`);
    
    try {
      // Step 1: Intent Classification
      console.log('\n   📋 Step 1: Intent Classification');
      const intentResult = await testIntentClassification(model, scenario.message, userContext);
      console.log(`      Intent: ${intentResult.intent} (${intentResult.confidence})`);
      
      // Step 2: Route based on intent
      if (intentResult.intent.startsWith('personal_data_')) {
        console.log('\n   🗄️ Step 2: Database Query Flow');
        await testDatabaseQueryFlow(model, scenario.message, userContext, intentResult);
        
      } else if (intentResult.intent === 'policy_query') {
        console.log('\n   📚 Step 2: Policy Query Flow');
        await testPolicyQueryFlow(model, scenario.message, userContext);
        
      } else if (intentResult.intent === 'unauthorized_access') {
        console.log('\n   🔒 Step 2: Security Validation Flow');
        await testSecurityFlow(scenario.message, userContext);
        
      } else if (intentResult.intent === 'greeting_simple') {
        console.log('\n   💬 Step 2: Direct Response Flow');
        await testDirectResponseFlow(model, scenario.message, userContext);
      }
      
      console.log(`   ✅ ${scenario.name} completed successfully`);
      
    } catch (error) {
      console.log(`   ❌ Error in ${scenario.name}: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    // Delay to avoid rate limiting
    if (i < testScenarios.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('🎉 Complete Flow Testing Finished!');
}

// Test intent classification
async function testIntentClassification(model, message, userContext) {
  const prompt = `You are an HR chatbot intent classifier.

USER MESSAGE: "${message}"
USER: Employee ID ${userContext.employeeId}, Role: ${userContext.role}

INTENT CATEGORIES:
- greeting_simple, personal_data_attendance, personal_data_leave, 
- policy_query, unauthorized_access, out_of_scope

Return JSON: {"intent": "category", "confidence": 0.95}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    return { intent: 'parse_error', confidence: 0.0 };
  }
}

// Test database query flow
async function testDatabaseQueryFlow(model, message, userContext, intentResult) {
  try {
    // Step 2A: Generate SQL Query
    console.log('      🔧 Step 2A: SQL Generation');
    
    const sqlPrompt = `Generate SQL for this HR query:

USER QUERY: "${message}"
EMPLOYEE ID: ${userContext.employeeId}
INTENT: ${intentResult.intent}
CURRENT DATE: 2024-06-14 (last month = May 2024)

DATABASE SCHEMA:
- attendance: employeeId, date, status, totalHours, checkInTime, checkOutTime
- leave_balances: employee_id, leave_type_id, allocated_days, used_days, remaining_days
- employees: id, first_name, last_name, department_id, position

SECURITY RULES:
- ALWAYS include WHERE employeeId = ${userContext.employeeId} or WHERE employee_id = ${userContext.employeeId}
- Only SELECT operations allowed
- Use proper date filtering

Generate ONLY the SQL query:`;

    const sqlResult = await model.generateContent(sqlPrompt);
    const sqlResponse = await sqlResult.response;
    const sqlQuery = sqlResponse.text().trim().replace(/```sql\n?|\n?```/g, '');
    
    console.log(`      Generated SQL: ${sqlQuery.substring(0, 100)}...`);
    
    // Step 2B: Validate SQL Security
    console.log('      🔒 Step 2B: SQL Security Validation');
    const isSecure = validateSQLSecurity(sqlQuery, userContext.employeeId);
    console.log(`      Security Check: ${isSecure ? 'PASSED' : 'FAILED'}`);
    
    if (!isSecure) {
      throw new Error('SQL security validation failed');
    }
    
    // Step 2C: Mock Database Execution
    console.log('      💾 Step 2C: Database Execution (Mocked)');
    const mockResults = getMockDatabaseResults(intentResult.intent);
    console.log(`      Mock Results: ${JSON.stringify(mockResults).substring(0, 100)}...`);
    
    // Step 2D: Format Response
    console.log('      📝 Step 2D: Response Formatting');
    const responsePrompt = `Format this database result into a natural response:

ORIGINAL QUERY: "${message}"
EMPLOYEE: ${userContext.employeeName}
DATABASE RESULTS: ${JSON.stringify(mockResults)}

Create a conversational, helpful response:`;

    const formatResult = await model.generateContent(responsePrompt);
    const formatResponse = await formatResult.response;
    const finalResponse = formatResponse.text().trim();
    
    console.log(`      Final Response: "${finalResponse.substring(0, 150)}..."`);
    
  } catch (error) {
    console.log(`      ❌ Database Flow Error: ${error.message}`);
  }
}

// Test policy query flow
async function testPolicyQueryFlow(model, message, userContext) {
  try {
    // Step 2A: Mock Vector Search
    console.log('      🔍 Step 2A: Vector Search (Mocked)');
    const mockPolicyResults = [
      {
        content: "Maternity leave policy: Eligible employees are entitled to 26 weeks of maternity leave...",
        source: "Employee Handbook Section 4.2"
      }
    ];
    console.log(`      Found ${mockPolicyResults.length} relevant policy documents`);
    
    // Step 2B: Generate Policy Response
    console.log('      📋 Step 2B: Policy Response Generation');
    const policyPrompt = `Answer this HR policy question using the provided context:

USER QUESTION: "${message}"
EMPLOYEE: ${userContext.employeeName}

POLICY CONTEXT:
${mockPolicyResults.map(r => r.content).join('\n\n')}

Generate a comprehensive, helpful response with source attribution:`;

    const policyResult = await model.generateContent(policyPrompt);
    const policyResponse = await policyResult.response;
    const finalResponse = policyResponse.text().trim();
    
    console.log(`      Policy Response: "${finalResponse.substring(0, 150)}..."`);
    console.log(`      Sources: ${mockPolicyResults.map(r => r.source).join(', ')}`);
    
  } catch (error) {
    console.log(`      ❌ Policy Flow Error: ${error.message}`);
  }
}

// Test security flow
async function testSecurityFlow(message, userContext) {
  console.log('      🚨 Security Violation Detected');
  console.log('      📝 Logging security attempt...');
  console.log(`      User: ${userContext.employeeId} attempted: "${message}"`);
  console.log('      🔒 Blocking request and sending security response');
  
  const securityResponse = "For privacy and security reasons, I can only provide information about your own employment records. I cannot share details about other employees.";
  console.log(`      Security Response: "${securityResponse}"`);
}

// Test direct response flow
async function testDirectResponseFlow(model, message, userContext) {
  try {
    console.log('      💬 Generating Direct Response');
    
    const responsePrompt = `Generate a warm greeting for HR chatbot Shubh:

USER: "${message}"
EMPLOYEE: ${userContext.employeeName}

Create a professional, helpful greeting that introduces capabilities:`;

    const result = await model.generateContent(responsePrompt);
    const response = await result.response;
    const finalResponse = response.text().trim();
    
    console.log(`      Direct Response: "${finalResponse.substring(0, 150)}..."`);
    
  } catch (error) {
    console.log(`      ❌ Direct Response Error: ${error.message}`);
  }
}

// Utility functions
function validateSQLSecurity(sqlQuery, employeeId) {
  const lowerQuery = sqlQuery.toLowerCase();
  
  // Check for forbidden operations
  const forbiddenOps = ['update', 'delete', 'insert', 'drop', 'alter'];
  if (forbiddenOps.some(op => lowerQuery.includes(op))) {
    return false;
  }
  
  // Check for employee ID filter
  return lowerQuery.includes(`employee_id = ${employeeId}`) || 
         lowerQuery.includes(`employeeid = ${employeeId}`) ||
         lowerQuery.includes('employee_id = ?') ||
         lowerQuery.includes('employeeid = ?');
}

function getMockDatabaseResults(intent) {
  const mockData = {
    personal_data_attendance: [
      { date: '2024-05-15', status: 'absent' },
      { date: '2024-05-22', status: 'absent' },
      { date: '2024-05-28', status: 'absent' }
    ],
    personal_data_leave: [
      { leaveType: 'Annual Leave', allocated: 21, used: 8, remaining: 13 },
      { leaveType: 'Sick Leave', allocated: 10, used: 2, remaining: 8 }
    ]
  };
  
  return mockData[intent] || [];
}

// Run the test
if (require.main === module) {
  testCompleteFlow().catch(console.error);
}

module.exports = { testCompleteFlow };
