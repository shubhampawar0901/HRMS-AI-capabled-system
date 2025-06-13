const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.isActive = data.is_active;
    this.lastLogin = data.last_login;
    this.refreshToken = data.refresh_token;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
    const rows = await executeQuery(query, [email]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    const query = `
      INSERT INTO users (email, password, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await executeQuery(query, [
      userData.email,
      hashedPassword,
      userData.role || 'employee',
      userData.isActive !== undefined ? userData.isActive : true
    ]);

    return await User.findById(result.insertId);
  }

  static async update(id, userData) {
    const updates = [];
    const values = [];

    if (userData.email) {
      updates.push('email = ?');
      values.push(userData.email);
    }

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (userData.role) {
      updates.push('role = ?');
      values.push(userData.role);
    }

    if (userData.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(userData.isActive);
    }

    if (userData.refreshToken !== undefined) {
      updates.push('refresh_token = ?');
      values.push(userData.refreshToken);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);

    return await User.findById(id);
  }

  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async delete(id) {
    const query = 'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findAll(options = {}) {
    let query = 'SELECT * FROM users WHERE is_active = 1';
    const params = [];

    if (options.role) {
      query += ' AND role = ?';
      params.push(options.role);
    }

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => new User(row));
  }

  // Instance methods
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const obj = { ...this };
    delete obj.password;
    delete obj.refreshToken;
    return obj;
  }

  async save() {
    if (this.id) {
      return await User.update(this.id, this);
    } else {
      return await User.create(this);
    }
  }
}

module.exports = User;
