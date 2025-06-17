const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

class CompleteDBAnalyzer {
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
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.dbConfig);
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Database connection closed');
    }
  }

  async executeQuery(query, params = []) {
    try {
      const [rows] = await this.connection.execute(query, params);
      return rows;
    } catch (error) {
      console.error('❌ Query execution failed:', error.message);
      console.error('Query:', query);
      throw error;
    }
  }

  async getAllTables() {
    const query = `
      SELECT 
        TABLE_NAME,
        ENGINE,
        TABLE_ROWS,
        DATA_LENGTH,
        INDEX_LENGTH,
        TABLE_COMMENT
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;
    return await this.executeQuery(query, [this.dbConfig.database]);
  }

  async getTableColumns(tableName) {
    const query = `
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY,
        EXTRA,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
    return await this.executeQuery(query, [this.dbConfig.database, tableName]);
  }

  async getForeignKeys() {
    const query = `
      SELECT
        kcu.TABLE_NAME,
        kcu.COLUMN_NAME,
        kcu.CONSTRAINT_NAME,
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
      ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME
    `;
    return await this.executeQuery(query, [this.dbConfig.database]);
  }

  async getIndexes() {
    const query = `
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE,
        SEQ_IN_INDEX,
        INDEX_TYPE
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
    `;
    return await this.executeQuery(query, [this.dbConfig.database]);
  }

  async getConstraints() {
    const query = `
      SELECT 
        TABLE_NAME,
        CONSTRAINT_NAME,
        CONSTRAINT_TYPE
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, CONSTRAINT_TYPE
    `;
    return await this.executeQuery(query, [this.dbConfig.database]);
  }

  async analyzeTeamStructure() {
    console.log('\n🔍 ANALYZING TEAM STRUCTURE...\n');
    
    // Get all employees with their manager relationships
    const employeeHierarchy = await this.executeQuery(`
      SELECT 
        e.id,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.position,
        e.department_id,
        d.name as department_name,
        e.manager_id,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name,
        e.status
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.status = 'active'
      ORDER BY e.manager_id, e.first_name
    `);

    // Get managers and their team sizes
    const managerStats = await this.executeQuery(`
      SELECT 
        m.id as manager_id,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name,
        m.position as manager_position,
        COUNT(e.id) as team_size,
        GROUP_CONCAT(CONCAT(e.first_name, ' ', e.last_name) SEPARATOR ', ') as team_members
      FROM employees m
      INNER JOIN employees e ON e.manager_id = m.id
      WHERE m.status = 'active' AND e.status = 'active'
      GROUP BY m.id, m.first_name, m.last_name, m.position
      ORDER BY team_size DESC
    `);

    return { employeeHierarchy, managerStats };
  }

  async run() {
    try {
      await this.connect();
      
      console.log('📊 FETCHING COMPLETE DATABASE INFORMATION...\n');
      
      // Get all tables
      const tables = await this.getAllTables();
      console.log(`📋 Found ${tables.length} tables:`);
      tables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME} (${table.ENGINE}, ${table.TABLE_ROWS || 0} rows)`);
      });

      // Get foreign keys
      const foreignKeys = await this.getForeignKeys();
      console.log(`\n🔗 Found ${foreignKeys.length} foreign key relationships:`);
      foreignKeys.forEach(fk => {
        console.log(`  - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.DELETE_RULE})`);
      });

      // Get indexes
      const indexes = await this.getIndexes();
      const indexGroups = {};
      indexes.forEach(idx => {
        const key = `${idx.TABLE_NAME}.${idx.INDEX_NAME}`;
        if (!indexGroups[key]) {
          indexGroups[key] = {
            table: idx.TABLE_NAME,
            name: idx.INDEX_NAME,
            unique: idx.NON_UNIQUE === 0,
            type: idx.INDEX_TYPE,
            columns: []
          };
        }
        indexGroups[key].columns.push(idx.COLUMN_NAME);
      });

      console.log(`\n📇 Found ${Object.keys(indexGroups).length} indexes:`);
      Object.values(indexGroups).forEach(idx => {
        const uniqueStr = idx.unique ? 'UNIQUE' : 'INDEX';
        console.log(`  - ${idx.table}.${idx.name} (${uniqueStr}): [${idx.columns.join(', ')}]`);
      });

      // Analyze team structure
      const teamAnalysis = await this.analyzeTeamStructure();
      
      console.log(`\n👥 TEAM STRUCTURE ANALYSIS:`);
      console.log(`📊 Total active employees: ${teamAnalysis.employeeHierarchy.length}`);
      console.log(`👨‍💼 Total managers: ${teamAnalysis.managerStats.length}`);
      
      console.log(`\n🏢 MANAGERS AND THEIR TEAMS:`);
      teamAnalysis.managerStats.forEach(manager => {
        console.log(`\n  Manager: ${manager.manager_name} (ID: ${manager.manager_id})`);
        console.log(`  Position: ${manager.manager_position}`);
        console.log(`  Team Size: ${manager.team_size} members`);
        console.log(`  Team Members: ${manager.team_members}`);
      });

      console.log(`\n📋 EMPLOYEE HIERARCHY (showing manager relationships):`);
      const topLevel = teamAnalysis.employeeHierarchy.filter(emp => !emp.manager_id);
      const withManagers = teamAnalysis.employeeHierarchy.filter(emp => emp.manager_id);
      
      console.log(`\n🔝 TOP-LEVEL EMPLOYEES (No Manager):`);
      topLevel.forEach(emp => {
        console.log(`  - ${emp.employee_name} (${emp.position}) - ${emp.department_name}`);
      });
      
      console.log(`\n👥 EMPLOYEES WITH MANAGERS:`);
      withManagers.forEach(emp => {
        console.log(`  - ${emp.employee_name} (${emp.position}) → Reports to: ${emp.manager_name}`);
      });

      // Get detailed column information for key tables
      console.log(`\n📊 DETAILED TABLE ANALYSIS:`);
      
      const keyTables = ['users', 'employees', 'departments', 'attendance_records', 'payroll_records'];
      for (const tableName of keyTables) {
        console.log(`\n🔍 ${tableName.toUpperCase()} TABLE:`);
        const columns = await this.getTableColumns(tableName);
        columns.forEach(col => {
          const keyInfo = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
          const extraInfo = col.EXTRA ? ` (${col.EXTRA})` : '';
          console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}${keyInfo}${extraInfo}`);
        });
      }

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new CompleteDBAnalyzer();
  analyzer.run();
}

module.exports = CompleteDBAnalyzer;
