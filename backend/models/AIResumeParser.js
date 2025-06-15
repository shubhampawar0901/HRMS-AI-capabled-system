const { executeQuery } = require('../config/database');

class AIResumeParser {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.fileName = data.file_name;
    this.filePath = data.file_path;
    this.parsedData = data.parsed_data;
    this.extractedText = data.extracted_text;
    this.confidence = data.confidence;
    this.processingTime = data.processing_time;
    this.status = data.status;
    this.errorMessage = data.error_message;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT rp.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM ai_resume_parser rp
      LEFT JOIN employees e ON rp.employee_id = e.id
      WHERE rp.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new AIResumeParser(rows[0]) : null;
  }

  static async create(parserData) {
    const query = `
      INSERT INTO ai_resume_parser (
        employee_id, file_name, file_path, parsed_data, extracted_text,
        confidence, processing_time, status, error_message, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      parserData.employeeId,
      parserData.fileName,
      parserData.filePath,
      JSON.stringify(parserData.parsedData),
      parserData.extractedText,
      parserData.confidence,
      parserData.processingTime,
      parserData.status || 'processed',
      parserData.errorMessage
    ]);
    
    return await AIResumeParser.findById(result.insertId);
  }

  static async findByEmployee(employeeId) {
    const query = 'SELECT * FROM ai_resume_parser WHERE employee_id = ? ORDER BY created_at DESC';
    const rows = await executeQuery(query, [employeeId]);
    return rows.map(row => new AIResumeParser(row));
  }

  toJSON() {
    const obj = { ...this };
    if (typeof obj.parsedData === 'string') {
      obj.parsedData = JSON.parse(obj.parsedData);
    }
    return obj;
  }

  async save() {
    if (this.id) {
      return await AIResumeParser.update(this.id, this);
    } else {
      return await AIResumeParser.create(this);
    }
  }
}

module.exports = AIResumeParser;
