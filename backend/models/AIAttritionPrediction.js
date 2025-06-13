const { executeQuery } = require('../config/database');

class AIAttritionPrediction {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.riskScore = data.risk_score;
    this.riskLevel = data.risk_level;
    this.factors = data.factors;
    this.recommendations = data.recommendations;
    this.predictionDate = data.prediction_date;
    this.modelVersion = data.model_version;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT ap.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM ai_attrition_predictions ap
      LEFT JOIN employees e ON ap.employee_id = e.id
      WHERE ap.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new AIAttritionPrediction(rows[0]) : null;
  }

  static async create(predictionData) {
    const query = `
      INSERT INTO ai_attrition_predictions (
        employee_id, risk_score, risk_level, factors, recommendations,
        prediction_date, model_version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      predictionData.employeeId,
      predictionData.riskScore,
      predictionData.riskLevel,
      JSON.stringify(predictionData.factors),
      JSON.stringify(predictionData.recommendations),
      predictionData.predictionDate || new Date(),
      predictionData.modelVersion || '1.0'
    ]);
    
    return await AIAttritionPrediction.findById(result.insertId);
  }

  static async findByEmployee(employeeId, options = {}) {
    let query = 'SELECT * FROM ai_attrition_predictions WHERE employee_id = ?';
    const params = [employeeId];
    
    if (options.latest) {
      query += ' ORDER BY prediction_date DESC LIMIT 1';
    } else {
      query += ' ORDER BY prediction_date DESC';
    }
    
    const rows = await executeQuery(query, params);
    return options.latest && rows.length > 0 
      ? new AIAttritionPrediction(rows[0])
      : rows.map(row => new AIAttritionPrediction(row));
  }

  static async getHighRiskEmployees(riskThreshold = 0.7) {
    const query = `
      SELECT ap.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             d.name as department_name
      FROM ai_attrition_predictions ap
      JOIN employees e ON ap.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE ap.risk_score >= ?
        AND ap.prediction_date = (
          SELECT MAX(prediction_date) 
          FROM ai_attrition_predictions ap2 
          WHERE ap2.employee_id = ap.employee_id
        )
      ORDER BY ap.risk_score DESC
    `;
    
    const rows = await executeQuery(query, [riskThreshold]);
    return rows.map(row => new AIAttritionPrediction(row));
  }

  toJSON() {
    const obj = { ...this };
    if (typeof obj.factors === 'string') {
      obj.factors = JSON.parse(obj.factors);
    }
    if (typeof obj.recommendations === 'string') {
      obj.recommendations = JSON.parse(obj.recommendations);
    }
    return obj;
  }

  async save() {
    if (this.id) {
      return await AIAttritionPrediction.update(this.id, this);
    } else {
      return await AIAttritionPrediction.create(this);
    }
  }
}

module.exports = AIAttritionPrediction;
