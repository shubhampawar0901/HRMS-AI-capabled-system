/**
 * Authentication Service - Business Logic
 * Handles authentication operations and JWT management using Plain SQL
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthService {
  /**
   * Validate user credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object|null} User object or null
   */
  static async validateCredentials(email, password) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return null;
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return null;
      }

      // Update last login
      await User.updateLastLogin(user.id);

      return user;
    } catch (error) {
      console.error('Error validating credentials:', error);
      throw new Error('Failed to validate credentials');
    }
  }

  /**
   * Generate JWT tokens
   * @param {Object} user - User object
   * @returns {Object} Access and refresh tokens
   */
  static async generateTokens(user) {
    try {
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        { expiresIn: '7d' }
      );

      // Store refresh token in database
      await User.update(user.id, { refreshToken });

      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw new Error('Failed to generate tokens');
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  static async refreshTokens(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
      );

      // Find user by ID and verify refresh token
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new Error('Invalid or expired refresh token');
      }
      throw new Error('Failed to refresh tokens');
    }
  }

  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  static async hashPassword(password) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {boolean} Match status
   */
  static async comparePassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Error comparing password:', error);
      throw new Error('Failed to compare password');
    }
  }

  /**
   * Logout user
   * @param {number} userId - User ID
   * @returns {boolean} Success status
   */
  static async logout(userId) {
    try {
      await User.update(userId, { refreshToken: null });
      return true;
    } catch (error) {
      console.error('Error logging out user:', error);
      throw new Error('Failed to logout user');
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Get user profile
   * @param {number} userId - User ID
   * @returns {Object} User profile
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Object} Updated user profile
   */
  static async updateUserProfile(userId, profileData) {
    try {
      // Only allow certain fields to be updated
      const allowedFields = ['email', 'role'];
      const updateData = {};

      Object.keys(profileData).forEach(key => {
        if (allowedFields.includes(key) && profileData[key] !== undefined) {
          updateData[key] = profileData[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      const updatedUser = await User.update(userId, updateData);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser.toJSON();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  static validatePasswordStrength(password) {
    const errors = [];

    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Validation result
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = AuthService;
