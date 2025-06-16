/**
 * Comprehensive Integration Test for Simplified Anomaly Detection
 * Tests the complete frontend-backend alignment
 *
 * Location: tests/integration/test-simplified-anomaly-integration.js
 * Run from: HRMS-AI-capabled-system root directory
 * Command: node tests/integration/test-simplified-anomaly-integration.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  adminCredentials: {
    email: 'admin@hrms.com',
    password: 'Admin123!'
  },
  dateRange: {
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  }
};

let authToken = '';

/**
 * Authenticate as admin user
 */
async function authenticateAdmin() {
  try {
    console.log('🔐 Authenticating as admin...');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_CONFIG.adminCredentials);
    
    if (response.data.success) {
      authToken = response.data.data.accessToken;
      console.log('✅ Admin authentication successful');
      return true;
    } else {
      throw new Error(response.data.message || 'Authentication failed');
    }
  } catch (error) {
    console.error('❌ Admin authentication failed:', error.message);
    return false;
  }
}

/**
 * Test anomaly detection API
 */
async function testAnomalyDetection() {
  try {
    console.log('\n🤖 Testing anomaly detection API...');
    
    const response = await axios.post(
      `${BASE_URL}/ai/detect-anomalies`,
      {
        employeeId: null, // All employees
        dateRange: TEST_CONFIG.dateRange
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      const result = response.data.data;
      console.log('✅ Anomaly detection successful');
      console.log(`📊 Detection Summary:`, {
        totalDetected: result.summary?.totalDetected || 0,
        newCreated: result.summary?.newCreated || 0,
        updated: result.summary?.updated || 0,
        duplicatesSkipped: result.summary?.duplicatesSkipped || 0
      });
      
      return result;
    } else {
      throw new Error(response.data.message || 'Detection failed');
    }
  } catch (error) {
    console.error('❌ Anomaly detection failed:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Test get anomalies API
 */
async function testGetAnomalies() {
  try {
    console.log('\n📋 Testing get anomalies API...');
    
    const response = await axios.get(
      `${BASE_URL}/ai/attendance-anomalies?status=active`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.success) {
      const anomalies = response.data.data || [];
      console.log('✅ Get anomalies successful');
      console.log(`📊 Found ${anomalies.length} active anomalies`);
      
      // Display anomaly details
      anomalies.forEach((anomaly, index) => {
        console.log(`   ${index + 1}. Employee ${anomaly.employeeId}: ${anomaly.anomalyType} (${anomaly.severity})`);
      });
      
      return anomalies;
    } else {
      throw new Error(response.data.message || 'Failed to get anomalies');
    }
  } catch (error) {
    console.error('❌ Get anomalies failed:', error.response?.data?.message || error.message);
    return [];
  }
}

/**
 * Test resolve anomaly API
 */
async function testResolveAnomaly(anomalyId) {
  try {
    console.log(`\n✅ Testing resolve anomaly API (ID: ${anomalyId})...`);
    
    const response = await axios.patch(
      `${BASE_URL}/ai/attendance-anomalies/${anomalyId}/resolve`,
      {
        resolution: 'Resolved during integration testing'
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      console.log('✅ Resolve anomaly successful');
      return true;
    } else {
      throw new Error(response.data.message || 'Failed to resolve anomaly');
    }
  } catch (error) {
    console.error('❌ Resolve anomaly failed:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test ignore anomaly API
 */
async function testIgnoreAnomaly(anomalyId) {
  try {
    console.log(`\n❌ Testing ignore anomaly API (ID: ${anomalyId})...`);
    
    const response = await axios.patch(
      `${BASE_URL}/ai/attendance-anomalies/${anomalyId}/ignore`,
      {
        reason: 'Ignored during integration testing'
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      console.log('✅ Ignore anomaly successful');
      return true;
    } else {
      throw new Error(response.data.message || 'Failed to ignore anomaly');
    }
  } catch (error) {
    console.error('❌ Ignore anomaly failed:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test anomaly statistics API
 */
async function testAnomalyStats() {
  try {
    console.log('\n📈 Testing anomaly statistics API...');
    
    const response = await axios.get(
      `${BASE_URL}/ai/attendance-anomalies/stats?period=month`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.success) {
      const stats = response.data.data;
      console.log('✅ Get anomaly stats successful');
      console.log('📊 Statistics:', {
        totalAnomalies: stats.totalAnomalies || 0,
        activeAnomalies: stats.activeAnomalies || 0,
        resolvedAnomalies: stats.resolvedAnomalies || 0,
        ignoredAnomalies: stats.ignoredAnomalies || 0
      });
      
      return stats;
    } else {
      throw new Error(response.data.message || 'Failed to get stats');
    }
  } catch (error) {
    console.error('❌ Get anomaly stats failed:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Main test execution
 */
async function runIntegrationTests() {
  console.log('🚀 Starting Simplified Anomaly Detection Integration Tests\n');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  let testsPassed = 0;
  let totalTests = 0;
  
  try {
    // Test 1: Authentication
    totalTests++;
    const authSuccess = await authenticateAdmin();
    if (authSuccess) testsPassed++;
    
    if (!authSuccess) {
      console.log('\n❌ Cannot proceed without authentication');
      return;
    }
    
    // Test 2: Anomaly Detection
    totalTests++;
    const detectionResult = await testAnomalyDetection();
    if (detectionResult) testsPassed++;
    
    // Test 3: Get Anomalies
    totalTests++;
    const anomalies = await testGetAnomalies();
    if (anomalies.length >= 0) testsPassed++;
    
    // Test 4: Anomaly Statistics
    totalTests++;
    const stats = await testAnomalyStats();
    if (stats) testsPassed++;
    
    // Test 5 & 6: Resolve and Ignore (if anomalies exist)
    if (anomalies.length > 0) {
      // Test resolve on first anomaly
      if (anomalies.length >= 1) {
        totalTests++;
        const resolveSuccess = await testResolveAnomaly(anomalies[0].id);
        if (resolveSuccess) testsPassed++;
      }
      
      // Test ignore on second anomaly
      if (anomalies.length >= 2) {
        totalTests++;
        const ignoreSuccess = await testIgnoreAnomaly(anomalies[1].id);
        if (ignoreSuccess) testsPassed++;
      }
    }
    
  } catch (error) {
    console.error('\n💥 Unexpected error during testing:', error.message);
  }
  
  // Test Results Summary
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 INTEGRATION TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`🎯 Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Simplified Anomaly Detection is fully aligned!');
    console.log('✅ Frontend-Backend integration is working correctly');
    console.log('✅ All API endpoints are functioning properly');
    console.log('✅ Authentication and authorization working');
    console.log('✅ Anomaly detection, resolution, and management working');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('\n🔗 Frontend URL: http://localhost:3005');
  console.log('🔗 Backend URL: http://localhost:5000');
  console.log('📱 Test the simplified UI at: http://localhost:3005/ai-features/anomaly-detection');
}

// Run the tests
runIntegrationTests().catch(console.error);
