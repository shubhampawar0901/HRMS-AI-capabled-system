const { executeQuery } = require('../config/database');

class AISmartReport {
  constructor(data) {
    this.id = data.id;
    this.reportType = data.report_type;
    this.targetId = data.target_id;
    this.reportName = data.report_name;
    this.aiSummary = data.ai_summary;
    this.insightsJson = data.insights_json;
    this.recommendationsJson = data.recommendations_json;
    this.dataSnapshotJson = data.data_snapshot_json;
    this.generatedBy = data.generated_by;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT sr.*, 
             CONCAT(u.first_name, ' ', u.last_name) as generated_by_name,
             CASE 
               WHEN sr.report_type = 'employee' THEN CONCAT(e.first_name, ' ', e.last_name)
               WHEN sr.report_type = 'team' THEN CONCAT('Team of ', m.first_name, ' ', m.last_name)
               ELSE 'Department Report'
             END as target_name
      FROM ai_smart_reports sr
      LEFT JOIN users u ON sr.generated_by = u.id
      LEFT JOIN employees e ON sr.report_type = 'employee' AND sr.target_id = e.id
      LEFT JOIN employees m ON sr.report_type = 'team' AND sr.target_id = m.id
      WHERE sr.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new AISmartReport(rows[0]) : null;
  }

  static async create(reportData) {
    const query = `
      INSERT INTO ai_smart_reports (
        report_type, target_id, report_name, ai_summary,
        insights_json, recommendations_json, data_snapshot_json,
        generated_by, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      reportData.reportType,
      reportData.targetId,
      reportData.reportName,
      reportData.aiSummary,
      JSON.stringify(reportData.insights || []),
      JSON.stringify(reportData.recommendations || []),
      JSON.stringify(reportData.dataSnapshot || {}),
      reportData.generatedBy,
      reportData.status || 'completed'
    ]);
    
    return await AISmartReport.findById(result.insertId);
  }

  static async update(id, reportData) {
    const updates = [];
    const values = [];
    
    const fields = [
      'report_name', 'ai_summary', 'insights_json', 
      'recommendations_json', 'data_snapshot_json', 'status'
    ];
    
    fields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (reportData[camelField] !== undefined) {
        updates.push(`${field} = ?`);
        if (field.includes('_json')) {
          values.push(JSON.stringify(reportData[camelField]));
        } else {
          values.push(reportData[camelField]);
        }
      }
    });
    
    if (updates.length === 0) return await AISmartReport.findById(id);
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE ai_smart_reports SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await AISmartReport.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM ai_smart_reports WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findAll(options = {}) {
    let query = `
      SELECT sr.*, 
             CONCAT(u.first_name, ' ', u.last_name) as generated_by_name,
             CASE 
               WHEN sr.report_type = 'employee' THEN CONCAT(e.first_name, ' ', e.last_name)
               WHEN sr.report_type = 'team' THEN CONCAT('Team of ', m.first_name, ' ', m.last_name)
               ELSE 'Department Report'
             END as target_name
      FROM ai_smart_reports sr
      LEFT JOIN users u ON sr.generated_by = u.id
      LEFT JOIN employees e ON sr.report_type = 'employee' AND sr.target_id = e.id
      LEFT JOIN employees m ON sr.report_type = 'team' AND sr.target_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (options.reportType) {
      query += ' AND sr.report_type = ?';
      params.push(options.reportType);
    }

    if (options.generatedBy) {
      query += ' AND sr.generated_by = ?';
      params.push(options.generatedBy);
    }

    if (options.status) {
      query += ' AND sr.status = ?';
      params.push(options.status);
    }

    query += ' ORDER BY sr.created_at DESC';

    if (options.limit) {
      const limit = parseInt(options.limit);
      const page = parseInt(options.page) || 1;
      const offset = (page - 1) * limit;
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => new AISmartReport(row));
  }

  static async count(options = {}) {
    let query = 'SELECT COUNT(*) as total FROM ai_smart_reports WHERE 1=1';
    const params = [];

    if (options.reportType) {
      query += ' AND report_type = ?';
      params.push(options.reportType);
    }

    if (options.generatedBy) {
      query += ' AND generated_by = ?';
      params.push(options.generatedBy);
    }

    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  // Instance methods
  toJSON() {
    const obj = { ...this };
    
    // Parse JSON fields
    if (typeof obj.insightsJson === 'string') {
      try {
        obj.insights = JSON.parse(obj.insightsJson);
      } catch (e) {
        obj.insights = [];
      }
    }
    
    if (typeof obj.recommendationsJson === 'string') {
      try {
        obj.recommendations = JSON.parse(obj.recommendationsJson);
      } catch (e) {
        obj.recommendations = [];
      }
    }
    
    if (typeof obj.dataSnapshotJson === 'string') {
      try {
        obj.dataSnapshot = JSON.parse(obj.dataSnapshotJson);
      } catch (e) {
        obj.dataSnapshot = {};
      }
    }
    
    // Remove raw JSON fields from output
    delete obj.insightsJson;
    delete obj.recommendationsJson;
    delete obj.dataSnapshotJson;
    
    return obj;
  }

  async save() {
    if (this.id) {
      return await AISmartReport.update(this.id, this);
    } else {
      return await AISmartReport.create(this);
    }
  }
}

module.exports = AISmartReport;
