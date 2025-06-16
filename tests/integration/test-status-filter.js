/**
 * Test script to verify status filter functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testStatusFilter() {
  console.log('🧪 Testing Status Filter...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@hrms.com',
      password: 'Admin123!'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Admin login successful');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test all records (no status filter)
    console.log('\n2️⃣ Testing all records (no status filter)...');
    const allRecordsResponse = await axios.get(`${BASE_URL}/api/payroll/records`, {
      headers,
      params: {
        page: 1,
        limit: 10
      }
    });

    const allRecords = allRecordsResponse.data.data.records;
    console.log(`📊 Total records: ${allRecords.length}`);
    
    // Show status distribution
    const statusCounts = {};
    allRecords.forEach(record => {
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
    });
    console.log('📋 Status distribution:', statusCounts);

    // Step 3: Test status filter - processed
    console.log('\n3️⃣ Testing status filter: processed...');
    try {
      const processedResponse = await axios.get(`${BASE_URL}/api/payroll/records`, {
        headers,
        params: {
          page: 1,
          limit: 10,
          status: 'processed'
        }
      });

      const processedRecords = processedResponse.data.data.records;
      console.log(`✅ Processed records: ${processedRecords.length}`);
      
      // Verify all records have 'processed' status
      const allProcessed = processedRecords.every(record => record.status === 'processed');
      console.log(`✅ All records have 'processed' status: ${allProcessed}`);
      
      if (processedRecords.length > 0) {
        console.log(`📋 Sample processed record: ${processedRecords[0].employee_name} - ${processedRecords[0].status}`);
      }
    } catch (error) {
      console.log('❌ Processed status filter failed:', error.response?.data?.message || error.message);
    }

    // Step 4: Test status filter - draft
    console.log('\n4️⃣ Testing status filter: draft...');
    try {
      const draftResponse = await axios.get(`${BASE_URL}/api/payroll/records`, {
        headers,
        params: {
          page: 1,
          limit: 10,
          status: 'draft'
        }
      });

      const draftRecords = draftResponse.data.data.records;
      console.log(`✅ Draft records: ${draftRecords.length}`);
      
      // Verify all records have 'draft' status
      const allDraft = draftRecords.every(record => record.status === 'draft');
      console.log(`✅ All records have 'draft' status: ${allDraft}`);
      
      if (draftRecords.length > 0) {
        console.log(`📋 Sample draft record: ${draftRecords[0].employee_name} - ${draftRecords[0].status}`);
      }
    } catch (error) {
      console.log('❌ Draft status filter failed:', error.response?.data?.message || error.message);
    }

    // Step 5: Test status filter - paid
    console.log('\n5️⃣ Testing status filter: paid...');
    try {
      const paidResponse = await axios.get(`${BASE_URL}/api/payroll/records`, {
        headers,
        params: {
          page: 1,
          limit: 10,
          status: 'paid'
        }
      });

      const paidRecords = paidResponse.data.data.records;
      console.log(`✅ Paid records: ${paidRecords.length}`);
      
      // Verify all records have 'paid' status
      const allPaid = paidRecords.every(record => record.status === 'paid');
      console.log(`✅ All records have 'paid' status: ${allPaid}`);
      
      if (paidRecords.length > 0) {
        console.log(`📋 Sample paid record: ${paidRecords[0].employee_name} - ${paidRecords[0].status}`);
      }
    } catch (error) {
      console.log('❌ Paid status filter failed:', error.response?.data?.message || error.message);
    }

    // Step 6: Test invalid status
    console.log('\n6️⃣ Testing invalid status filter...');
    try {
      const invalidResponse = await axios.get(`${BASE_URL}/api/payroll/records`, {
        headers,
        params: {
          page: 1,
          limit: 10,
          status: 'invalid_status'
        }
      });

      console.log('❌ Invalid status should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Invalid status correctly rejected:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Status filter test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testStatusFilter();
