const { executeQuery } = require('./config/database');

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users in database...');
    
    const users = await executeQuery('SELECT id, email, role FROM users WHERE role = ? LIMIT 5', ['admin']);
    console.log('Admin users found:', users);
    
    if (users.length === 0) {
      console.log('❌ No admin users found. Let\'s check all users:');
      const allUsers = await executeQuery('SELECT id, email, role FROM users LIMIT 10');
      console.log('All users:', allUsers);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAdminUsers();
