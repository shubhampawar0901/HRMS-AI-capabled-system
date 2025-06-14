const { executeQuery } = require('../config/database');

class AIChatbotInteraction {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.sessionId = data.session_id;
    this.userQuery = data.user_query;
    this.botResponse = data.bot_response;
    this.intent = data.intent;
    this.confidence = data.confidence;
    this.responseTime = data.response_time;
    this.feedback = data.feedback;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT ci.*, 
             CONCAT(e.first_name, ' ', e.last_name) as user_name,
             u.email as user_email
      FROM ai_chatbot_interactions ci
      LEFT JOIN users u ON ci.user_id = u.id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE ci.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new AIChatbotInteraction(rows[0]) : null;
  }

  static async create(interactionData) {
    const query = `
      INSERT INTO ai_chatbot_interactions (
        user_id, session_id, user_query, bot_response, intent,
        confidence, response_time, feedback, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      interactionData.userId || null,
      interactionData.sessionId || null,
      interactionData.userQuery || null,
      interactionData.botResponse || null,
      interactionData.intent || null,
      interactionData.confidence || 0.0,
      interactionData.responseTime || 0,
      interactionData.feedback || null
    ]);
    
    return await AIChatbotInteraction.findById(result.insertId);
  }

  static async findByUser(userId, options = {}) {
    let query = 'SELECT * FROM ai_chatbot_interactions WHERE user_id = ?';
    const params = [userId];
    
    if (options.sessionId) {
      query += ' AND session_id = ?';
      params.push(options.sessionId);
    }
    
    query += ' ORDER BY created_at DESC';

    if (options.limit) {
      const limit = parseInt(options.limit);
      // Use string concatenation instead of parameters for LIMIT to avoid MySQL issues
      query += ` LIMIT ${limit}`;
    }
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new AIChatbotInteraction(row));
  }

  static async findBySession(sessionId) {
    const query = 'SELECT * FROM ai_chatbot_interactions WHERE session_id = ? ORDER BY created_at ASC';
    const rows = await executeQuery(query, [sessionId]);
    return rows.map(row => new AIChatbotInteraction(row));
  }

  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await AIChatbotInteraction.update(this.id, this);
    } else {
      return await AIChatbotInteraction.create(this);
    }
  }
}

module.exports = AIChatbotInteraction;
