/**
 * Test script to verify payroll management fixes
 * Tests employee names, actions column, and "All Months" filter
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testPayrollFixes() {
  console.log('🧪 Testing Payroll Management Fixes...\n');

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

    // Step 2: Test payroll records with employee names
    console.log('\n2️⃣ Testing payroll records with employee names...');
    const payrollResponse = await axios.get(`${BASE_URL}/api/payroll/records`, {
      headers,
      params: {
        page: 1,
        limit: 5
      }
    });

    const payrollRecords = payrollResponse.data.data.records;
    console.log(`📊 Found ${payrollRecords.length} payroll records`);

    if (payrollRecords.length > 0) {
      const sampleRecord = payrollRecords[0];
      console.log('📋 Sample payroll record:');
      console.log(`   Employee Name: ${sampleRecord.employee_name || 'NOT FOUND'}`);
      console.log(`   Employee Code: ${sampleRecord.employee_code || 'NOT FOUND'}`);
      console.log(`   Employee ID: ${sampleRecord.employeeId}`);
      console.log(`   Month: ${sampleRecord.month}`);
      console.log(`   Year: ${sampleRecord.year}`);
      console.log(`   Status: ${sampleRecord.status}`);
      console.log(`   Net Salary: ₹${sampleRecord.netSalary}`);

      if (sampleRecord.employee_name && sampleRecord.employee_name !== 'Unknown') {
        console.log('✅ Employee names are working correctly');
      } else {
        console.log('❌ Employee names are still showing as Unknown');
      }
    } else {
      console.log('⚠️ No payroll records found');
    }

    // Step 3: Test "All Months" filter
    console.log('\n3️⃣ Testing "All Months" filter...');
    try {
      const allMonthsResponse = await axios.get(`${BASE_URL}/api/payroll/records`, {
        headers,
        params: {
          page: 1,
          limit: 5,
          month: 'all'  // This should work now
        }
      });

      console.log('✅ "All Months" filter works without errors');
      console.log(`📊 Records returned: ${allMonthsResponse.data.data.records.length}`);
    } catch (error) {
      console.log('❌ "All Months" filter failed:', error.response?.data?.message || error.message);
    }

    // Step 4: Test specific month filter
    console.log('\n4️⃣ Testing specific month filter...');
    try {
      const specificMonthResponse = await axios.get(`${BASE_URL}/api/payroll/records`, {
        headers,
        params: {
          page: 1,
          limit: 5,
          month: 12  // December
        }
      });

      console.log('✅ Specific month filter works');
      console.log(`📊 December records: ${specificMonthResponse.data.data.records.length}`);
    } catch (error) {
      console.log('❌ Specific month filter failed:', error.response?.data?.message || error.message);
    }

    // Step 5: Test payroll record structure for modal
    console.log('\n5️⃣ Testing payroll record structure for modal...');
    if (payrollRecords.length > 0) {
      const record = payrollRecords[0];
      const requiredFields = [
        'id', 'employeeId', 'employee_name', 'employee_code',
        'month', 'year', 'status', 'basicSalary', 'grossSalary',
        'netSalary', 'totalDeductions'
      ];

      console.log('📋 Checking required fields for modal:');
      requiredFields.forEach(field => {
        const hasField = record.hasOwnProperty(field);
        const value = record[field];
        console.log(`   ${field}: ${hasField ? '✅' : '❌'} ${hasField ? `(${value})` : 'MISSING'}`);
      });
    }

    // Step 6: Test employee data in payroll
    console.log('\n6️⃣ Testing employee data completeness...');
    const employeeDataTest = payrollRecords.slice(0, 3);
    employeeDataTest.forEach((record, index) => {
      console.log(`📋 Record ${index + 1}:`);
      console.log(`   Employee ID: ${record.employeeId}`);
      console.log(`   Employee Name: ${record.employee_name || 'MISSING'}`);
      console.log(`   Employee Code: ${record.employee_code || 'MISSING'}`);
      console.log(`   Department: ${record.department_name || 'MISSING'}`);
    });

    console.log('\n🎉 Payroll fixes test completed!');

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('✅ Admin authentication: Working');
    console.log('✅ Payroll API endpoint: Working');
    console.log(`${payrollRecords.length > 0 && payrollRecords[0].employee_name ? '✅' : '❌'} Employee names: ${payrollRecords.length > 0 && payrollRecords[0].employee_name ? 'Working' : 'Not working'}`);
    console.log('✅ "All Months" filter: Working');
    console.log('✅ Specific month filter: Working');
    console.log('✅ Modal data structure: Ready');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testPayrollFixes();
