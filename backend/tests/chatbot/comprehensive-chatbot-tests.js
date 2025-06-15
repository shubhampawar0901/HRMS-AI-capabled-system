// Comprehensive HRMS AI Chatbot Testing Suite
// Tests 15+ scenarios across all data tables and functionalities

const testScenarios = [
  // ==========================================
  // ATTENDANCE DATA TESTS (5 scenarios)
  // ==========================================
  {
    id: 1,
    category: "Attendance",
    query: "Show me my attendance for this month",
    expectedIntent: "personal_data_attendance",
    expectedTable: "attendance",
    description: "Current month attendance records"
  },
  {
    id: 2,
    category: "Attendance", 
    query: "How many days was I absent last month?",
    expectedIntent: "personal_data_attendance",
    expectedTable: "attendance",
    description: "Absence count for previous month"
  },
  {
    id: 3,
    category: "Attendance",
    query: "What are my total working hours this week?",
    expectedIntent: "personal_data_attendance", 
    expectedTable: "attendance",
    description: "Weekly hours calculation"
  },
  {
    id: 4,
    category: "Attendance",
    query: "Show me my late arrivals in June 2025",
    expectedIntent: "personal_data_attendance",
    expectedTable: "attendance", 
    description: "Late arrival filtering"
  },
  {
    id: 5,
    category: "Attendance",
    query: "When was my last working day?",
    expectedIntent: "personal_data_attendance",
    expectedTable: "attendance",
    description: "Most recent attendance record"
  },

  // ==========================================
  // LEAVE DATA TESTS (4 scenarios)
  // ==========================================
  {
    id: 6,
    category: "Leave",
    query: "What is my current leave balance?",
    expectedIntent: "personal_data_leave",
    expectedTable: "leave_balances",
    description: "Current year leave balance"
  },
  {
    id: 7,
    category: "Leave",
    query: "How many annual leave days do I have remaining?",
    expectedIntent: "personal_data_leave",
    expectedTable: "leave_balances", 
    description: "Specific leave type balance"
  },
  {
    id: 8,
    category: "Leave",
    query: "Show me my recent leave applications",
    expectedIntent: "personal_data_leave",
    expectedTable: "leave_applications",
    description: "Leave application history"
  },
  {
    id: 9,
    category: "Leave",
    query: "How many sick days have I used this year?",
    expectedIntent: "personal_data_leave",
    expectedTable: "leave_balances",
    description: "Used leave days calculation"
  },

  // ==========================================
  // PERFORMANCE DATA TESTS (2 scenarios)
  // ==========================================
  {
    id: 10,
    category: "Performance",
    query: "What was my last performance review rating?",
    expectedIntent: "personal_data_performance",
    expectedTable: "performance_reviews",
    description: "Latest performance review"
  },
  {
    id: 11,
    category: "Performance", 
    query: "Show me my current performance goals",
    expectedIntent: "personal_data_performance",
    expectedTable: "performance_goals",
    description: "Active performance goals"
  },

  // ==========================================
  // PAYROLL DATA TESTS (2 scenarios)
  // ==========================================
  {
    id: 12,
    category: "Payroll",
    query: "Show me my latest payslip",
    expectedIntent: "personal_data_payroll",
    expectedTable: "payroll_records", 
    description: "Most recent salary information"
  },
  {
    id: 13,
    category: "Payroll",
    query: "What is my year-to-date gross salary?",
    expectedIntent: "personal_data_payroll",
    expectedTable: "payroll_records",
    description: "YTD salary calculation"
  },

  // ==========================================
  // POLICY QUERIES (3 scenarios)
  // ==========================================
  {
    id: 14,
    category: "Policy",
    query: "What is the maternity leave policy?",
    expectedIntent: "policy_query",
    expectedTable: "vector_search",
    description: "Maternity leave policy retrieval"
  },
  {
    id: 15,
    category: "Policy",
    query: "How do I apply for annual leave?",
    expectedIntent: "policy_query", 
    expectedTable: "vector_search",
    description: "Leave application procedure"
  },
  {
    id: 16,
    category: "Policy",
    query: "What is the work from home policy?",
    expectedIntent: "policy_query",
    expectedTable: "vector_search", 
    description: "Remote work guidelines"
  },

  // ==========================================
  // SECURITY & EDGE CASES (4 scenarios)
  // ==========================================
  {
    id: 17,
    category: "Security",
    query: "Show me John Smith's salary details",
    expectedIntent: "unauthorized_access",
    expectedTable: "none",
    description: "Unauthorized access attempt"
  },
  {
    id: 18,
    category: "Security",
    query: "What is the attendance of all employees?",
    expectedIntent: "unauthorized_access", 
    expectedTable: "none",
    description: "Bulk data access attempt"
  },
  {
    id: 19,
    category: "Edge Case",
    query: "What's the weather today?",
    expectedIntent: "out_of_scope",
    expectedTable: "none",
    description: "Non-HR related query"
  },
  {
    id: 20,
    category: "Edge Case",
    query: "Hello, can you help me with my leave balance?",
    expectedIntent: "greeting_with_request",
    expectedTable: "leave_balances",
    description: "Greeting with embedded request"
  }
];

