const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

class TestDataCreator {
  constructor() {
    this.logMessages = [];
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hrms_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    };
    this.createdUsers = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.logMessages.push(logMessage);
  }

  async executeQuery(query, params = []) {
    let connection;
    try {
      connection = await mysql.createConnection(this.dbConfig);
      const [rows] = await connection.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  async createTestData() {
    try {
      this.log('🚀 Starting test data creation...');
      
      // Create test users
      await this.createTestUsers();
      
      // Create test employees
      await this.createTestEmployees();
      
      // Verify data creation
      await this.verifyTestData();
      
      this.log('✅ Test data creation completed successfully!');
      return { 
        success: true, 
        logs: this.logMessages,
        users: this.createdUsers
      };
      
    } catch (error) {
      this.log(`❌ Test data creation failed: ${error.message}`);
      throw error;
    }
  }

  async createTestUsers() {
    try {
      this.log('👥 Creating test users...');
      
      const users = [
        {
          email: 'admin@hrms.com',
          password: 'Admin123!',
          role: 'admin'
        },
        {
          email: 'manager@hrms.com',
          password: 'Manager123!',
          role: 'manager'
        },
        {
          email: 'employee@hrms.com',
          password: 'Employee123!',
          role: 'employee'
        }
      ];

      for (const userData of users) {
        try {
          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 12);
          
          // Insert user
          const query = `
            INSERT INTO users (email, password, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, TRUE, NOW(), NOW())
          `;
          
          const result = await this.executeQuery(query, [
            userData.email,
            hashedPassword,
            userData.role
          ]);
          
          const userId = result.insertId;
          
          this.createdUsers.push({
            id: userId,
            email: userData.email,
            password: userData.password, // Store plain password for testing
            role: userData.role
          });
          
          this.log(`✅ Created ${userData.role} user: ${userData.email} (ID: ${userId})`);
          
        } catch (error) {
          if (error.message.includes('Duplicate entry')) {
            this.log(`ℹ️  User already exists: ${userData.email}`);
            
            // Get existing user ID
            const existingUser = await this.executeQuery(
              'SELECT id FROM users WHERE email = ?',
              [userData.email]
            );
            
            if (existingUser.length > 0) {
              this.createdUsers.push({
                id: existingUser[0].id,
                email: userData.email,
                password: userData.password,
                role: userData.role
              });
            }
          } else {
            throw error;
          }
        }
      }
      
      this.log(`✅ Created/verified ${this.createdUsers.length} test users`);
      
    } catch (error) {
      this.log(`❌ User creation failed: ${error.message}`);
      throw error;
    }
  }

  async createTestEmployees() {
    try {
      this.log('👨‍💼 Creating test employee records...');
      
      // Get department IDs
      const departments = await this.executeQuery('SELECT id, name FROM departments');
      const hrDept = departments.find(d => d.name === 'Human Resources');
      const itDept = departments.find(d => d.name === 'Information Technology');
      const financeDept = departments.find(d => d.name === 'Finance');
      
      // Admin users should NOT have employee records
      const employees = [
        {
          userEmail: 'manager@hrms.com',
          firstName: 'Manager',
          lastName: 'Smith',
          employeeCode: 'EMP001',
          departmentId: itDept?.id || 2,
          position: 'IT Manager',
          hireDate: '2023-02-01',
          basicSalary: 85000.00
        },
        {
          userEmail: 'employee@hrms.com',
          firstName: 'John',
          lastName: 'Doe',
          employeeCode: 'EMP002',
          departmentId: financeDept?.id || 3,
          position: 'Financial Analyst',
          hireDate: '2023-03-10',
          basicSalary: 55000.00
        }
      ];

      for (const empData of employees) {
        try {
          // Find user ID
          const user = this.createdUsers.find(u => u.email === empData.userEmail);
          if (!user) {
            this.log(`⚠️  User not found for email: ${empData.userEmail}`);
            continue;
          }

          // Insert employee
          const query = `
            INSERT INTO employees (
              user_id, employee_code, first_name, last_name, email, 
              department_id, position, hire_date, basic_salary, status,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
          `;
          
          const result = await this.executeQuery(query, [
            user.id,
            empData.employeeCode,
            empData.firstName,
            empData.lastName,
            empData.userEmail,
            empData.departmentId,
            empData.position,
            empData.hireDate,
            empData.basicSalary
          ]);
          
          const employeeId = result.insertId;
          
          this.log(`✅ Created employee: ${empData.firstName} ${empData.lastName} (ID: ${employeeId}, Code: ${empData.employeeCode})`);
          
        } catch (error) {
          if (error.message.includes('Duplicate entry')) {
            this.log(`ℹ️  Employee already exists: ${empData.employeeCode}`);
          } else {
            this.log(`⚠️  Employee creation error: ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      this.log(`❌ Employee creation failed: ${error.message}`);
      throw error;
    }
  }

  async verifyTestData() {
    try {
      this.log('🔍 Verifying test data...');
      
      // Count users by role
      const userCounts = await this.executeQuery(`
        SELECT role, COUNT(*) as count 
        FROM users 
        WHERE email IN ('admin@hrms.com', 'manager@hrms.com', 'employee@hrms.com')
        GROUP BY role
      `);
      
      userCounts.forEach(row => {
        this.log(`📊 ${row.role}: ${row.count} user(s)`);
      });
      
      // Count employees (admin should NOT have employee record)
      const employeeCount = await this.executeQuery(`
        SELECT COUNT(*) as count
        FROM employees
        WHERE employee_code IN ('EMP001', 'EMP002')
      `);

      this.log(`📊 Test employees: ${employeeCount[0].count} (admin excluded by design)`);
      
      // Show departments
      const deptCount = await this.executeQuery('SELECT COUNT(*) as count FROM departments');
      this.log(`📊 Departments: ${deptCount[0].count}`);
      
      // Show leave types
      const leaveTypeCount = await this.executeQuery('SELECT COUNT(*) as count FROM leave_types');
      this.log(`📊 Leave types: ${leaveTypeCount[0].count}`);
      
    } catch (error) {
      this.log(`❌ Data verification failed: ${error.message}`);
      throw error;
    }
  }

  async getTestCredentials() {
    return this.createdUsers.map(user => ({
      email: user.email,
      password: user.password,
      role: user.role,
      id: user.id
    }));
  }
}

// Export for use in other scripts
module.exports = TestDataCreator;

// Run if called directly
if (require.main === module) {
  const creator = new TestDataCreator();
  creator.createTestData()
    .then(result => {
      console.log('\n🎉 Test data creation completed!');
      console.log('\n📋 Test User Credentials:');
      result.users.forEach(user => {
        console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
      });
      console.log('\n📋 Creation Summary:');
      result.logs.forEach(log => console.log(log));
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test data creation failed!');
      console.error(error);
      process.exit(1);
    });
}
