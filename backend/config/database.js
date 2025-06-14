require('dotenv').config();
const mysql = require('mysql2/promise');

// Database configuration
console.log('🔧 Loading database config...');
console.log('DB_HOST from env:', process.env.DB_HOST);
console.log('DB_USER from env:', process.env.DB_USER);
console.log('DB_NAME from env:', process.env.DB_NAME);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'hrms_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // acquireTimeout: 30000,  // ❌ Invalid option for MySQL2
  // timeout: 10000,         // ❌ Invalid option for MySQL2
  // reconnect: true,        // ❌ Invalid option for MySQL2
  charset: 'utf8mb4'
};

console.log('🔧 Final database config:');
console.log('Host:', dbConfig.host);
console.log('User:', dbConfig.user);
console.log('Database:', dbConfig.database);

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
};

// Close database connection
const closeDB = async () => {
  try {
    await pool.end();
    console.log('📴 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

// Execute query helper
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get connection for transactions
const getConnection = async () => {
  return await pool.getConnection();
};

module.exports = {
  pool,
  connectDB,
  closeDB,
  executeQuery,
  getConnection,
  dbConfig
};
