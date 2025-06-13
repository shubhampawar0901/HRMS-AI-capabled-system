const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for login attempts
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Rate limiting for general auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiting to all routes
router.use(authRateLimit);

/**
 * Public Routes (No authentication required)
 */

// Health check
router.get('/health', AuthController.healthCheck);

// User login
router.post('/login', loginRateLimit, AuthController.login);

// Token refresh
router.post('/refresh', AuthController.refresh);

// Token validation (for other services)
router.get('/validate', AuthController.validateToken);

/**
 * Protected Routes (Authentication required)
 */

// Apply authentication middleware to all routes below
router.use(authenticateToken);

// User logout
router.post('/logout', AuthController.logout);

// Get user profile
router.get('/profile', AuthController.getProfile);

// Update user profile
router.put('/profile', AuthController.updateProfile);

// Change password
router.put('/change-password', AuthController.changePassword);

module.exports = router;