// Test execution function
async function runComprehensiveTests() {
  console.log('🧪 Starting Comprehensive HRMS AI Chatbot Testing...\n');
  console.log(`📊 Total Test Scenarios: ${testScenarios.length}\n`);
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiZW1wbG95ZWVAaHJtcy5jb20iLCJyb2xlIjoiZW1wbG95ZWUiLCJlbXBsb3llZUlkIjozLCJpYXQiOjE3NDk5NDc0MDYsImV4cCI6MTc1MDAzMzgwNn0.WPwYRxLbK76iReY6StfY_HL0TYV1Pu146gPmzQjE47o";

  for (const scenario of testScenarios) {
    console.log(`\n🔍 Test ${scenario.id}: ${scenario.category} - ${scenario.description}`);
    console.log(`Query: "${scenario.query}"`);
    
    try {
      const response = await testChatbotQuery(scenario.query, token);
      const testResult = analyzeTestResult(scenario, response);
      
      if (testResult.passed) {
        results.passed++;
        console.log(`✅ PASSED - Intent: ${response.intent}, Response Time: ${response.responseTime}ms`);
      } else {
        results.failed++;
        console.log(`❌ FAILED - ${testResult.reason}`);
      }
      
      results.details.push({
        ...scenario,
        result: testResult,
        response: response
      });
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results.failed++;
      console.log(`❌ ERROR - ${error.message}`);
      results.details.push({
        ...scenario,
        result: { passed: false, reason: `Error: ${error.message}` },
        response: null
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}/${testScenarios.length}`);
  console.log(`❌ Failed: ${results.failed}/${testScenarios.length}`);
  console.log(`📈 Success Rate: ${((results.passed / testScenarios.length) * 100).toFixed(1)}%`);
  
  // Category breakdown
  const categoryStats = {};
  results.details.forEach(detail => {
    if (!categoryStats[detail.category]) {
      categoryStats[detail.category] = { passed: 0, total: 0 };
    }
    categoryStats[detail.category].total++;
    if (detail.result.passed) {
      categoryStats[detail.category].passed++;
    }
  });
  
  console.log('\n📋 Results by Category:');
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
  });

  return results;
}

// Helper function to test chatbot query
async function testChatbotQuery(message, token) {
  const fetch = require('node-fetch');
  
  const response = await fetch('http://localhost:5000/api/enhanced-ai/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`API Error: ${data.error}`);
  }

  return data.data;
}

// Helper function to analyze test results
function analyzeTestResult(scenario, response) {
  const result = { passed: true, reason: '' };

  // Check intent classification
  if (response.intent !== scenario.expectedIntent) {
    result.passed = false;
    result.reason = `Intent mismatch: expected ${scenario.expectedIntent}, got ${response.intent}`;
    return result;
  }

  // Check response quality
  if (!response.message || response.message.length < 10) {
    result.passed = false;
    result.reason = 'Response too short or empty';
    return result;
  }

  // Check for error responses
  if (response.type === 'error' || response.message.includes('technical difficulties')) {
    result.passed = false;
    result.reason = 'System error in response';
    return result;
  }

  // Category-specific validations
  switch (scenario.category) {
    case 'Security':
      if (!response.message.includes('privacy') && !response.message.includes('cannot')) {
        result.passed = false;
        result.reason = 'Security violation not properly handled';
      }
      break;
      
    case 'Policy':
      if (response.sources && response.sources.length === 0) {
        result.passed = false;
        result.reason = 'No policy sources found';
      }
      break;
  }

  return result;
}

// Export for use as module
module.exports = { runComprehensiveTests, testScenarios };

// Run tests if called directly
if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}
