const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

const router = express.Router();

// ==========================================
// VALIDATION RULES
// ==========================================
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// ==========================================
// PUBLIC ROUTES
// ==========================================

// POST /api/auth/login
router.post('/login',
  loginValidation,
  validateRequest,
  AuthController.login
);

// POST /api/auth/refresh
router.post('/refresh',
  refreshTokenValidation,
  validateRequest,
  AuthController.refreshToken
);

// ==========================================
// PROTECTED ROUTES
// ==========================================

// POST /api/auth/logout
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

// GET /api/auth/me
router.get('/me',
  authenticateToken,
  AuthController.getCurrentUser
);

// POST /api/auth/change-password
router.post('/change-password',
  authenticateToken,
  changePasswordValidation,
  validateRequest,
  AuthController.changePassword
);

// ==========================================
// HEALTH CHECK
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /login': 'User authentication',
      'POST /refresh': 'Token refresh',
      'POST /logout': 'User logout',
      'GET /me': 'Get current user',
      'POST /change-password': 'Change password'
    }
  });
});

module.exports = router;
