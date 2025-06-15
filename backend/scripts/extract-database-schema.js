const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

class DatabaseSchemaExtractor {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hrms_db',
      charset: 'utf8mb4'
    };
    this.connection = null;
    this.schemaData = {
      tables: {},
      foreignKeys: [],
      indexes: [],
      enums: {},
      constraints: []
    };
  }

  async connect() {
    try {
      console.log('🔗 Attempting to connect to database...');
      console.log('Host:', this.dbConfig.host);
      console.log('Database:', this.dbConfig.database);
      console.log('User:', this.dbConfig.user);

      this.connection = await mysql.createConnection(this.dbConfig);
      console.log('✅ Connected to database successfully');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('📴 Database connection closed');
    }
  }

  async getTables() {
    try {
      const [tables] = await this.connection.execute(`
        SELECT TABLE_NAME, TABLE_COMMENT, ENGINE, TABLE_COLLATION
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `, [this.dbConfig.database]);

      console.log(`📋 Found ${tables.length} tables`);
      return tables;
    } catch (error) {
      console.error('❌ Error fetching tables:', error.message);
      throw error;
    }
  }

  async getTableColumns(tableName) {
    try {
      const [columns] = await this.connection.execute(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          COLUMN_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          EXTRA,
          COLUMN_KEY,
          COLUMN_COMMENT,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [this.dbConfig.database, tableName]);

      return columns;
    } catch (error) {
      console.error(`❌ Error fetching columns for ${tableName}:`, error.message);
      throw error;
    }
  }

  async getForeignKeys() {
    try {
      const [foreignKeys] = await this.connection.execute(`
        SELECT
          kcu.CONSTRAINT_NAME,
          kcu.TABLE_NAME,
          kcu.COLUMN_NAME,
          kcu.REFERENCED_TABLE_NAME,
          kcu.REFERENCED_COLUMN_NAME,
          rc.UPDATE_RULE,
          rc.DELETE_RULE
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
          ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
          AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
        WHERE kcu.TABLE_SCHEMA = ?
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY kcu.TABLE_NAME, kcu.CONSTRAINT_NAME
      `, [this.dbConfig.database]);

      return foreignKeys;
    } catch (error) {
      console.error('❌ Error fetching foreign keys:', error.message);
      throw error;
    }
  }

  async getIndexes() {
    try {
      const [indexes] = await this.connection.execute(`
        SELECT 
          TABLE_NAME,
          INDEX_NAME,
          COLUMN_NAME,
          NON_UNIQUE,
          INDEX_TYPE,
          SEQ_IN_INDEX
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
      `, [this.dbConfig.database]);

      return indexes;
    } catch (error) {
      console.error('❌ Error fetching indexes:', error.message);
      throw error;
    }
  }

  async getConstraints() {
    try {
      const [constraints] = await this.connection.execute(`
        SELECT 
          CONSTRAINT_NAME,
          TABLE_NAME,
          CONSTRAINT_TYPE
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME, CONSTRAINT_TYPE
      `, [this.dbConfig.database]);

      return constraints;
    } catch (error) {
      console.error('❌ Error fetching constraints:', error.message);
      throw error;
    }
  }

  extractEnumValues(columnType) {
    if (columnType.startsWith('enum(')) {
      const enumString = columnType.substring(5, columnType.length - 1);
      return enumString.split(',').map(val => val.replace(/'/g, '').trim());
    }
    return null;
  }

  async extractSchema() {
    try {
      console.log('🔍 Extracting database schema...');
      
      // Get all tables
      const tables = await this.getTables();
      
      // Extract schema for each table
      for (const table of tables) {
        const tableName = table.TABLE_NAME;
        console.log(`📊 Processing table: ${tableName}`);
        
        const columns = await this.getTableColumns(tableName);
        
        this.schemaData.tables[tableName] = {
          comment: table.TABLE_COMMENT,
          engine: table.ENGINE,
          collation: table.TABLE_COLLATION,
          columns: {}
        };

        // Process columns
        for (const column of columns) {
          const columnName = column.COLUMN_NAME;
          
          this.schemaData.tables[tableName].columns[columnName] = {
            dataType: column.DATA_TYPE,
            columnType: column.COLUMN_TYPE,
            nullable: column.IS_NULLABLE === 'YES',
            default: column.COLUMN_DEFAULT,
            extra: column.EXTRA,
            key: column.COLUMN_KEY,
            comment: column.COLUMN_COMMENT,
            maxLength: column.CHARACTER_MAXIMUM_LENGTH,
            precision: column.NUMERIC_PRECISION,
            scale: column.NUMERIC_SCALE
          };

          // Extract enum values
          if (column.DATA_TYPE === 'enum') {
            const enumValues = this.extractEnumValues(column.COLUMN_TYPE);
            if (enumValues) {
              if (!this.schemaData.enums[tableName]) {
                this.schemaData.enums[tableName] = {};
              }
              this.schemaData.enums[tableName][columnName] = enumValues;
            }
          }
        }
      }

      // Get foreign keys
      this.schemaData.foreignKeys = await this.getForeignKeys();
      
      // Get indexes
      this.schemaData.indexes = await this.getIndexes();
      
      // Get constraints
      this.schemaData.constraints = await this.getConstraints();

      console.log('✅ Schema extraction completed');
      return this.schemaData;

    } catch (error) {
      console.error('❌ Schema extraction failed:', error.message);
      throw error;
    }
  }

  generateMarkdownReference() {
    let markdown = `# HRMS Database Reference Guide (ACTUAL SCHEMA)
**Complete Database Schema Reference for API Development - Generated from Live Database**

> ⚠️ **CRITICAL**: This file is auto-generated from the actual database. Always reference this file when creating/updating APIs that interact with database tables.

**Generated on**: ${new Date().toISOString()}
**Database**: ${this.dbConfig.database}
**Host**: ${this.dbConfig.host}

---

## Database Configuration
- **Database Type**: MySQL
- **Database Name**: \`${this.dbConfig.database}\`
- **Charset**: utf8mb4
- **Total Tables**: ${Object.keys(this.schemaData.tables).length}

---

## Tables Overview

`;

    // Generate table documentation
    for (const [tableName, tableData] of Object.entries(this.schemaData.tables)) {
      markdown += `### ${tableName}\n`;
      if (tableData.comment) {
        markdown += `**Purpose**: ${tableData.comment}\n`;
      }
      markdown += `**Engine**: ${tableData.engine}\n`;
      markdown += `**Columns**: ${Object.keys(tableData.columns).length}\n\n`;

      markdown += `| Column | Type | Nullable | Default | Key | Extra |\n`;
      markdown += `|--------|------|----------|---------|-----|-------|\n`;

      for (const [columnName, columnData] of Object.entries(tableData.columns)) {
        const nullable = columnData.nullable ? 'YES' : 'NO';
        const defaultVal = columnData.default || 'NULL';
        const key = columnData.key || '';
        const extra = columnData.extra || '';
        
        markdown += `| ${columnName} | ${columnData.columnType} | ${nullable} | ${defaultVal} | ${key} | ${extra} |\n`;
      }
      
      markdown += '\n';
    }

    return markdown;
  }

  async run() {
    try {
      await this.connect();
      await this.extractSchema();
      
      const markdownContent = this.generateMarkdownReference();
      
      // Save to file in project root
      const outputPath = path.join(__dirname, '..', '..', 'DATABASE_REFERENCE_ACTUAL.md');
      await fs.writeFile(outputPath, markdownContent, 'utf8');
      
      console.log(`✅ Database reference saved to: ${outputPath}`);
      console.log(`📊 Total tables processed: ${Object.keys(this.schemaData.tables).length}`);
      console.log(`🔗 Total foreign keys: ${this.schemaData.foreignKeys.length}`);
      
    } catch (error) {
      console.error('❌ Script execution failed:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run the script
if (require.main === module) {
  const extractor = new DatabaseSchemaExtractor();
  extractor.run();
}

module.exports = DatabaseSchemaExtractor;
