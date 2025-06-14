const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createUsers() {
  let connection;
  try {
    console.log('🔗 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to database');
    
    const users = [
      { email: 'admin@hrms.com', password: 'Admin123!', role: 'admin' },
      { email: 'manager@hrms.com', password: 'Manager123!', role: 'manager' },
      { email: 'employee@hrms.com', password: 'Employee123!', role: 'employee' }
    ];
    
    for (const user of users) {
      try {
        // Check if user exists
        const [existing] = await connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );
        
        if (existing.length > 0) {
          console.log(`ℹ️  User already exists: ${user.email}`);
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Create user
        const [result] = await connection.execute(
          'INSERT INTO users (email, password, role, is_active, created_at, updated_at) VALUES (?, ?, ?, TRUE, NOW(), NOW())',
          [user.email, hashedPassword, user.role]
        );
        
        console.log(`✅ Created user: ${user.email} (${user.role}) - ID: ${result.insertId}`);
        
      } catch (error) {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }
    
    // Verify users
    console.log('\n🔍 Verifying created users:');
    const [users_result] = await connection.execute(
      'SELECT id, email, role, is_active FROM users WHERE email IN (?, ?, ?)',
      ['admin@hrms.com', 'manager@hrms.com', 'employee@hrms.com']
    );
    
    console.table(users_result);
    
    console.log('\n🎉 User creation completed!');
    console.log('\n📋 Test Credentials:');
    console.log('ADMIN: admin@hrms.com / Admin123!');
    console.log('MANAGER: manager@hrms.com / Manager123!');
    console.log('EMPLOYEE: employee@hrms.com / Employee123!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createUsers();
