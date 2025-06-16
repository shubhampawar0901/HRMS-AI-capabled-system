const EmployeeController = require('./controllers/EmployeeController');

async function testController() {
  try {
    console.log('Testing EmployeeController directly...');
    
    // Mock request and response objects
    const mockReq = {
      query: { limit: 3 },
      user: { role: 'admin', employeeId: null }
    };
    
    const mockRes = {
      statusCode: 200,
      responseData: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        console.log('Controller response:', JSON.stringify(data, null, 2));
        
        if (data.data && data.data.employees) {
          console.log('\nFirst employee from controller:');
          const firstEmployee = data.data.employees[0];
          console.log('- ID:', firstEmployee.id);
          console.log('- Name:', firstEmployee.firstName, firstEmployee.lastName);
          console.log('- Department ID:', firstEmployee.departmentId);
          console.log('- Department Name:', firstEmployee.departmentName);
          console.log('- Position:', firstEmployee.position);
          
          console.log('\nAll properties of first employee:');
          console.log(Object.keys(firstEmployee));
        }
        return this;
      }
    };
    
    await EmployeeController.getAllEmployees(mockReq, mockRes);
    
  } catch (error) {
    console.error('Controller test error:', error);
  }
  process.exit(0);
}

testController();
