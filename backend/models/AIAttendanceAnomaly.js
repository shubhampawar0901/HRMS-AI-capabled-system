const { executeQuery } = require('../config/database');

class AIAttendanceAnomaly {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.anomalyType = data.anomaly_type;
    this.detectedDate = data.detected_date;
    this.anomalyData = data.anomaly_data;
    this.severity = data.severity;
    this.description = data.description;
    this.recommendations = data.recommendations;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT aa.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM ai_attendance_anomalies aa
      LEFT JOIN employees e ON aa.employee_id = e.id
      WHERE aa.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new AIAttendanceAnomaly(rows[0]) : null;
  }

  static async create(anomalyData) {
    const query = `
      INSERT INTO ai_attendance_anomalies (
        employee_id, anomaly_type, detected_date, anomaly_data,
        severity, description, recommendations, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      anomalyData.employeeId,
      anomalyData.anomalyType,
      anomalyData.detectedDate,
      JSON.stringify(anomalyData.anomalyData),
      anomalyData.severity,
      anomalyData.description,
      JSON.stringify(anomalyData.recommendations),
      anomalyData.status || 'active'
    ]);
    
    return await AIAttendanceAnomaly.findById(result.insertId);
  }

  static async findByEmployee(employeeId, options = {}) {
    let query = 'SELECT * FROM ai_attendance_anomalies WHERE employee_id = ?';
    const params = [employeeId];
    
    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }
    
    query += ' ORDER BY detected_date DESC';
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new AIAttendanceAnomaly(row));
  }

  static async getActiveAnomalies() {
    const query = `
      SELECT aa.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             d.name as department_name
      FROM ai_attendance_anomalies aa
      JOIN employees e ON aa.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE aa.status = 'active'
      ORDER BY aa.severity DESC, aa.detected_date DESC
    `;
    
    const rows = await executeQuery(query);
    return rows.map(row => new AIAttendanceAnomaly(row));
  }

  toJSON() {
    const obj = { ...this };
    if (typeof obj.anomalyData === 'string') {
      obj.anomalyData = JSON.parse(obj.anomalyData);
    }
    if (typeof obj.recommendations === 'string') {
      obj.recommendations = JSON.parse(obj.recommendations);
    }
    return obj;
  }

  async save() {
    if (this.id) {
      return await AIAttendanceAnomaly.update(this.id, this);
    } else {
      return await AIAttendanceAnomaly.create(this);
    }
  }
}

module.exports = AIAttendanceAnomaly;
