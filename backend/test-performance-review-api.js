const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials - you'll need to update these with actual tokens
const MANAGER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJtYW5hZ2VyIiwiZW1wbG95ZWVJZCI6MiwiaWF0IjoxNzM3MDI5NzI5LCJleHAiOjE3MzcwMzMzMjl9.example'; // Replace with actual manager token
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImVtcGxveWVlSWQiOm51bGwsImlhdCI6MTczNzAyOTcyOSwiZXhwIjoxNzM3MDMzMzI5fQ.example'; // Replace with actual admin token

async function testManagerEmployeeAPI() {
  console.log('🔍 Testing Manager-Employee API Endpoints...\n');

  try {
    // Test 1: Manager fetching their team members
    console.log('📋 Test 1: Manager fetching team members');
    try {
      const response = await axios.get(`${BASE_URL}/employees?managerId=2`, {
        headers: {
          'Authorization': `Bearer ${MANAGER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Manager team fetch successful');
      console.log(`Found ${response.data.data.employees.length} team members`);
      response.data.data.employees.forEach(emp => {
        console.log(`  - ${emp.first_name} ${emp.last_name} (ID: ${emp.id})`);
      });
    } catch (error) {
      console.log('❌ Manager team fetch failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Manager trying to create performance review for team member
    console.log('\n🎯 Test 2: Manager creating performance review for team member');
    try {
      const reviewData = {
        employeeId: 30, // Ashley Taylor (reports to manager ID 2)
        reviewPeriod: 'Q4 2024',
        overallRating: 4,
        comments: 'Excellent performance this quarter. Shows great initiative and teamwork.',
        goals: 'Continue developing leadership skills',
        achievements: 'Successfully led the new project implementation',
        areasForImprovement: 'Could improve time management',
        developmentPlan: 'Enroll in leadership training program'
      };

      const response = await axios.post(`${BASE_URL}/performance/reviews`, reviewData, {
        headers: {
          'Authorization': `Bearer ${MANAGER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Performance review creation successful');
      console.log('Review ID:', response.data.data.id);
    } catch (error) {
      console.log('❌ Performance review creation failed:', error.response?.data?.message || error.message);
      if (error.response?.data) {
        console.log('Error details:', error.response.data);
      }
    }

    // Test 3: Manager trying to create review for non-team member (should fail)
    console.log('\n🚫 Test 3: Manager trying to create review for non-team member (should fail)');
    try {
      const reviewData = {
        employeeId: 14, // David Wilson (IT Manager, not reporting to manager ID 2)
        reviewPeriod: 'Q4 2024',
        overallRating: 4,
        comments: 'This should fail because David Wilson is not a team member'
      };

      const response = await axios.post(`${BASE_URL}/performance/reviews`, reviewData, {
        headers: {
          'Authorization': `Bearer ${MANAGER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('❌ This should have failed! Manager was able to create review for non-team member');
    } catch (error) {
      console.log('✅ Correctly blocked: Manager cannot create review for non-team member');
      console.log('Error message:', error.response?.data?.message || error.message);
    }

    // Test 4: Admin creating review (should work for any employee)
    console.log('\n👑 Test 4: Admin creating performance review (should work for any employee)');
    try {
      const reviewData = {
        employeeId: 14, // David Wilson
        reviewPeriod: 'Q4 2024',
        overallRating: 5,
        comments: 'Outstanding leadership and technical expertise'
      };

      const response = await axios.post(`${BASE_URL}/performance/reviews`, reviewData, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Admin performance review creation successful');
      console.log('Review ID:', response.data.data.id);
    } catch (error) {
      console.log('❌ Admin performance review creation failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Helper function to get fresh tokens (you'll need to implement this)
async function getManagerToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.smith@company.com', // Manager email
      password: 'password123'
    });
    return response.data.data.token;
  } catch (error) {
    console.log('Failed to get manager token:', error.response?.data?.message);
    return null;
  }
}

async function getAdminToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@company.com', // Admin email
      password: 'admin123'
    });
    return response.data.data.token;
  } catch (error) {
    console.log('Failed to get admin token:', error.response?.data?.message);
    return null;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Performance Review API Tests\n');
  
  // Try to get fresh tokens
  console.log('🔑 Getting authentication tokens...');
  const managerToken = await getManagerToken();
  const adminToken = await getAdminToken();
  
  if (managerToken) {
    console.log('✅ Manager token obtained');
    // Update the global token
    MANAGER_TOKEN = managerToken;
  } else {
    console.log('⚠️  Using placeholder manager token (may fail)');
  }
  
  if (adminToken) {
    console.log('✅ Admin token obtained');
    ADMIN_TOKEN = adminToken;
  } else {
    console.log('⚠️  Using placeholder admin token (may fail)');
  }
  
  console.log('\n' + '='.repeat(50));
  await testManagerEmployeeAPI();
  console.log('\n✅ All tests completed');
}

runTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
