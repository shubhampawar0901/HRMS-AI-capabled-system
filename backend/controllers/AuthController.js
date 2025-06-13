/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints using Plain SQL
 */

const User = require('../models/User');
const {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendNotFound,
  sendValidationError
} = require('../utils/responseHelper');
const AuthService = require('../services/AuthService');

class AuthController {
  /**
   * User login
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return sendValidationError(res, [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password is required' }
        ]);
      }

      // Validate email format
      if (!AuthService.validateEmail(email)) {
        return sendValidationError(res, [
          { field: 'email', message: 'Invalid email format' }
        ]);
      }

      // Validate credentials
      const user = await AuthService.validateCredentials(email, password);
      if (!user) {
        return sendUnauthorized(res, 'Invalid email or password');
      }

      // Generate tokens
      const tokens = await AuthService.generateTokens(user);

      // Get user profile (without sensitive data)
      const userProfile = user.toJSON();

      return sendSuccess(res, {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userProfile
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      return sendError(res, 'Login failed', 500);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendValidationError(res, [
          { field: 'refreshToken', message: 'Refresh token is required' }
        ]);
      }

      // Refresh tokens
      const tokens = await AuthService.refreshTokens(refreshToken);

      return sendSuccess(res, {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }, 'Token refreshed successfully');

    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return sendUnauthorized(res, error.message);
      }
      
      return sendError(res, 'Token refresh failed', 500);
    }
  }

  /**
   * User logout
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      const { id: userId } = req.user;

      // Clear refresh token
      await AuthService.logout(userId);

      return sendSuccess(res, null, 'Logout successful');

    } catch (error) {
      console.error('Logout error:', error);
      return sendError(res, 'Logout failed', 500);
    }
  }

  /**
   * Get user profile
   * GET /api/auth/profile
   */
  static async getProfile(req, res) {
    try {
      const { id: userId } = req.user;

      // Get user profile
      const userProfile = await AuthService.getUserProfile(userId);

      return sendSuccess(res, userProfile, 'Profile retrieved successfully');

    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error.message.includes('User not found')) {
        return sendNotFound(res, 'User profile not found');
      }
      
      return sendError(res, 'Failed to retrieve profile', 500);
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res) {
    try {
      const { id: userId } = req.user;
      const profileData = req.body;

      // Validate email if provided
      if (profileData.email && !AuthService.validateEmail(profileData.email)) {
        return sendValidationError(res, [
          { field: 'email', message: 'Invalid email format' }
        ]);
      }

      // Validate role if provided
      if (profileData.role && !['admin', 'manager', 'employee'].includes(profileData.role)) {
        return sendValidationError(res, [
          { field: 'role', message: 'Invalid role. Must be admin, manager, or employee' }
        ]);
      }

      // Update user profile
      const updatedProfile = await AuthService.updateUserProfile(userId, profileData);

      return sendSuccess(res, updatedProfile, 'Profile updated successfully');

    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.message.includes('User not found')) {
        return sendNotFound(res, 'User profile not found');
      }
      
      if (error.message.includes('No valid fields')) {
        return sendError(res, 'No valid fields provided for update', 400);
      }
      
      return sendError(res, 'Failed to update profile', 500);
    }
  }

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  static async changePassword(req, res) {
    try {
      const { id: userId } = req.user;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        return sendValidationError(res, [
          { field: 'currentPassword', message: 'Current password is required' },
          { field: 'newPassword', message: 'New password is required' },
          { field: 'confirmPassword', message: 'Password confirmation is required' }
        ]);
      }

      // Check if new password matches confirmation
      if (newPassword !== confirmPassword) {
        return sendValidationError(res, [
          { field: 'confirmPassword', message: 'Password confirmation does not match' }
        ]);
      }

      // Validate new password strength
      const passwordValidation = AuthService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return sendValidationError(res, 
          passwordValidation.errors.map(error => ({ field: 'newPassword', message: error }))
        );
      }

      // Get current user
      const user = await User.findById(userId);
      if (!user) {
        return sendNotFound(res, 'User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return sendUnauthorized(res, 'Current password is incorrect');
      }

      // Update password
      const hashedPassword = await AuthService.hashPassword(newPassword);
      await User.update(userId, { password: hashedPassword, refreshToken: null });

      return sendSuccess(res, null, 'Password changed successfully. Please login again.');

    } catch (error) {
      console.error('Change password error:', error);
      return sendError(res, 'Failed to change password', 500);
    }
  }

  /**
   * Validate token (for other services)
   * GET /api/auth/validate
   */
  static async validateToken(req, res) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendUnauthorized(res, 'Invalid authorization header');
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      const decoded = AuthService.verifyToken(token);

      // Get user details
      const user = await AuthService.getUserProfile(decoded.id);
      if (!user) {
        return sendUnauthorized(res, 'User not found');
      }

      return sendSuccess(res, {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }, 'Token is valid');

    } catch (error) {
      console.error('Token validation error:', error);
      
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return sendUnauthorized(res, error.message);
      }
      
      return sendError(res, 'Token validation failed', 500);
    }
  }

  /**
   * Health check endpoint
   * GET /api/auth/health
   */
  static async healthCheck(req, res) {
    try {
      return sendSuccess(res, {
        service: 'auth-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 'Authentication service is healthy');
    } catch (error) {
      return sendError(res, 'Service unhealthy', 503);
    }
  }
}

module.exports = AuthController;
