const { executeQuery } = require('./config/database');
const bcrypt = require('bcryptjs');

async function checkPasswords() {
  try {
    const users = await executeQuery('SELECT id, email, password FROM users WHERE role = "admin" OR role = "manager" LIMIT 5');
    console.log('Users found:', users.length);
    
    for (const user of users) {
      console.log(`\nUser: ${user.email}`);
      console.log(`Password hash: ${user.password}`);
      
      // Test common passwords
      const testPasswords = ['admin123', 'manager123', 'password', '123456', 'admin', 'manager'];
      
      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          if (isMatch) {
            console.log(`✅ Password for ${user.email} is: ${testPassword}`);
            break;
          }
        } catch (error) {
          // Skip bcrypt errors
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkPasswords();
