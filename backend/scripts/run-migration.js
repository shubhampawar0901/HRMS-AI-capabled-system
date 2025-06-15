const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load environment variables from the backend directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/create_ai_policy_documents.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the migration into separate statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement.trim());
        } catch (error) {
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }
    }
    console.log('✅ Migration executed successfully');

    // Verify the table was created
    const [rows] = await connection.execute("SHOW TABLES LIKE 'ai_policy_documents'");
    if (rows.length > 0) {
      console.log('✅ Table ai_policy_documents created successfully');
      
      // Check if sample data was inserted
      const [sampleData] = await connection.execute("SELECT COUNT(*) as count FROM ai_policy_documents");
      console.log(`✅ Sample data inserted: ${sampleData[0].count} records`);
    } else {
      console.log('❌ Table creation failed');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the migration
runMigration();
