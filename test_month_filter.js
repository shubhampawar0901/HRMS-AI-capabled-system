// Test script to verify month filter fix
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test token (replace with actual token)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcklkIjozLCJlbWFpbCI6ImVtcGxveWVlQGhybXMuY29tIiwicm9sZSI6ImVtcGxveWVlIiwiZW1wbG95ZWVJZCI6MywiaWF0IjoxNzE4MzgwMTcyLCJleHAiOjE3MTg0NjY1NzJ9.example';

async function testMonthFilter() {
  console.log('🧪 Testing Month Filter Fix...\n');

  try {
    // Test 1: Specific month (June = 6)
    console.log('📅 Test 1: Specific Month (June)');
    const response1 = await axios.get(`${BASE_URL}/payroll/payslips?year=2025&month=6&page=1&limit=20`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    console.log(`✅ June filter: ${response1.data.data.payslips.length} records found`);
    console.log(`   Total: ${response1.data.data.pagination.total}\n`);

    // Test 2: All months (month=null)
    console.log('📅 Test 2: All Months (month=null)');
    const response2 = await axios.get(`${BASE_URL}/payroll/payslips?year=2025&month=null&page=1&limit=20`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    console.log(`✅ All months filter: ${response2.data.data.payslips.length} records found`);
    console.log(`   Total: ${response2.data.data.pagination.total}\n`);

    // Test 3: No month parameter
    console.log('📅 Test 3: No Month Parameter');
    const response3 = await axios.get(`${BASE_URL}/payroll/payslips?year=2025&page=1&limit=20`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    console.log(`✅ No month filter: ${response3.data.data.payslips.length} records found`);
    console.log(`   Total: ${response3.data.data.pagination.total}\n`);

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   June only: ${response1.data.data.pagination.total} records`);
    console.log(`   All months: ${response2.data.data.pagination.total} records`);
    console.log(`   No filter: ${response3.data.data.pagination.total} records`);
    
    if (response2.data.data.pagination.total >= response1.data.data.pagination.total) {
      console.log('✅ MONTH FILTER FIX: SUCCESS!');
    } else {
      console.log('❌ MONTH FILTER FIX: FAILED!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMonthFilter();
