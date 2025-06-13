const { executeQuery } = require('../config/database');

class PerformanceReview {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.reviewerId = data.reviewer_id;
    this.reviewPeriod = data.review_period;
    this.overallRating = data.overall_rating;
    this.comments = data.comments;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT pr.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             CONCAT(r.first_name, ' ', r.last_name) as reviewer_name
      FROM performance_reviews pr
      LEFT JOIN employees e ON pr.employee_id = e.id
      LEFT JOIN users u ON pr.reviewer_id = u.id
      LEFT JOIN employees r ON u.id = r.user_id
      WHERE pr.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new PerformanceReview(rows[0]) : null;
  }

  static async create(reviewData) {
    const query = `
      INSERT INTO performance_reviews (
        employee_id, reviewer_id, review_period, overall_rating,
        comments, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      reviewData.employeeId,
      reviewData.reviewerId,
      reviewData.reviewPeriod,
      reviewData.overallRating,
      reviewData.comments,
      reviewData.status || 'draft'
    ]);
    
    return await PerformanceReview.findById(result.insertId);
  }

  static async update(id, reviewData) {
    const updates = [];
    const values = [];
    
    const fields = [
      'review_period', 'overall_rating', 'comments', 'status'
    ];
    
    fields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (reviewData[camelField] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(reviewData[camelField]);
      }
    });
    
    if (updates.length === 0) return await PerformanceReview.findById(id);
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE performance_reviews SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await PerformanceReview.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM performance_reviews WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findByEmployee(employeeId, options = {}) {
    let query = `
      SELECT pr.*, 
             CONCAT(r.first_name, ' ', r.last_name) as reviewer_name
      FROM performance_reviews pr
      LEFT JOIN users u ON pr.reviewer_id = u.id
      LEFT JOIN employees r ON u.id = r.user_id
      WHERE pr.employee_id = ?
    `;
    const params = [employeeId];
    
    if (options.status) {
      query += ' AND pr.status = ?';
      params.push(options.status);
    }
    
    if (options.reviewPeriod) {
      query += ' AND pr.review_period = ?';
      params.push(options.reviewPeriod);
    }
    
    query += ' ORDER BY pr.created_at DESC';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new PerformanceReview(row));
  }

  static async findByReviewer(reviewerId, options = {}) {
    let query = `
      SELECT pr.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM performance_reviews pr
      JOIN employees e ON pr.employee_id = e.id
      WHERE pr.reviewer_id = ?
    `;
    const params = [reviewerId];
    
    if (options.status) {
      query += ' AND pr.status = ?';
      params.push(options.status);
    }
    
    query += ' ORDER BY pr.created_at DESC';
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new PerformanceReview(row));
  }

  // Instance methods
  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await PerformanceReview.update(this.id, this);
    } else {
      return await PerformanceReview.create(this);
    }
  }
}

module.exports = PerformanceReview;
