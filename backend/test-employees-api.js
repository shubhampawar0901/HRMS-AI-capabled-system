const request = require('supertest');
const app = require('./app');

async function testAPI() {
  try {
    console.log('Testing Employees API endpoint...');
    
    // First, login to get a token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@hrms.com',
        password: 'admin123'
      });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.error('Login failed:', loginResponse.body);
      return;
    }
    
    const token = loginResponse.body.data.token;
    console.log('Token obtained successfully');
    
    // Test the employees API
    const employeesResponse = await request(app)
      .get('/api/employees?limit=3')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Employees API response status:', employeesResponse.status);
    console.log('Employees API response body:', JSON.stringify(employeesResponse.body, null, 2));
    
    if (employeesResponse.body.data && employeesResponse.body.data.employees) {
      const employees = employeesResponse.body.data.employees;
      console.log('\nFirst employee from API:');
      if (employees.length > 0) {
        const firstEmployee = employees[0];
        console.log('- ID:', firstEmployee.id);
        console.log('- Name:', firstEmployee.firstName, firstEmployee.lastName);
        console.log('- Department ID:', firstEmployee.departmentId);
        console.log('- Department Name:', firstEmployee.departmentName);
        console.log('- Position:', firstEmployee.position);
      }
    }
    
  } catch (error) {
    console.error('API test error:', error);
  }
  process.exit(0);
}

testAPI();
