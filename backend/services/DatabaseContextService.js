// Database Context Service for LLM Query Generation
const fs = require('fs').promises;
const path = require('path');

class DatabaseContextService {
  constructor() {
    this.schemaCache = new Map();
    this.contextCache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.schemaDocPath = path.join(__dirname, '../utils/database-schema-context.md');
    
    // Pre-defined context templates for common query types
    this.contextTemplates = {
      personal_data_attendance: {
        tables: ['attendance', 'employees'],
        securityRules: ['WHERE employeeId = ?', 'Only user\'s own data'],
        commonPatterns: ['Monthly summaries', 'Date range queries', 'Status filtering']
      },
      
      personal_data_leave: {
        tables: ['leave_balances', 'leave_types', 'leave_applications', 'employees'],
        securityRules: ['WHERE employee_id = ?', 'Current year focus'],
        commonPatterns: ['Balance queries', 'Application history', 'Type-specific data']
      },
      
      personal_data_performance: {
        tables: ['performance_reviews', 'performance_goals', 'employees'],
        securityRules: ['WHERE employee_id = ?', 'Recent reviews priority'],
        commonPatterns: ['Latest review', 'Goal progress', 'Rating trends']
      },
      
      personal_data_payroll: {
        tables: ['payroll_records', 'employees'],
        securityRules: ['WHERE employee_id = ?', 'SENSITIVE DATA - Extra caution'],
        commonPatterns: ['Monthly payslips', 'YTD calculations', 'Deduction breakdowns']
      }
    };
    
    // Table-specific context for focused queries
    this.tableContexts = {
      employees: {
        purpose: 'Central employee information and hierarchy',
        keyColumns: ['id', 'employee_code', 'first_name', 'last_name', 'department_id', 'manager_id', 'status'],
        relationships: ['departments', 'users', 'self-referencing for hierarchy'],
        securityNote: 'Filter by status=active for current employees'
      },
      
      attendance: {
        purpose: 'Daily attendance tracking and work hours',
        keyColumns: ['employeeId', 'date', 'status', 'totalHours', 'checkInTime', 'checkOutTime'],
        relationships: ['employees'],
        securityNote: 'Always filter by employeeId for personal data',
        commonQueries: ['Monthly summaries', 'Absence counts', 'Late arrival patterns']
      },
      
      leave_balances: {
        purpose: 'Employee leave entitlements and usage',
        keyColumns: ['employee_id', 'leave_type_id', 'year', 'allocated_days', 'used_days', 'remaining_days'],
        relationships: ['employees', 'leave_types'],
        securityNote: 'Filter by employee_id and current year',
        commonQueries: ['Current balance', 'Usage history', 'Type-wise breakdown']
      },
      
      payroll_records: {
        purpose: 'Salary calculations and payment details',
        keyColumns: ['employee_id', 'month', 'year', 'basic_salary', 'gross_salary', 'net_salary', 'status'],
        relationships: ['employees'],
        securityNote: 'HIGHLY SENSITIVE - Strict employee_id filtering required',
        commonQueries: ['Monthly payslip', 'YTD earnings', 'Deduction analysis']
      }
    };
  }

