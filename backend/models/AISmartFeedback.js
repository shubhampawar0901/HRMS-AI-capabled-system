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
      feedbackData.employeeId,
      feedbackData.feedbackType,
      feedbackData.generatedFeedback,
      JSON.stringify(feedbackData.performanceData),
      JSON.stringify(feedbackData.suggestions),
      feedbackData.confidence,
      feedbackData.generatedBy
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
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new AISmartFeedback(row));
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
