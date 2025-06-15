const { executeQuery } = require('../config/database');

class AISmartFeedback {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.feedbackType = data.feedback_type;
    this.generatedFeedback = data.generated_feedback;
    this.performanceData = data.performance_data;
    this.suggestions = data.suggestions;
    this.confidence = data.confidence;
    this.generatedBy = data.generated_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT af.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM ai_smart_feedback af
      LEFT JOIN employees e ON af.employee_id = e.id
      WHERE af.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new AISmartFeedback(rows[0]) : null;
  }

  static async create(feedbackData) {
    const query = `
      INSERT INTO ai_smart_feedback (
        employee_id, feedback_type, generated_feedback, performance_data,
        suggestions, confidence, generated_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      feedbackData.employeeId || null,
      feedbackData.feedbackType || null,
      feedbackData.generatedFeedback || null,
      JSON.stringify(feedbackData.performanceData || {}),
      JSON.stringify(feedbackData.suggestions || []),
      feedbackData.confidence || 0.0,
      feedbackData.generatedBy || null
    ]);
    
    return await AISmartFeedback.findById(result.insertId);
  }

  static async findByEmployee(employeeId, options = {}) {
    let query = 'SELECT * FROM ai_smart_feedback WHERE employee_id = ?';
    const params = [employeeId];

    if (options.feedbackType) {
      query += ' AND feedback_type = ?';
      params.push(options.feedbackType);
    }

    query += ' ORDER BY created_at DESC';

    if (options.limit) {
      const limit = parseInt(options.limit);
      const page = parseInt(options.page) || 1;
      const offset = (page - 1) * limit;
      // Use string concatenation instead of parameters for LIMIT/OFFSET to avoid MySQL issues
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => new AISmartFeedback(row));
  }

  static async findAll(options = {}) {
    let query = `
      SELECT af.*,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM ai_smart_feedback af
      LEFT JOIN employees e ON af.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (options.feedbackType) {
      query += ' AND af.feedback_type = ?';
      params.push(options.feedbackType);
    }

    query += ' ORDER BY af.created_at DESC';

    if (options.limit) {
      const limit = parseInt(options.limit);
      const page = parseInt(options.page) || 1;
      const offset = (page - 1) * limit;
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => new AISmartFeedback(row));
  }

  static async count(options = {}) {
    let query = 'SELECT COUNT(*) as total FROM ai_smart_feedback WHERE 1=1';
    const params = [];

    if (options.feedbackType) {
      query += ' AND feedback_type = ?';
      params.push(options.feedbackType);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async findByManager(managerId, options = {}) {
    let query = `
      SELECT af.*,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM ai_smart_feedback af
      JOIN employees e ON af.employee_id = e.id
      WHERE e.manager_id = ?
    `;
    const params = [managerId];

    if (options.feedbackType) {
      query += ' AND af.feedback_type = ?';
      params.push(options.feedbackType);
    }

    query += ' ORDER BY af.created_at DESC';

    if (options.limit) {
      const limit = parseInt(options.limit);
      const page = parseInt(options.page) || 1;
      const offset = (page - 1) * limit;
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => new AISmartFeedback(row));
  }

  static async countByManager(managerId, options = {}) {
    let query = `
      SELECT COUNT(*) as total FROM ai_smart_feedback af
      JOIN employees e ON af.employee_id = e.id
      WHERE e.manager_id = ?
    `;
    const params = [managerId];

    if (options.feedbackType) {
      query += ' AND af.feedback_type = ?';
      params.push(options.feedbackType);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async countByEmployee(employeeId, options = {}) {
    let query = 'SELECT COUNT(*) as total FROM ai_smart_feedback WHERE employee_id = ?';
    const params = [employeeId];

    if (options.feedbackType) {
      query += ' AND feedback_type = ?';
      params.push(options.feedbackType);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async update(id, updateData) {
    const query = `
      UPDATE ai_smart_feedback
      SET generated_feedback = ?,
          performance_data = ?,
          suggestions = ?,
          confidence = ?,
          updated_at = NOW()
      WHERE id = ?
    `;

    await executeQuery(query, [
      updateData.generatedFeedback || null,
      JSON.stringify(updateData.performanceData || {}),
      JSON.stringify(updateData.suggestions || []),
      updateData.confidence || 0.0,
      id
    ]);

    return await AISmartFeedback.findById(id);
  }

  toJSON() {
    const obj = { ...this };
    if (typeof obj.performanceData === 'string') {
      obj.performanceData = JSON.parse(obj.performanceData);
    }
    if (typeof obj.suggestions === 'string') {
      obj.suggestions = JSON.parse(obj.suggestions);
    }
    return obj;
  }

  async save() {
    if (this.id) {
      return await AISmartFeedback.update(this.id, this);
    } else {
      return await AISmartFeedback.create(this);
    }
  }
}

module.exports = AISmartFeedback;