  async getContextForQuery(queryType, specificTables = [], userContext = {}) {
    try {
      const cacheKey = `${queryType}_${specificTables.join('_')}_${userContext.role || 'employee'}`;
      
      // Check cache first
      const cached = this.contextCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.context;
      }

      // Generate context based on query type
      let context = await this.generateContextForQueryType(queryType, specificTables, userContext);
      
      // Cache the result
      this.contextCache.set(cacheKey, {
        context: context,
        timestamp: Date.now()
      });

      return context;
      
    } catch (error) {
      console.error('Error getting database context:', error);
      return this.getFallbackContext();
    }
  }

  async generateContextForQueryType(queryType, specificTables, userContext) {
    const context = {
      queryType: queryType,
      relevantTables: [],
      securityRules: [],
      commonPatterns: [],
      exampleQueries: [],
      businessContext: ''
    };

    // Get template if available
    const template = this.contextTemplates[queryType];
    if (template) {
      context.relevantTables = template.tables;
      context.securityRules = template.securityRules;
      context.commonPatterns = template.commonPatterns;
    }

    // Add specific table contexts
    const tablesToInclude = specificTables.length > 0 ? specificTables : (context.relevantTables || []);

    // Ensure relevantTables is initialized
    if (!context.relevantTables) {
      context.relevantTables = [];
    }

    for (const tableName of tablesToInclude) {
      const tableContext = this.tableContexts[tableName];
      if (tableContext) {
        if (!context.relevantTables.includes(tableName)) {
          context.relevantTables.push(tableName);
        }
        context.securityRules.push(tableContext.securityNote);

        // Add table-specific information
        context.businessContext += `\n**${tableName}**: ${tableContext.purpose}\n`;
        context.businessContext += `Key Columns: ${tableContext.keyColumns.join(', ')}\n`;
        context.businessContext += `Relationships: ${tableContext.relationships.join(', ')}\n`;

        if (tableContext.commonQueries) {
          context.commonPatterns.push(...tableContext.commonQueries);
        }
      }
    }

    // Add user-specific security context
    if (userContext.employeeId) {
      context.securityRules.push(`CRITICAL: Only return data for employee_id = ${userContext.employeeId}`);
      context.securityRules.push('NEVER return data for other employees');
    }

    // Generate example queries based on context
    context.exampleQueries = await this.generateExampleQueries(queryType, tablesToInclude, userContext);

    return context;
  }

  async generateExampleQueries(queryType, tables, userContext) {
    const examples = [];
    const employeeId = userContext.employeeId || '?';

    switch (queryType) {
      case 'personal_data_attendance':
        examples.push(
          `-- Get monthly attendance summary
SELECT COUNT(*) as total_days, 
       SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
       SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
FROM attendance 
WHERE employeeId = ${employeeId} AND MONTH(date) = ? AND YEAR(date) = ?`,

          `-- Get recent attendance records
SELECT date, checkInTime, checkOutTime, status, totalHours 
FROM attendance 
WHERE employeeId = ${employeeId} 
ORDER BY date DESC LIMIT 10`
        );
        break;

      case 'personal_data_leave':
        examples.push(
          `-- Get current year leave balance
SELECT lb.*, lt.name as leave_type_name
FROM leave_balances lb
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lb.employee_id = ${employeeId} AND lb.year = YEAR(CURDATE())`,

          `-- Get recent leave applications
SELECT la.*, lt.name as leave_type_name
FROM leave_applications la
JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.employee_id = ${employeeId}
ORDER BY la.created_at DESC LIMIT 5`
        );
        break;

      case 'personal_data_performance':
        examples.push(
          `-- Get latest performance review
SELECT pr.*, e.first_name, e.last_name
FROM performance_reviews pr
JOIN employees e ON pr.reviewer_id = e.id
WHERE pr.employee_id = ${employeeId}
ORDER BY pr.created_at DESC LIMIT 1`,

          `-- Get active performance goals
SELECT * FROM performance_goals
WHERE employee_id = ${employeeId} AND status = 'active'
ORDER BY target_date ASC`
        );
        break;

      case 'personal_data_payroll':
        examples.push(
          `-- Get latest payslip
SELECT * FROM payroll_records
WHERE employee_id = ${employeeId}
ORDER BY year DESC, month DESC LIMIT 1`,

          `-- Get YTD earnings summary
SELECT SUM(gross_salary) as ytd_gross, SUM(net_salary) as ytd_net
FROM payroll_records
WHERE employee_id = ${employeeId} AND year = YEAR(CURDATE())`
        );
        break;
    }

    return examples;
  }

  async getFullSchemaContext() {
    try {
      // Check cache first
      const cached = this.schemaCache.get('full_schema');
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.content;
      }

      // Read the full schema documentation
      const schemaContent = await fs.readFile(this.schemaDocPath, 'utf8');
      
      // Cache it
      this.schemaCache.set('full_schema', {
        content: schemaContent,
        timestamp: Date.now()
      });

      return schemaContent;
      
    } catch (error) {
      console.error('Error reading schema documentation:', error);
      return this.getFallbackContext();
    }
  }

  async getMinimalSchemaContext(tables = []) {
    try {
      const fullSchema = await this.getFullSchemaContext();
      
      if (tables.length === 0) {
        // Return core tables only
        tables = ['employees', 'attendance', 'leave_balances', 'performance_reviews'];
      }

      // Extract relevant sections for specified tables
      let minimalContext = "# HRMS Database Schema (Relevant Tables)\n\n";
      
      for (const table of tables) {
        const tableContext = this.tableContexts[table];
        if (tableContext) {
          minimalContext += `## ${table}\n`;
          minimalContext += `**Purpose:** ${tableContext.purpose}\n`;
          minimalContext += `**Key Columns:** ${tableContext.keyColumns.join(', ')}\n`;
          minimalContext += `**Security:** ${tableContext.securityNote}\n\n`;
        }
      }

      return minimalContext;
      
    } catch (error) {
      console.error('Error generating minimal schema context:', error);
      return this.getFallbackContext();
    }
  }

  getFallbackContext() {
    return `
# Basic HRMS Schema
- employees: id, employee_code, first_name, last_name, department_id, status
- attendance: id, employeeId, date, status, totalHours
- leave_balances: id, employee_id, leave_type_id, year, remaining_days
- performance_reviews: id, employee_id, reviewer_id, overall_rating

SECURITY: Always filter by employee_id for personal data queries.
`;
  }

  // Method to update schema cache when database changes
  async refreshSchemaCache() {
    this.schemaCache.clear();
    this.contextCache.clear();
    console.log('Database schema cache refreshed');
  }

  // Get context optimized for specific LLM prompt
  async getLLMOptimizedContext(queryType, userQuery, userContext) {
    try {
      // Load all context from utils files
      const schemaDoc = await this.loadSchemaDocumentation();
      const securityRules = await this.loadSecurityRules();
      const queryTemplates = await this.loadQueryTemplates();
      const tableRelationships = await this.loadTableRelationships();

      // Generate enhanced context
      const context = await this.generateEnhancedContext(
        queryType,
        userQuery,
        userContext,
        schemaDoc,
        securityRules,
        queryTemplates,
        tableRelationships
      );

      return context;
    } catch (error) {
      console.error('Error generating enhanced LLM context:', error);
      // Fallback to basic context
      const basicContext = await this.getContextForQuery(queryType, [], userContext);
      return {
        schemaContext: basicContext.businessContext || '',
        securityRules: basicContext.securityRules || [],
        exampleQueries: (basicContext.exampleQueries || []).slice(0, 2),
        queryGuidelines: [
          'Always use parameterized queries with ? placeholders',
          'Include proper JOINs for related data',
          'Filter by employee_id for personal data',
          'Use appropriate date ranges for performance',
          'Include status filters for active records'
        ]
      };
    }
  }

  // Load schema documentation from utils folder
  async loadSchemaDocumentation() {
    try {
      const cached = this.schemaCache.get('schema_doc');
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.content;
      }

      const schemaContent = await fs.readFile(this.schemaDocPath, 'utf8');

      this.schemaCache.set('schema_doc', {
        content: schemaContent,
        timestamp: Date.now()
      });

      return schemaContent;
    } catch (error) {
      console.error('Error loading schema documentation:', error);
      return 'Basic schema documentation not available';
    }
  }

  // Load security rules from utils folder
  async loadSecurityRules() {
    try {
      const cached = this.schemaCache.get('security_rules');
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.content;
      }

      const securityPath = path.join(__dirname, '../utils/security-rules.json');
      const securityContent = await fs.readFile(securityPath, 'utf8');
      const securityRules = JSON.parse(securityContent);

      this.schemaCache.set('security_rules', {
        content: securityRules,
        timestamp: Date.now()
      });

      return securityRules;
    } catch (error) {
      console.error('Error loading security rules:', error);
      return { personal_data_queries: { required_filters: ['employee_id = ?'] } };
    }
  }

  // Load query templates from utils folder
  async loadQueryTemplates() {
    try {
      const cached = this.schemaCache.get('query_templates');
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.content;
      }

      const templatesPath = path.join(__dirname, '../utils/query-templates.json');
      const templatesContent = await fs.readFile(templatesPath, 'utf8');
      const queryTemplates = JSON.parse(templatesContent);

      this.schemaCache.set('query_templates', {
        content: queryTemplates,
        timestamp: Date.now()
      });

      return queryTemplates;
    } catch (error) {
      console.error('Error loading query templates:', error);
      return {};
    }
  }

  // Load table relationships from utils folder
  async loadTableRelationships() {
    try {
      const cached = this.schemaCache.get('table_relationships');
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.content;
      }

      const relationshipsPath = path.join(__dirname, '../utils/table-relationships.json');
      const relationshipsContent = await fs.readFile(relationshipsPath, 'utf8');
      const tableRelationships = JSON.parse(relationshipsContent);

      this.schemaCache.set('table_relationships', {
        content: tableRelationships,
        timestamp: Date.now()
      });

      return tableRelationships;
    } catch (error) {
      console.error('Error loading table relationships:', error);
      return {};
    }
  }

  // Generate enhanced context using all loaded data
  async generateEnhancedContext(queryType, userQuery, userContext, schemaDoc, securityRules, queryTemplates, tableRelationships) {
    // Extract relevant schema sections based on query type
    const relevantTables = this.getRelevantTablesForQuery(queryType);
    const schemaContext = this.extractRelevantSchemaContext(schemaDoc, relevantTables);

    // Get security rules for the query type
    const querySecurityRules = this.getSecurityRulesForQuery(queryType, userContext, securityRules);

    // Get example queries from templates
    const exampleQueries = this.getExampleQueriesForQuery(queryType, queryTemplates);

    // Get relationship information
    const relationshipInfo = this.getRelationshipInfoForTables(relevantTables, tableRelationships);

    return {
      schemaContext: schemaContext,
      securityRules: querySecurityRules,
      exampleQueries: exampleQueries,
      relationshipInfo: relationshipInfo,
      queryGuidelines: [
        'Generate secure SQL with 30-second timeout consideration',
        'Always use parameterized queries with ? placeholders',
        'Include proper JOINs based on table relationships',
        'Filter by employee_id for personal data queries',
        'Use appropriate date ranges and status filters',
        'Limit results to reasonable numbers (e.g., LIMIT 100)'
      ]
    };
  }

  getRelevantTablesForQuery(queryType) {
    const tableMapping = {
      'personal_data_attendance': ['attendance', 'employees'],
      'personal_data_leave': ['leave_balances', 'leave_types', 'leave_applications', 'employees'],
      'personal_data_performance': ['performance_reviews', 'performance_goals', 'employees'],
      'personal_data_payroll': ['payroll_records', 'employees']
    };

    return tableMapping[queryType] || ['employees'];
  }

  extractRelevantSchemaContext(schemaDoc, tables) {
    // Extract sections for relevant tables from the schema documentation
    let context = '';

    for (const table of tables) {
      // Updated regex to handle emojis and flexible formatting
      const tableRegex = new RegExp(`### \\*\\*[^*]*${table}[^*]*\\*\\*[\\s\\S]*?(?=### \\*\\*|$)`, 'i');
      const match = schemaDoc.match(tableRegex);
      if (match) {
        context += match[0] + '\n\n';
        console.log(`[SCHEMA] Found context for table: ${table}`);
      } else {
        console.log(`[SCHEMA] No context found for table: ${table}`);
      }
    }

    return context || 'Schema context not available for specified tables';
  }

  getSecurityRulesForQuery(queryType, userContext, securityRules) {
    const rules = [];

    // Add general security rules
    if (securityRules.personal_data_queries) {
      rules.push(...securityRules.personal_data_queries.required_filters);
    }

    // Add user-specific rules
    rules.push(`CRITICAL: Only return data for employee_id = ${userContext.employeeId}`);
    rules.push('NEVER return data for other employees');
    rules.push('Always filter by employeeId for personal data');

    return rules;
  }

  getExampleQueriesForQuery(queryType, queryTemplates) {
    const examples = [];

    // Map query types to template keys
    const templateMapping = {
      'personal_data_attendance': ['attendance_monthly_summary', 'attendance_recent_records'],
      'personal_data_leave': ['leave_balance_current', 'leave_applications_recent'],
      'personal_data_performance': ['performance_review_latest', 'performance_goals_active'],
      'personal_data_payroll': ['payroll_latest', 'payroll_ytd_summary']
    };

    const templateKeys = templateMapping[queryType] || [];

    for (const key of templateKeys) {
      if (queryTemplates[key]) {
        examples.push(queryTemplates[key].sql);
      }
    }

    return examples.slice(0, 3); // Limit to 3 examples
  }

  getRelationshipInfoForTables(tables, tableRelationships) {
    const relationships = [];

    try {
      if (tableRelationships && tableRelationships.common_joins) {
        for (const [joinName, joinInfo] of Object.entries(tableRelationships.common_joins)) {
          // Check if joinInfo and sql exist
          if (joinInfo && joinInfo.sql && typeof joinInfo.sql === 'string') {
            // Check if this join is relevant to our tables
            const joinTables = joinInfo.sql.match(/FROM\s+(\w+)|JOIN\s+(\w+)/gi);
            if (joinTables && joinTables.some(jt => tables.some(t => jt.toLowerCase().includes(t)))) {
              relationships.push({
                name: joinName,
                sql: joinInfo.sql,
                description: joinInfo.description || 'No description available'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing table relationships:', error);
      // Return empty array on error
    }

    return relationships.slice(0, 2); // Limit to 2 most relevant relationships
  }
}

module.exports = DatabaseContextService;
