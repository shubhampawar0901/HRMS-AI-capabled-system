const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/authMiddleware');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Helper function to send success response
const sendSuccess = (res, data, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data
  });
};

// Helper function to send error response
const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: { message }
  });
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register new user
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, `Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400);
      }

      const { email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await executeQuery('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return sendError(res, 'User already exists with this email', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const result = await executeQuery(
        'INSERT INTO users (email, password, role, is_active, created_at, updated_at) VALUES (?, ?, ?, TRUE, NOW(), NOW())',
        [email, hashedPassword, role]
      );

      // Generate token
      const user = {
        id: result.insertId,
        email,
        role
      };
      const token = generateToken(user);

      sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token
      }, 'User registered successfully');

    } catch (error) {
      console.error('Registration error:', error);
      sendError(res, 'Registration failed', 500);
    }
  }
);

// Login user
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, `Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400);
      }

      const { email, password } = req.body;

      // Find user
      const users = await executeQuery('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);
      if (users.length === 0) {
        return sendError(res, 'Invalid credentials', 401);
      }

      const user = users[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return sendError(res, 'Invalid credentials', 401);
      }

      // Generate token
      const token = generateToken(user);

      sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      sendError(res, 'Login failed', 500);
    }
  }
);

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await executeQuery('SELECT id, email, role, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, users[0], 'Profile retrieved successfully');

  } catch (error) {
    console.error('Profile error:', error);
    sendError(res, 'Failed to get profile', 500);
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
