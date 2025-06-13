const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Employee } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');

class AuthController {
  // ==========================================
  // LOGIN
  // ==========================================
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return sendError(res, 'Invalid email or password', 401);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid email or password', 401);
      }

      // Get employee details if user is employee
      let employee = null;
      if (user.role === 'employee' || user.role === 'manager') {
        employee = await Employee.findByUserId(user.id);
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          employeeId: employee?.id || null
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      // Update user's refresh token and last login
      await User.update(user.id, { refreshToken });
      await User.updateLastLogin(user.id);

      // Prepare response data
      const responseData = {
        user: user.toJSON(),
        employee: employee?.toJSON() || null,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };

      return sendSuccess(res, responseData, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      return sendError(res, 'Login failed', 500);
    }
  }

  // ==========================================
  // REFRESH TOKEN
  // ==========================================
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendError(res, 'Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
        return sendError(res, 'Invalid refresh token', 401);
      }

      // Get employee details if needed
      let employee = null;
      if (user.role === 'employee' || user.role === 'manager') {
        employee = await Employee.findByUserId(user.id);
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          employeeId: employee?.id || null
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const responseData = {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };

      return sendSuccess(res, responseData, 'Token refreshed successfully');
    } catch (error) {
      console.error('Refresh token error:', error);
      return sendError(res, 'Token refresh failed', 401);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================
  static async logout(req, res) {
    try {
      const userId = req.user.userId;

      // Clear refresh token
      await User.update(userId, { refreshToken: null });

      return sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return sendError(res, 'Logout failed', 500);
    }
  }

  // ==========================================
  // GET CURRENT USER
  // ==========================================
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Get employee details if needed
      let employee = null;
      if (user.role === 'employee' || user.role === 'manager') {
        employee = await Employee.findByUserId(user.id);
      }

      const responseData = {
        user: user.toJSON(),
        employee: employee?.toJSON() || null
      };

      return sendSuccess(res, responseData, 'User data retrieved');
    } catch (error) {
      console.error('Get current user error:', error);
      return sendError(res, 'Failed to get user data', 500);
    }
  }

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  static async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return sendError(res, 'Current password is incorrect', 400);
      }

      // Update password
      await User.update(userId, { password: newPassword });

      return sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return sendError(res, 'Failed to change password', 500);
    }
  }
}

module.exports = AuthController;
