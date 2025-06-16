const { executeQuery } = require('./config/database');

async function checkUsers() {
  try {
    const users = await executeQuery('SELECT id, email, role FROM users WHERE role = "admin"');
    console.log('Admin users:', users);
    
    const allUsers = await executeQuery('SELECT id, email, role FROM users LIMIT 5');
    console.log('All users (first 5):', allUsers);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkUsers();
