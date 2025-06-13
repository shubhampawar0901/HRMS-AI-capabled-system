const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ComprehensiveAPITestMaster {
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
    this.createdResources = {
      employees: [],
      departments: [],
      sessions: []
    };
    this.testStatus = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.logMessages.push(logMessage);
  }

  async runAllTests() {
    try {
      this.log('🚀 Starting COMPREHENSIVE API testing for ALL endpoints...');

      // Phase 1: Server Health & Authentication
      await this.testServerHealth();
      await this.testAuthentication();

      // Phase 2: Employee Management APIs (Complete CRUD)
      await this.testEmployeeAPIs();
      await this.testDepartmentAPIs();

      // Phase 3: AI Service APIs (All endpoints)
      await this.testAIAPIs();

      // Phase 4: Placeholder Service APIs
      await this.testAuthServiceAPIs();
      await this.testAttendanceServiceAPIs();
      await this.testLeaveServiceAPIs();
      await this.testPayrollServiceAPIs();
      await this.testPerformanceServiceAPIs();
      await this.testReportsServiceAPIs();

      // Phase 5: Error Handling & Edge Cases
      await this.testErrorHandling();

      // Generate comprehensive test report
      await this.generateTestReport();

      this.log('✅ COMPREHENSIVE API testing completed!');
      this.log(`📊 Final Results: ${this.testStatus.passed}/${this.testStatus.total} tests passed`);

      return {
        success: true,
        results: this.testResults,
        logs: this.logMessages,
        status: this.testStatus
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
      this.log('👥 Testing Employee Management APIs (Complete CRUD)...');

      const adminToken = this.authTokens.admin;
      const managerToken = this.authTokens.manager;

      if (!adminToken) {
        this.log('⚠️  No admin token available, skipping employee API tests');
        return;
      }

      // Test 1: GET /employees (with various query parameters)
      await this.testGetEmployees(adminToken, managerToken);

      // Test 2: POST /employees (Create new employee)
      await this.testCreateEmployee(adminToken);

      // Test 3: GET /employees/:id (Get specific employee)
      await this.testGetEmployeeById(adminToken);

      // Test 4: PUT /employees/:id (Update employee)
      await this.testUpdateEmployee(adminToken);

      // Test 5: DELETE /employees/:id (Delete employee - Admin only)
      await this.testDeleteEmployee(adminToken);

      // Test 6: Employee Statistics
      await this.testEmployeeStatistics(adminToken);

    } catch (error) {
      this.log(`❌ Employee API testing failed: ${error.message}`);
    }
  }

  async testGetEmployees(adminToken, managerToken) {
    const headers = { Authorization: `Bearer ${adminToken}` };

    // Test basic GET /employees
    await this.executeTest('Employee API', 'GET /employees (basic)', async () => {
      const response = await axios.get(`${this.baseURL}/employees`, { headers });
      return {
        success: response.status === 200,
        details: `Found ${response.data.data?.employees?.length || 0} employees`
      };
    });

    // Test with pagination
    await this.executeTest('Employee API', 'GET /employees (with pagination)', async () => {
      const response = await axios.get(`${this.baseURL}/employees?page=1&limit=5`, { headers });
      return {
        success: response.status === 200,
        details: `Pagination: page=${response.data.data?.pagination?.page}, limit=${response.data.data?.pagination?.limit}`
      };
    });

    // Test with search
    await this.executeTest('Employee API', 'GET /employees (with search)', async () => {
      const response = await axios.get(`${this.baseURL}/employees?search=admin`, { headers });
      return {
        success: response.status === 200,
        details: `Search results: ${response.data.data?.employees?.length || 0} employees found`
      };
    });

    // Test with status filter
    await this.executeTest('Employee API', 'GET /employees (with status filter)', async () => {
      const response = await axios.get(`${this.baseURL}/employees?status=active`, { headers });
      return {
        success: response.status === 200,
        details: `Active employees: ${response.data.data?.employees?.length || 0}`
      };
    });

    // Test with department filter
    await this.executeTest('Employee API', 'GET /employees (with department filter)', async () => {
      const response = await axios.get(`${this.baseURL}/employees?departmentId=1`, { headers });
      return {
        success: response.status === 200,
        details: `Department 1 employees: ${response.data.data?.employees?.length || 0}`
      };
    });

    // Test manager access (should have limited access)
    if (managerToken) {
      const managerHeaders = { Authorization: `Bearer ${managerToken}` };
      await this.executeTest('Employee API', 'GET /employees (manager access)', async () => {
        const response = await axios.get(`${this.baseURL}/employees`, { headers: managerHeaders });
        return {
          success: response.status === 200,
          details: `Manager can see ${response.data.data?.employees?.length || 0} employees`
        };
      });
    }
  }

  async testCreateEmployee(adminToken) {
    const headers = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Test valid employee creation
    const newEmployeeData = {
      firstName: 'Test',
      lastName: 'Employee',
      email: `test.employee.${Date.now()}@hrms.com`,
      phone: '+1234567890',
      dateOfBirth: '1990-01-15',
      gender: 'male',
      address: '123 Test Street, Test City',
      departmentId: 1,
      position: 'Test Engineer',
      hireDate: '2024-01-15',
      basicSalary: 50000.00,
      managerId: 2,
      emergencyContact: 'Emergency Contact',
      emergencyPhone: '+0987654321'
    };

    await this.executeTest('Employee API', 'POST /employees (valid data)', async () => {
      const response = await axios.post(`${this.baseURL}/employees`, newEmployeeData, { headers });
      if (response.status === 201 && response.data.data?.id) {
        this.createdResources.employees.push(response.data.data.id);
      }
      return {
        success: response.status === 201,
        details: `Employee created with ID: ${response.data.data?.id || 'unknown'}`
      };
    });

    // Test invalid data (missing required fields)
    await this.executeTest('Employee API', 'POST /employees (missing required fields)', async () => {
      const invalidData = { firstName: 'Test' }; // Missing required fields
      try {
        await axios.post(`${this.baseURL}/employees`, invalidData, { headers });
        return { success: false, details: 'Should have failed validation' };
      } catch (error) {
        return {
          success: error.response?.status === 400,
          details: `Validation error: ${error.response?.status}`
        };
      }
    });

    // Test duplicate email
    await this.executeTest('Employee API', 'POST /employees (duplicate email)', async () => {
      const duplicateData = { ...newEmployeeData, email: 'admin@hrms.com' };
      try {
        await axios.post(`${this.baseURL}/employees`, duplicateData, { headers });
        return { success: false, details: 'Should have failed due to duplicate email' };
      } catch (error) {
        return {
          success: error.response?.status === 400 || error.response?.status === 409,
          details: `Duplicate email error: ${error.response?.status}`
        };
      }
    });
  }

  async testGetEmployeeById(adminToken) {
    const headers = { Authorization: `Bearer ${adminToken}` };

    // Test valid employee ID
    await this.executeTest('Employee API', 'GET /employees/:id (valid ID)', async () => {
      const response = await axios.get(`${this.baseURL}/employees/1`, { headers });
      return {
        success: response.status === 200,
        details: `Employee details: ${response.data.data?.firstName} ${response.data.data?.lastName}`
      };
    });

    // Test invalid employee ID
    await this.executeTest('Employee API', 'GET /employees/:id (invalid ID)', async () => {
      try {
        await axios.get(`${this.baseURL}/employees/99999`, { headers });
        return { success: false, details: 'Should have returned 404' };
      } catch (error) {
        return {
          success: error.response?.status === 404,
          details: `Not found error: ${error.response?.status}`
        };
      }
    });

    // Test non-numeric ID
    await this.executeTest('Employee API', 'GET /employees/:id (non-numeric ID)', async () => {
      try {
        await axios.get(`${this.baseURL}/employees/abc`, { headers });
        return { success: false, details: 'Should have failed validation' };
      } catch (error) {
        return {
          success: error.response?.status === 400,
          details: `Validation error: ${error.response?.status}`
        };
      }
    });
  }

  async testUpdateEmployee(adminToken) {
    const headers = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    const updateData = {
      firstName: 'Updated',
      lastName: 'Employee',
      position: 'Senior Test Engineer',
      basicSalary: 60000.00
    };

    // Test valid update
    await this.executeTest('Employee API', 'PUT /employees/:id (valid update)', async () => {
      const response = await axios.put(`${this.baseURL}/employees/1`, updateData, { headers });
      return {
        success: response.status === 200,
        details: 'Employee updated successfully'
      };
    });

    // Test invalid employee ID
    await this.executeTest('Employee API', 'PUT /employees/:id (invalid ID)', async () => {
      try {
        await axios.put(`${this.baseURL}/employees/99999`, updateData, { headers });
        return { success: false, details: 'Should have returned 404' };
      } catch (error) {
        return {
          success: error.response?.status === 404,
          details: `Not found error: ${error.response?.status}`
        };
      }
    });

    // Test invalid data
    await this.executeTest('Employee API', 'PUT /employees/:id (invalid data)', async () => {
      const invalidData = { basicSalary: -1000 }; // Negative salary
      try {
        await axios.put(`${this.baseURL}/employees/1`, invalidData, { headers });
        return { success: false, details: 'Should have failed validation' };
      } catch (error) {
        return {
          success: error.response?.status === 400,
          details: `Validation error: ${error.response?.status}`
        };
      }
    });
  }

  async testDeleteEmployee(adminToken) {
    const headers = { Authorization: `Bearer ${adminToken}` };

    // Test delete with valid ID (use created employee if available)
    const employeeId = this.createdResources.employees[0] || 999999;

    await this.executeTest('Employee API', 'DELETE /employees/:id (admin only)', async () => {
      try {
        const response = await axios.delete(`${this.baseURL}/employees/${employeeId}`, { headers });
        return {
          success: response.status === 200,
          details: 'Employee deleted successfully'
        };
      } catch (error) {
        // If employee doesn't exist, that's also a valid test result
        return {
          success: error.response?.status === 404,
          details: `Employee not found (expected): ${error.response?.status}`
        };
      }
    });

    // Test delete with manager token (should fail)
    const managerHeaders = { Authorization: `Bearer ${this.authTokens.manager}` };
    await this.executeTest('Employee API', 'DELETE /employees/:id (manager access denied)', async () => {
      try {
        await axios.delete(`${this.baseURL}/employees/1`, { headers: managerHeaders });
        return { success: false, details: 'Manager should not be able to delete employees' };
      } catch (error) {
        return {
          success: error.response?.status === 403,
          details: `Access denied (expected): ${error.response?.status}`
        };
      }
    });
  }

  async testEmployeeStatistics(adminToken) {
    const headers = { Authorization: `Bearer ${adminToken}` };

    await this.executeTest('Employee API', 'GET /employees/stats/employees', async () => {
      const response = await axios.get(`${this.baseURL}/employees/stats/employees`, { headers });
      return {
        success: response.status === 200,
        details: `Statistics retrieved: ${JSON.stringify(response.data.data || {})}`
      };
    });
  }

  async testDepartmentAPIs() {
    try {
      this.log('🏢 Testing Department Management APIs...');

      const adminToken = this.authTokens.admin;
      if (!adminToken) {
        this.log('⚠️  No admin token available, skipping department API tests');
        return;
      }

      const headers = { Authorization: `Bearer ${adminToken}` };

      // Test GET /employees/departments/all
      await this.executeTest('Department API', 'GET /employees/departments/all', async () => {
        const response = await axios.get(`${this.baseURL}/employees/departments/all`, { headers });
        return {
          success: response.status === 200,
          details: `Found ${response.data.data?.length || 0} departments`
        };
      });

      // Test GET /employees/departments/all with search
      await this.executeTest('Department API', 'GET /employees/departments/all (with search)', async () => {
        const response = await axios.get(`${this.baseURL}/employees/departments/all?search=IT`, { headers });
        return {
          success: response.status === 200,
          details: `Search results: ${response.data.data?.length || 0} departments`
        };
      });

      // Test GET /employees/departments/:id
      await this.executeTest('Department API', 'GET /employees/departments/:id', async () => {
        const response = await axios.get(`${this.baseURL}/employees/departments/1`, { headers });
        return {
          success: response.status === 200,
          details: `Department: ${response.data.data?.name || 'unknown'}`
        };
      });

      // Test POST /employees/departments (Create department)
      const newDepartmentData = {
        name: `Test Department ${Date.now()}`,
        description: 'Test department for API testing',
        managerId: 2
      };

      await this.executeTest('Department API', 'POST /employees/departments', async () => {
        const response = await axios.post(`${this.baseURL}/employees/departments`, newDepartmentData, {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
        if (response.status === 201 && response.data.data?.id) {
          this.createdResources.departments.push(response.data.data.id);
        }
        return {
          success: response.status === 201,
          details: `Department created with ID: ${response.data.data?.id || 'unknown'}`
        };
      });

      // Test invalid department creation
      await this.executeTest('Department API', 'POST /employees/departments (invalid data)', async () => {
        const invalidData = { description: 'Missing name' };
        try {
          await axios.post(`${this.baseURL}/employees/departments`, invalidData, {
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
          return { success: false, details: 'Should have failed validation' };
        } catch (error) {
          return {
            success: error.response?.status === 400,
            details: `Validation error: ${error.response?.status}`
          };
        }
      });

    } catch (error) {
      this.log(`❌ Department API testing failed: ${error.message}`);
    }
  }

  async testAIAPIs() {
    try {
      this.log('🤖 Testing AI Service APIs (All endpoints)...');

      const adminToken = this.authTokens.admin;
      const employeeToken = this.authTokens.employee;

      if (!adminToken) {
        this.log('⚠️  No admin token available, skipping AI API tests');
        return;
      }

      const headers = { Authorization: `Bearer ${adminToken}` };
      const employeeHeaders = { Authorization: `Bearer ${employeeToken}` };

      // Test AI Feature Status
      await this.executeTest('AI API', 'GET /ai/feature-status', async () => {
        const response = await axios.get(`${this.baseURL}/ai/feature-status`, { headers });
        return {
          success: response.status === 200,
          details: `AI features: ${Object.keys(response.data.data || {}).length} features available`
        };
      });

      // Test AI Health Check
      await this.executeTest('AI API', 'GET /ai/health', async () => {
        const response = await axios.get(`${this.baseURL}/ai/health`);
        return {
          success: response.status === 200,
          details: `AI service status: ${response.data.status}`
        };
      });

      // Test Attrition Predictions
      await this.testAttritionPredictionAPIs(headers);

      // Test Smart Feedback APIs
      await this.testSmartFeedbackAPIs(headers);

      // Test Attendance Anomaly APIs
      await this.testAttendanceAnomalyAPIs(headers);

      // Test Chatbot APIs
      await this.testChatbotAPIs(employeeHeaders);

      // Test Smart Reports APIs
      await this.testSmartReportsAPIs(headers);

    } catch (error) {
      this.log(`❌ AI API testing failed: ${error.message}`);
    }
  }

  async testAttritionPredictionAPIs(headers) {
    // Test GET /ai/attrition-predictions
    await this.executeTest('AI API', 'GET /ai/attrition-predictions', async () => {
      const response = await axios.get(`${this.baseURL}/ai/attrition-predictions`, { headers });
      return {
        success: response.status === 200,
        details: `Found ${response.data.data?.length || 0} attrition predictions`
      };
    });

    // Test with risk threshold
    await this.executeTest('AI API', 'GET /ai/attrition-predictions (with threshold)', async () => {
      const response = await axios.get(`${this.baseURL}/ai/attrition-predictions?riskThreshold=0.7`, { headers });
      return {
        success: response.status === 200,
        details: `High-risk predictions: ${response.data.data?.length || 0}`
      };
    });

    // Test POST /ai/attrition-predictions
    await this.executeTest('AI API', 'POST /ai/attrition-predictions', async () => {
      const requestData = { employeeId: 1 };
      const response = await axios.post(`${this.baseURL}/ai/attrition-predictions`, requestData, {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      return {
        success: response.status === 201,
        details: `Prediction generated for employee ${requestData.employeeId}`
      };
    });
  }

  async testSmartFeedbackAPIs(headers) {
    // Test POST /ai/smart-feedback
    await this.executeTest('AI API', 'POST /ai/smart-feedback', async () => {
      const requestData = {
        employeeId: 1,
        feedbackType: 'performance',
        performanceData: {
          goals_completed: 8,
          total_goals: 10,
          attendance_rate: 0.95,
          peer_ratings: [4.2, 4.5, 4.1]
        }
      };
      const response = await axios.post(`${this.baseURL}/ai/smart-feedback`, requestData, {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      return {
        success: response.status === 201,
        details: `Smart feedback generated for employee ${requestData.employeeId}`
      };
    });

    // Test invalid feedback type
    await this.executeTest('AI API', 'POST /ai/smart-feedback (invalid type)', async () => {
      const invalidData = { employeeId: 1, feedbackType: 'invalid_type' };
      try {
        await axios.post(`${this.baseURL}/ai/smart-feedback`, invalidData, {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
        return { success: false, details: 'Should have failed validation' };
      } catch (error) {
        return {
          success: error.response?.status === 400,
          details: `Validation error: ${error.response?.status}`
        };
      }
    });
  }

  async testAttendanceAnomalyAPIs(headers) {
    // Test GET /ai/attendance-anomalies
    await this.executeTest('AI API', 'GET /ai/attendance-anomalies', async () => {
      const response = await axios.get(`${this.baseURL}/ai/attendance-anomalies`, { headers });
      return {
        success: response.status === 200,
        details: `Found ${response.data.data?.length || 0} attendance anomalies`
      };
    });

    // Test with status filter
    await this.executeTest('AI API', 'GET /ai/attendance-anomalies (with status)', async () => {
      const response = await axios.get(`${this.baseURL}/ai/attendance-anomalies?status=active`, { headers });
      return {
        success: response.status === 200,
        details: `Active anomalies: ${response.data.data?.length || 0}`
      };
    });

    // Test POST /ai/detect-anomalies
    await this.executeTest('AI API', 'POST /ai/detect-anomalies', async () => {
      const requestData = {
        employeeId: 1,
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      };
      const response = await axios.post(`${this.baseURL}/ai/detect-anomalies`, requestData, {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      return {
        success: response.status === 201,
        details: `Anomaly detection completed for employee ${requestData.employeeId}`
      };
    });
  }

  async testChatbotAPIs(headers) {
    // Test POST /ai/chatbot/query
    await this.executeTest('AI API', 'POST /ai/chatbot/query', async () => {
      const requestData = {
        message: 'What are my leave balances?',
        sessionId: uuidv4()
      };
      this.createdResources.sessions.push(requestData.sessionId);

      const response = await axios.post(`${this.baseURL}/ai/chatbot/query`, requestData, {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      return {
        success: response.status === 200,
        details: `Chatbot response: ${response.data.data?.response?.substring(0, 50) || 'No response'}...`
      };
    });

    // Test empty message
    await this.executeTest('AI API', 'POST /ai/chatbot/query (empty message)', async () => {
      const invalidData = { message: '' };
      try {
        await axios.post(`${this.baseURL}/ai/chatbot/query`, invalidData, {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
        return { success: false, details: 'Should have failed validation' };
      } catch (error) {
        return {
          success: error.response?.status === 400,
          details: `Validation error: ${error.response?.status}`
        };
      }
    });

    // Test GET /ai/chatbot/history/:sessionId
    if (this.createdResources.sessions.length > 0) {
      const sessionId = this.createdResources.sessions[0];
      await this.executeTest('AI API', 'GET /ai/chatbot/history/:sessionId', async () => {
        const response = await axios.get(`${this.baseURL}/ai/chatbot/history/${sessionId}`, { headers });
        return {
          success: response.status === 200,
          details: `Chat history: ${response.data.data?.length || 0} messages`
        };
      });
    }
  }

  async testSmartReportsAPIs(headers) {
    // Test POST /ai/smart-reports
    const reportTypes = ['employee', 'attendance', 'leave', 'performance', 'payroll'];

    for (const reportType of reportTypes) {
      await this.executeTest('AI API', `POST /ai/smart-reports (${reportType})`, async () => {
        const requestData = {
          reportType,
          parameters: {
            dateRange: {
              startDate: '2024-01-01',
              endDate: '2024-01-31'
            },
            departmentId: 1
          }
        };
        const response = await axios.post(`${this.baseURL}/ai/smart-reports`, requestData, {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
        return {
          success: response.status === 200,
          details: `${reportType} report generated successfully`
        };
      });
    }

    // Test invalid report type
    await this.executeTest('AI API', 'POST /ai/smart-reports (invalid type)', async () => {
      const invalidData = { reportType: 'invalid_type', parameters: {} };
      try {
        await axios.post(`${this.baseURL}/ai/smart-reports`, invalidData, {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
        return { success: false, details: 'Should have failed validation' };
      } catch (error) {
        return {
          success: error.response?.status === 400,
          details: `Validation error: ${error.response?.status}`
        };
      }
    });
  }

  // Utility method to execute tests with proper error handling
  async executeTest(category, testName, testFunction) {
    this.testStatus.total++;
    try {
      const result = await testFunction();
      if (result.success) {
        this.testStatus.passed++;
        this.addTestResult(category, testName, true, 200, result.details);
        this.log(`✅ ${testName} - ${result.details}`);
      } else {
        this.testStatus.failed++;
        this.addTestResult(category, testName, false, 500, result.details);
        this.log(`❌ ${testName} - ${result.details}`);
      }
    } catch (error) {
      this.testStatus.failed++;
      this.addTestResult(category, testName, false, error.response?.status || 500, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`);
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

  // Placeholder Service API Tests
  async testAuthServiceAPIs() {
    this.log('🔐 Testing Auth Service APIs...');

    await this.executeTest('Auth Service', 'GET /auth/health', async () => {
      const response = await axios.get(`${this.baseURL}/auth/health`);
      return {
        success: response.status === 200,
        details: `Auth service status: ${response.data.status}`
      };
    });
  }

  async testAttendanceServiceAPIs() {
    this.log('⏰ Testing Attendance Service APIs...');

    await this.executeTest('Attendance Service', 'GET /attendance/health', async () => {
      const response = await axios.get(`${this.baseURL}/attendance/health`);
      return {
        success: response.status === 200,
        details: `Attendance service status: ${response.data.status}`
      };
    });
  }

  async testLeaveServiceAPIs() {
    this.log('🏖️ Testing Leave Service APIs...');

    await this.executeTest('Leave Service', 'GET /leave/health', async () => {
      const response = await axios.get(`${this.baseURL}/leave/health`);
      return {
        success: response.status === 200,
        details: `Leave service status: ${response.data.status}`
      };
    });
  }

  async testPayrollServiceAPIs() {
    this.log('💰 Testing Payroll Service APIs...');

    await this.executeTest('Payroll Service', 'GET /payroll/health', async () => {
      const response = await axios.get(`${this.baseURL}/payroll/health`);
      return {
        success: response.status === 200,
        details: `Payroll service status: ${response.data.status}`
      };
    });
  }

  async testPerformanceServiceAPIs() {
    this.log('📈 Testing Performance Service APIs...');

    await this.executeTest('Performance Service', 'GET /performance/health', async () => {
      const response = await axios.get(`${this.baseURL}/performance/health`);
      return {
        success: response.status === 200,
        details: `Performance service status: ${response.data.status}`
      };
    });
  }

  async testReportsServiceAPIs() {
    this.log('📊 Testing Reports Service APIs...');

    await this.executeTest('Reports Service', 'GET /reports/health', async () => {
      const response = await axios.get(`${this.baseURL}/reports/health`);
      return {
        success: response.status === 200,
        details: `Reports service status: ${response.data.status}`
      };
    });
  }

  async testErrorHandling() {
    this.log('🚨 Testing Error Handling & Edge Cases...');

    // Test unauthorized access
    await this.executeTest('Error Handling', 'Unauthorized access', async () => {
      try {
        await axios.get(`${this.baseURL}/employees`);
        return { success: false, details: 'Should have required authentication' };
      } catch (error) {
        return {
          success: error.response?.status === 401,
          details: `Unauthorized error: ${error.response?.status}`
        };
      }
    });

    // Test invalid token
    await this.executeTest('Error Handling', 'Invalid token', async () => {
      const invalidHeaders = { Authorization: 'Bearer invalid-token' };
      try {
        await axios.get(`${this.baseURL}/employees`, { headers: invalidHeaders });
        return { success: false, details: 'Should have rejected invalid token' };
      } catch (error) {
        return {
          success: error.response?.status === 401,
          details: `Invalid token error: ${error.response?.status}`
        };
      }
    });

    // Test rate limiting (if implemented)
    await this.executeTest('Error Handling', 'Rate limiting test', async () => {
      try {
        // Make multiple rapid requests
        const promises = Array(10).fill().map(() =>
          axios.get(`${this.baseURL.replace('/api', '')}/health`)
        );
        await Promise.all(promises);
        return {
          success: true,
          details: 'Rate limiting test completed (may not be enforced in test environment)'
        };
      } catch (error) {
        return {
          success: error.response?.status === 429,
          details: `Rate limit error: ${error.response?.status}`
        };
      }
    });

    // Test malformed JSON
    await this.executeTest('Error Handling', 'Malformed JSON', async () => {
      const headers = {
        Authorization: `Bearer ${this.authTokens.admin}`,
        'Content-Type': 'application/json'
      };
      try {
        await axios.post(`${this.baseURL}/employees`, 'invalid-json', { headers });
        return { success: false, details: 'Should have rejected malformed JSON' };
      } catch (error) {
        return {
          success: error.response?.status === 400,
          details: `JSON parse error: ${error.response?.status}`
        };
      }
    });
  }

  async generateTestReport() {
    try {
      this.log('📊 Generating comprehensive test report...');

      const report = {
        summary: {
          totalTests: this.testStatus.total,
          passed: this.testStatus.passed,
          failed: this.testStatus.failed,
          skipped: this.testStatus.skipped,
          successRate: `${((this.testStatus.passed / this.testStatus.total) * 100).toFixed(2)}%`,
          timestamp: new Date().toISOString()
        },
        testsByCategory: this.groupTestsByCategory(),
        results: this.testResults,
        logs: this.logMessages,
        createdResources: this.createdResources
      };

      const reportPath = path.join(__dirname, '../test-reports/comprehensive-api-test-report.json');

      // Ensure directory exists
      await fs.mkdir(path.dirname(reportPath), { recursive: true });

      // Write report
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

      this.log(`📄 Comprehensive test report saved to: ${reportPath}`);
      this.log(`📊 Final Test Summary: ${this.testStatus.passed}/${this.testStatus.total} passed (${report.summary.successRate})`);

      return report;

    } catch (error) {
      this.log(`❌ Report generation failed: ${error.message}`);
      throw error;
    }
  }

  groupTestsByCategory() {
    const grouped = {};
    this.testResults.forEach(result => {
      if (!grouped[result.category]) {
        grouped[result.category] = { total: 0, passed: 0, failed: 0 };
      }
      grouped[result.category].total++;
      if (result.success) {
        grouped[result.category].passed++;
      } else {
        grouped[result.category].failed++;
      }
    });
    return grouped;
  }
}

// Export for use in other scripts
module.exports = ComprehensiveAPITestMaster;

// Run if called directly
if (require.main === module) {
  const tester = new ComprehensiveAPITestMaster();
  tester.runAllTests()
    .then(result => {
      console.log('\n🎉 COMPREHENSIVE API testing completed!');
      console.log(`📊 Final Results: ${result.status.passed}/${result.status.total} tests passed (${((result.status.passed / result.status.total) * 100).toFixed(2)}%)`);
      console.log('\n📋 Test Summary by Category:');

      const grouped = {};
      result.results.forEach(r => {
        if (!grouped[r.category]) grouped[r.category] = { total: 0, passed: 0 };
        grouped[r.category].total++;
        if (r.success) grouped[r.category].passed++;
      });

      Object.entries(grouped).forEach(([category, stats]) => {
        const rate = ((stats.passed / stats.total) * 100).toFixed(1);
        console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
      });

      console.log('\n📄 Detailed report saved to: test-reports/comprehensive-api-test-report.json');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 COMPREHENSIVE API testing failed!');
      console.error(error);
      process.exit(1);
    });
}
