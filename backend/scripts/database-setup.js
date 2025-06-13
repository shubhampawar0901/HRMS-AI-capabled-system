const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class DatabaseSetup {
  constructor() {
    this.logMessages = [];
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    };
    this.dbName = process.env.DB_NAME || 'hrms_db';
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.logMessages.push(logMessage);
  }

  async setupDatabase() {
    try {
      this.log('🚀 Starting database setup...');

      // Create database if not exists
      await this.createDatabase();

      // Test connection to the specific database
      await this.testConnection();

      // Execute schema
      await this.executeSchema();

      // Verify tables
      await this.verifyTables();

      this.log('✅ Database setup completed successfully!');
      return { success: true, logs: this.logMessages };

    } catch (error) {
      this.log(`❌ Database setup failed: ${error.message}`);
      throw error;
    }
  }

  async createDatabase() {
    let connection;
    try {
      this.log('🏗️ Creating database if not exists...');

      // Connect without specifying database
      connection = await mysql.createConnection(this.dbConfig);

      // Create database
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${this.dbName}\``);
      this.log(`✅ Database '${this.dbName}' created or already exists`);

    } catch (error) {
      this.log(`❌ Database creation failed: ${error.message}`);
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  async testConnection() {
    let connection;
    try {
      this.log('🔌 Testing database connection...');

      // Connect to the specific database
      const configWithDB = { ...this.dbConfig, database: this.dbName };
      connection = await mysql.createConnection(configWithDB);

      this.log('✅ Database connection successful');
    } catch (error) {
      this.log(`❌ Database connection failed: ${error.message}`);
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  async executeQuery(query, params = []) {
    let connection;
    try {
      const configWithDB = { ...this.dbConfig, database: this.dbName };
      connection = await mysql.createConnection(configWithDB);

      // Use query() for statements that don't support prepared statements
      const unsupportedStatements = ['USE', 'CREATE DATABASE', 'DROP DATABASE'];
      const isUnsupported = unsupportedStatements.some(stmt =>
        query.trim().toUpperCase().startsWith(stmt)
      );

      if (isUnsupported || params.length === 0) {
        const [rows] = await connection.query(query, params);
        return rows;
      } else {
        const [rows] = await connection.execute(query, params);
        return rows;
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  async executeSchema() {
    try {
      this.log('📋 Reading schema file...');
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schemaContent = await fs.readFile(schemaPath, 'utf8');

      this.log('🔨 Executing schema statements...');

      // Better SQL parsing - handle multi-line statements
      const statements = this.parseSQL(schemaContent);
      this.log(`📊 Found ${statements.length} statements to execute`);

      let executedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          try {
            this.log(`🔄 Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
            await this.executeQuery(statement);
            executedCount++;

            // Log table creation specifically
            if (statement.toUpperCase().includes('CREATE TABLE')) {
              const tableName = this.extractTableName(statement);
              this.log(`✅ Created table: ${tableName}`);
            } else if (statement.toUpperCase().includes('INSERT')) {
              this.log(`✅ Inserted default data`);
            } else if (statement.toUpperCase().includes('ALTER TABLE')) {
              this.log(`✅ Altered table structure`);
            }
          } catch (error) {
            // Log but continue for statements that might already exist
            if (error.message.includes('already exists') || error.message.includes('Duplicate entry')) {
              this.log(`ℹ️  Skipped (already exists): ${statement.substring(0, 50)}...`);
              skippedCount++;
            } else {
              this.log(`⚠️  Statement error: ${error.message}`);
              this.log(`🔍 Problematic statement: ${statement}`);
            }
          }
        }
      }

      this.log(`✅ Executed ${executedCount} schema statements, skipped ${skippedCount}`);
    } catch (error) {
      this.log(`❌ Schema execution failed: ${error.message}`);
      throw error;
    }
  }

  parseSQL(content) {
    // Remove comments and normalize whitespace
    const cleanContent = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('--'))
      .join(' ');

    // Split by semicolon and clean up
    const statements = cleanContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    return statements;
  }

  extractTableName(createStatement) {
    const match = createStatement.match(/CREATE TABLE.*?`?(\w+)`?/i);
    return match ? match[1] : 'unknown';
  }

  async verifyTables() {
    try {
      this.log('🔍 Verifying table creation...');

      const expectedTables = [
        'users', 'departments', 'employees', 'employee_documents',
        'attendance_records', 'leave_types', 'leave_balances', 'leave_applications',
        'payroll_records', 'performance_goals', 'performance_reviews',
        'ai_attrition_predictions', 'ai_smart_feedback', 'ai_attendance_anomalies',
        'ai_chatbot_interactions', 'ai_resume_parser'
      ];

      const query = `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        AND TABLE_TYPE = 'BASE TABLE'
      `;

      const tables = await this.executeQuery(query, [this.dbName]);
      const tableNames = tables.map(row => row.TABLE_NAME);

      this.log(`📊 Found ${tableNames.length} tables in database`);

      const missingTables = expectedTables.filter(table => !tableNames.includes(table));
      const extraTables = tableNames.filter(table => !expectedTables.includes(table));

      if (missingTables.length > 0) {
        this.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
      }

      if (extraTables.length > 0) {
        this.log(`ℹ️  Additional tables: ${extraTables.join(', ')}`);
      }

      expectedTables.forEach(table => {
        if (tableNames.includes(table)) {
          this.log(`✅ Table verified: ${table}`);
        }
      });

      // Check foreign key constraints
      await this.verifyConstraints();

    } catch (error) {
      this.log(`❌ Table verification failed: ${error.message}`);
      throw error;
    }
  }

  async verifyConstraints() {
    try {
      this.log('🔗 Verifying foreign key constraints...');

      const query = `
        SELECT
          CONSTRAINT_NAME,
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE CONSTRAINT_SCHEMA = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `;

      const constraints = await this.executeQuery(query, [this.dbName]);
      this.log(`✅ Found ${constraints.length} foreign key constraints`);

      constraints.forEach(constraint => {
        this.log(`🔗 ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
      });

    } catch (error) {
      this.log(`⚠️  Constraint verification warning: ${error.message}`);
    }
  }

  async getTableCounts() {
    try {
      this.log('📊 Getting table record counts...');

      const tables = ['users', 'departments', 'employees', 'leave_types'];
      const counts = {};

      for (const table of tables) {
        try {
          const result = await this.executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
          counts[table] = result[0].count;
          this.log(`📊 ${table}: ${counts[table]} records`);
        } catch (error) {
          this.log(`⚠️  Could not count ${table}: ${error.message}`);
          counts[table] = 'error';
        }
      }

      return counts;
    } catch (error) {
      this.log(`❌ Table count failed: ${error.message}`);
      return {};
    }
  }
}

// Export for use in other scripts
module.exports = DatabaseSetup;

// Run if called directly
if (require.main === module) {
  const setup = new DatabaseSetup();
  setup.setupDatabase()
    .then(result => {
      console.log('\n🎉 Database setup completed!');
      console.log('📋 Setup Summary:');
      result.logs.forEach(log => console.log(log));
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Database setup failed!');
      console.error(error);
      process.exit(1);
    });
}
