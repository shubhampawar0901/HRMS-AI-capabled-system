const axios = require('axios');

async function testRealAPI() {
  try {
    console.log('Testing real API endpoint...');
    
    // First, try to login with different credentials
    const loginCredentials = [
      { email: 'admin@hrms.com', password: 'admin123' },
      { email: 'manager@hrms.com', password: 'manager123' },
      { email: 'hr.admin@hrms.com', password: 'admin123' }
    ];
    
    let token = null;
    
    for (const creds of loginCredentials) {
      try {
        console.log(`Trying login with ${creds.email}...`);
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', creds);
        
        if (loginResponse.data.success) {
          token = loginResponse.data.data.token;
          console.log(`✅ Login successful with ${creds.email}`);
          break;
        }
      } catch (loginError) {
        console.log(`❌ Login failed with ${creds.email}:`, loginError.response?.data?.error?.message || loginError.message);
      }
    }
    
    if (!token) {
      console.log('❌ All login attempts failed. Cannot test API.');
      return;
    }
    
    // Test the employees API
    console.log('\n🔍 Testing employees API...');
    const employeesResponse = await axios.get('http://localhost:5000/api/employees?limit=3', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API Response Status:', employeesResponse.status);
    console.log('✅ API Response Data:', JSON.stringify(employeesResponse.data, null, 2));
    
    if (employeesResponse.data.data && employeesResponse.data.data.employees) {
      const employees = employeesResponse.data.data.employees;
      console.log('\n📊 Employee Analysis:');
      
      employees.forEach((emp, index) => {
        console.log(`\nEmployee ${index + 1}:`);
        console.log(`- ID: ${emp.id}`);
        console.log(`- Name: ${emp.firstName} ${emp.lastName}`);
        console.log(`- Department ID: ${emp.departmentId}`);
        console.log(`- Department Name: ${emp.departmentName || 'MISSING!'}`);
        console.log(`- Has departmentName field: ${emp.hasOwnProperty('departmentName')}`);
        console.log(`- All fields: ${Object.keys(emp).join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ API test error:', error.response?.data || error.message);
  }
  process.exit(0);
}

testRealAPI();
