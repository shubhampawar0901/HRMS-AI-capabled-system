const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class APITestMaster {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:5000/api';
    this.testResults = [];
    this.authTokens = {};
    this.testUsers = [
      { email: 'admin@hrms.com', password: 'Admin123!', role: 'admin' },
      { email: 'manager@hrms.com', password: 'Manager123!', role: 'manager' },
      { email: 'employee@hrms.com', password: 'Employee123!', role: 'employee' }
    ];
    this.logMessages = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.logMessages.push(logMessage);
  }

  async runAllTests() {
    try {
      this.log('🚀 Starting comprehensive API testing...');
      
      // Test server availability
      await this.testServerHealth();
      
      // Test authentication
      await this.testAuthentication();
      
      // Test employee APIs
      await this.testEmployeeAPIs();
      
      // Test AI APIs
      await this.testAIAPIs();
      
      // Test placeholder APIs
      await this.testPlaceholderAPIs();
      
      // Generate test report
      await this.generateTestReport();
      
      this.log('✅ API testing completed successfully!');
      return { 
        success: true, 
        results: this.testResults,
        logs: this.logMessages
      };
      
    } catch (error) {
      this.log(`❌ API testing failed: ${error.message}`);
      throw error;
    }
  }

  async testServerHealth() {
    try {
      this.log('🏥 Testing server health...');
      
      const response = await axios.get(`${this.baseURL.replace('/api', '')}/health`, {
        timeout: 5000
      });
      
      this.addTestResult('Server Health', 'GET /health', true, response.status, response.data);
      this.log('✅ Server is healthy');
      
    } catch (error) {
      this.addTestResult('Server Health', 'GET /health', false, error.response?.status, error.message);
      this.log(`❌ Server health check failed: ${error.message}`);
      throw error;
    }
  }

  async testAuthentication() {
    try {
      this.log('🔐 Testing authentication...');
      
      for (const user of this.testUsers) {
        try {
          // Test login
          const loginResponse = await axios.post(`${this.baseURL}/auth/login`, {
            email: user.email,
            password: user.password
          });
          
          if (loginResponse.data.success && loginResponse.data.data.token) {
            this.authTokens[user.role] = loginResponse.data.data.token;
            this.addTestResult('Authentication', `POST /auth/login (${user.role})`, true, 
              loginResponse.status, 'Login successful');
            this.log(`✅ ${user.role} login successful`);
          } else {
            this.addTestResult('Authentication', `POST /auth/login (${user.role})`, false, 
              loginResponse.status, 'No token received');
            this.log(`❌ ${user.role} login failed - no token`);
          }
          
        } catch (error) {
          this.addTestResult('Authentication', `POST /auth/login (${user.role})`, false, 
            error.response?.status, error.message);
          this.log(`❌ ${user.role} login failed: ${error.message}`);
        }
      }
      
    } catch (error) {
      this.log(`❌ Authentication testing failed: ${error.message}`);
      throw error;
    }
  }

  async testEmployeeAPIs() {
    try {
      this.log('👥 Testing Employee APIs...');
      
      const adminToken = this.authTokens.admin;
      if (!adminToken) {
        this.log('⚠️  No admin token available, skipping employee API tests');
        return;
      }

      const headers = { Authorization: `Bearer ${adminToken}` };

      // Test GET /employees
      try {
        const response = await axios.get(`${this.baseURL}/employees`, { headers });
        this.addTestResult('Employee API', 'GET /employees', true, response.status, 
          `Found ${response.data.data?.employees?.length || 0} employees`);
        this.log(`✅ GET /employees - Found ${response.data.data?.employees?.length || 0} employees`);
      } catch (error) {
        this.addTestResult('Employee API', 'GET /employees', false, 
          error.response?.status, error.message);
        this.log(`❌ GET /employees failed: ${error.message}`);
      }

      // Test GET /employees/departments
      try {
        const response = await axios.get(`${this.baseURL}/employees/departments`, { headers });
        this.addTestResult('Employee API', 'GET /employees/departments', true, response.status,
          `Found ${response.data.data?.length || 0} departments`);
        this.log(`✅ GET /employees/departments - Found ${response.data.data?.length || 0} departments`);
      } catch (error) {
        this.addTestResult('Employee API', 'GET /employees/departments', false,
          error.response?.status, error.message);
        this.log(`❌ GET /employees/departments failed: ${error.message}`);
      }

      // Test GET /employees/stats/employees
      try {
        const response = await axios.get(`${this.baseURL}/employees/stats/employees`, { headers });
        this.addTestResult('Employee API', 'GET /employees/stats/employees', true, response.status,
          'Statistics retrieved');
        this.log(`✅ GET /employees/stats/employees - Statistics retrieved`);
      } catch (error) {
        this.addTestResult('Employee API', 'GET /employees/stats/employees', false,
          error.response?.status, error.message);
        this.log(`❌ GET /employees/stats/employees failed: ${error.message}`);
      }

      // Test GET /employees/:id (get specific employee)
      try {
        const response = await axios.get(`${this.baseURL}/employees/1`, { headers });
        this.addTestResult('Employee API', 'GET /employees/:id', true, response.status,
          `Employee details retrieved`);
        this.log(`✅ GET /employees/1 - Employee details retrieved`);
      } catch (error) {
        this.addTestResult('Employee API', 'GET /employees/:id', false,
          error.response?.status, error.message);
        this.log(`❌ GET /employees/1 failed: ${error.message}`);
      }

    } catch (error) {
      this.log(`❌ Employee API testing failed: ${error.message}`);
    }
  }

  async testAIAPIs() {
    try {
      this.log('🤖 Testing AI APIs...');
      
      const adminToken = this.authTokens.admin;
      if (!adminToken) {
        this.log('⚠️  No admin token available, skipping AI API tests');
        return;
      }

      const headers = { Authorization: `Bearer ${adminToken}` };

      // Test GET /ai/feature-status
      try {
        const response = await axios.get(`${this.baseURL}/ai/feature-status`, { headers });
        this.addTestResult('AI API', 'GET /ai/feature-status', true, response.status,
          'AI features status retrieved');
        this.log(`✅ GET /ai/feature-status - AI features status retrieved`);
      } catch (error) {
        this.addTestResult('AI API', 'GET /ai/feature-status', false,
          error.response?.status, error.message);
        this.log(`❌ GET /ai/feature-status failed: ${error.message}`);
      }

      // Test GET /ai/attrition-predictions
      try {
        const response = await axios.get(`${this.baseURL}/ai/attrition-predictions`, { headers });
        this.addTestResult('AI API', 'GET /ai/attrition-predictions', true, response.status,
          'Attrition predictions retrieved');
        this.log(`✅ GET /ai/attrition-predictions - Predictions retrieved`);
      } catch (error) {
        this.addTestResult('AI API', 'GET /ai/attrition-predictions', false,
          error.response?.status, error.message);
        this.log(`❌ GET /ai/attrition-predictions failed: ${error.message}`);
      }

      // Test GET /ai/attendance-anomalies
      try {
        const response = await axios.get(`${this.baseURL}/ai/attendance-anomalies`, { headers });
        this.addTestResult('AI API', 'GET /ai/attendance-anomalies', true, response.status,
          'Attendance anomalies retrieved');
        this.log(`✅ GET /ai/attendance-anomalies - Anomalies retrieved`);
      } catch (error) {
        this.addTestResult('AI API', 'GET /ai/attendance-anomalies', false,
          error.response?.status, error.message);
        this.log(`❌ GET /ai/attendance-anomalies failed: ${error.message}`);
      }

      // Test POST /ai/chatbot/query
      try {
        const response = await axios.post(`${this.baseURL}/ai/chatbot/query`, {
          message: 'Hello, what can you help me with?'
        }, { headers });
        this.addTestResult('AI API', 'POST /ai/chatbot/query', true, response.status,
          'Chatbot query processed');
        this.log(`✅ POST /ai/chatbot/query - Query processed`);
      } catch (error) {
        this.addTestResult('AI API', 'POST /ai/chatbot/query', false,
          error.response?.status, error.message);
        this.log(`❌ POST /ai/chatbot/query failed: ${error.message}`);
      }

    } catch (error) {
      this.log(`❌ AI API testing failed: ${error.message}`);
    }
  }

  async testPlaceholderAPIs() {
    try {
      this.log('📋 Testing placeholder APIs...');
      
      const placeholderEndpoints = [
        { service: 'auth', endpoint: '/auth/health' },
        { service: 'attendance', endpoint: '/attendance/health' },
        { service: 'leave', endpoint: '/leave/health' },
        { service: 'payroll', endpoint: '/payroll/health' },
        { service: 'performance', endpoint: '/performance/health' },
        { service: 'reports', endpoint: '/reports/health' }
      ];

      for (const api of placeholderEndpoints) {
        try {
          const response = await axios.get(`${this.baseURL}${api.endpoint}`);
          this.addTestResult('Placeholder API', `GET ${api.endpoint}`, true, response.status,
            `${api.service} service placeholder working`);
          this.log(`✅ ${api.endpoint} - Placeholder working`);
        } catch (error) {
          this.addTestResult('Placeholder API', `GET ${api.endpoint}`, false,
            error.response?.status, error.message);
          this.log(`❌ ${api.endpoint} failed: ${error.message}`);
        }
      }

    } catch (error) {
      this.log(`❌ Placeholder API testing failed: ${error.message}`);
    }
  }

  addTestResult(category, endpoint, success, statusCode, details) {
    this.testResults.push({
      category,
      endpoint,
      success,
      statusCode,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async generateTestReport() {
    try {
      this.log('📊 Generating test report...');
      
      const report = {
        summary: {
          totalTests: this.testResults.length,
          passed: this.testResults.filter(r => r.success).length,
          failed: this.testResults.filter(r => !r.success).length,
          timestamp: new Date().toISOString()
        },
        results: this.testResults,
        logs: this.logMessages
      };

      const reportPath = path.join(__dirname, '../test-reports/api-test-report.json');
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      
      // Write report
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      this.log(`📄 Test report saved to: ${reportPath}`);
      this.log(`📊 Test Summary: ${report.summary.passed}/${report.summary.totalTests} passed`);
      
      return report;
      
    } catch (error) {
      this.log(`❌ Report generation failed: ${error.message}`);
      throw error;
    }
  }
}

// Export for use in other scripts
module.exports = APITestMaster;

// Run if called directly
if (require.main === module) {
  const tester = new APITestMaster();
  tester.runAllTests()
    .then(result => {
      console.log('\n🎉 API testing completed!');
      console.log(`📊 Results: ${result.results.filter(r => r.success).length}/${result.results.length} tests passed`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 API testing failed!');
      console.error(error);
      process.exit(1);
    });
}
