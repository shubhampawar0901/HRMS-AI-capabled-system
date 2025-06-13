const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'hrms_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 30000,
  timeout: 10000,
  reconnect: true,
  charset: 'utf8mb4'
};

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
