const { executeQuery } = require('../config/database');

class AIPolicyDocument {
  constructor(data) {
    this.id = data.id;
    this.filename = data.filename;
    this.originalFilename = data.original_filename;
    this.filePath = data.file_path;
    this.fileSize = data.file_size;
    this.mimeType = data.mime_type;
    this.documentType = data.document_type;
    this.totalChunks = data.total_chunks;
    this.processingStatus = data.processing_status;
    this.errorMessage = data.error_message;
    this.pineconeNamespace = data.pinecone_namespace;
    this.vectorIds = this.safeJsonParse(data.vector_ids, []);
    this.description = data.description;
    this.tags = this.safeJsonParse(data.tags, []);
    this.isActive = data.is_active;
    this.accessLevel = data.access_level;
    this.departmentSpecific = data.department_specific;
    this.uploadedBy = data.uploaded_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Helper method for safe JSON parsing
  safeJsonParse(jsonString, defaultValue = null) {
    if (!jsonString) return defaultValue;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('JSON parse error:', error.message, 'for value:', jsonString);
      return defaultValue;
    }
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT pd.*, 
             CONCAT(e.first_name, ' ', e.last_name) as uploader_name,
             u.email as uploader_email,
             d.name as department_name
      FROM ai_policy_documents pd
      LEFT JOIN users u ON pd.uploaded_by = u.id
      LEFT JOIN employees e ON u.id = e.user_id
      LEFT JOIN departments d ON pd.department_specific = d.id
      WHERE pd.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new AIPolicyDocument(rows[0]) : null;
  }

  static async create(documentData) {
    const query = `
      INSERT INTO ai_policy_documents (
        filename, original_filename, file_path, file_size, mime_type,
        document_type, description, access_level, department_specific,
        uploaded_by, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      documentData.filename || null,
      documentData.originalFilename || null,
      documentData.filePath || null,
      documentData.fileSize || 0,
      documentData.mimeType || 'application/pdf',
      documentData.documentType || 'other',
      documentData.description || null,
      documentData.accessLevel || 'employee',
      documentData.departmentSpecific || null,
      documentData.uploadedBy || null,
      documentData.tags ? JSON.stringify(documentData.tags) : null
    ]);
    
    return await AIPolicyDocument.findById(result.insertId);
  }

  static async findAll(options = {}) {
    let query = `
      SELECT pd.*, 
             CONCAT(e.first_name, ' ', e.last_name) as uploader_name,
             d.name as department_name
      FROM ai_policy_documents pd
      LEFT JOIN users u ON pd.uploaded_by = u.id
      LEFT JOIN employees e ON u.id = e.user_id
      LEFT JOIN departments d ON pd.department_specific = d.id
      WHERE 1=1
    `;
    const params = [];
    
    if (options.documentType) {
      query += ' AND pd.document_type = ?';
      params.push(options.documentType);
    }
    
    if (options.processingStatus) {
      query += ' AND pd.processing_status = ?';
      params.push(options.processingStatus);
    }
    
    if (options.isActive !== undefined) {
      query += ' AND pd.is_active = ?';
      params.push(options.isActive);
    }
    
    if (options.accessLevel) {
      query += ' AND pd.access_level = ?';
      params.push(options.accessLevel);
    }
    
    query += ' ORDER BY pd.created_at DESC';

    if (options.limit) {
      const limit = parseInt(options.limit);
      query += ` LIMIT ${limit}`;
    }
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new AIPolicyDocument(row));
  }

  static async findByType(documentType) {
    const query = `
      SELECT * FROM ai_policy_documents 
      WHERE document_type = ? AND is_active = 1 AND processing_status = 'completed'
      ORDER BY created_at DESC
    `;
    const rows = await executeQuery(query, [documentType]);
    return rows.map(row => new AIPolicyDocument(row));
  }

  static async updateProcessingStatus(id, status, errorMessage = null, additionalData = {}) {
    const query = `
      UPDATE ai_policy_documents 
      SET processing_status = ?, 
          error_message = ?,
          total_chunks = ?,
          pinecone_namespace = ?,
          vector_ids = ?,
          updated_at = NOW()
      WHERE id = ?
    `;
    
    await executeQuery(query, [
      status,
      errorMessage,
      additionalData.totalChunks || 0,
      additionalData.pineconeNamespace || null,
      additionalData.vectorIds ? JSON.stringify(additionalData.vectorIds) : null,
      id
    ]);
    
    return await AIPolicyDocument.findById(id);
  }

  static async findActiveDocuments(userRole = 'employee', departmentId = null) {
    let query = `
      SELECT * FROM ai_policy_documents 
      WHERE is_active = 1 AND processing_status = 'completed'
    `;
    const params = [];
    
    // Role-based access control
    if (userRole === 'employee') {
      query += ` AND access_level IN ('public', 'employee')`;
    } else if (userRole === 'manager') {
      query += ` AND access_level IN ('public', 'employee', 'manager')`;
    }
    // Admin can see all documents
    
    // Department-specific documents
    if (departmentId) {
      query += ` AND (department_specific IS NULL OR department_specific = ?)`;
      params.push(departmentId);
    } else {
      query += ` AND department_specific IS NULL`;
    }
    
    query += ' ORDER BY document_type, created_at DESC';
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new AIPolicyDocument(row));
  }

  static async searchDocuments(searchTerm, userRole = 'employee') {
    const query = `
      SELECT * FROM ai_policy_documents 
      WHERE is_active = 1 
        AND processing_status = 'completed'
        AND (
          filename LIKE ? OR 
          original_filename LIKE ? OR 
          description LIKE ? OR
          JSON_SEARCH(tags, 'one', ?) IS NOT NULL
        )
        AND access_level IN (${userRole === 'admin' ? "'public', 'employee', 'manager', 'admin'" : 
                             userRole === 'manager' ? "'public', 'employee', 'manager'" : 
                             "'public', 'employee'"})
      ORDER BY created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const rows = await executeQuery(query, [searchPattern, searchPattern, searchPattern, searchTerm]);
    return rows.map(row => new AIPolicyDocument(row));
  }

  static async delete(id) {
    // Soft delete - set is_active to false
    const query = 'UPDATE ai_policy_documents SET is_active = 0, updated_at = NOW() WHERE id = ?';
    await executeQuery(query, [id]);
    return true;
  }

  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await AIPolicyDocument.update(this.id, this);
    } else {
      return await AIPolicyDocument.create(this);
    }
  }
}

module.exports = AIPolicyDocument;
