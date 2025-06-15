const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/authMiddleware');

// Helper function to generate access token
const generateAccessToken = (user, employee = null) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: employee?.id || null
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
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

      // Generate tokens
      const newUser = {
        id: result.insertId,
        email,
        role
      };
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      // Update user with refresh token
      await executeQuery(
        'UPDATE users SET refresh_token = ? WHERE id = ?',
        [refreshToken, newUser.id]
      );

      sendSuccess(res, {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role
        },
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
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
        return sendError(res, 'Invalid email or password', 401);
      }

      const user = users[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return sendError(res, 'Invalid email or password', 401);
      }

      // Get employee details ONLY for manager and employee roles
      // Admin users should NEVER have employee records
      let employee = null;
      if (user.role === 'manager' || user.role === 'employee') {
        const employeeQuery = `
          SELECT e.id, e.employee_code, e.first_name, e.last_name,
                 e.department_id, e.position, e.manager_id,
                 d.name as department_name
          FROM employees e
          LEFT JOIN departments d ON e.department_id = d.id
          WHERE e.user_id = ? AND e.status = 'active'
        `;
        const employees = await executeQuery(employeeQuery, [user.id]);
        if (employees.length > 0) {
          employee = {
            id: employees[0].id,
            employeeCode: employees[0].employee_code,
            firstName: employees[0].first_name,
            lastName: employees[0].last_name,
            departmentId: employees[0].department_id,
            position: employees[0].position,
            department_name: employees[0].department_name,
            managerId: employees[0].manager_id
          };
        }
      }

      // Generate tokens
      const accessToken = generateAccessToken(user, employee);
      const refreshToken = generateRefreshToken(user);

      // Update user's refresh token and last login
      await executeQuery(
        'UPDATE users SET refresh_token = ?, last_login = NOW(), updated_at = NOW() WHERE id = ?',
        [refreshToken, user.id]
      );

      // Prepare response data according to documentation
      const responseData = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.is_active,
          lastLogin: new Date().toISOString(),
          createdAt: user.created_at,
          updatedAt: new Date().toISOString()
        },
        employee: employee, // null for admin, populated for manager/employee
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };

      // Send success response with timestamp
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: responseData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Login error:', error);
      sendError(res, 'Login failed', 500);
    }
  }
);

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Find user and verify refresh token
    const users = await executeQuery('SELECT * FROM users WHERE id = ? AND refresh_token = ? AND is_active = TRUE', [decoded.userId, refreshToken]);
    if (users.length === 0) {
      return sendError(res, 'Invalid refresh token', 401);
    }

    const user = users[0];

    // Get employee details if needed (same logic as login)
    let employee = null;
    if (user.role === 'manager' || user.role === 'employee') {
      const employeeQuery = `
        SELECT e.id, e.employee_code, e.first_name, e.last_name,
               e.department_id, e.position, e.manager_id,
               d.name as department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.user_id = ? AND e.status = 'active'
      `;
      const employees = await executeQuery(employeeQuery, [user.id]);
      if (employees.length > 0) {
        employee = {
          id: employees[0].id,
          employeeCode: employees[0].employee_code,
          firstName: employees[0].first_name,
          lastName: employees[0].last_name,
          departmentId: employees[0].department_id,
          position: employees[0].position,
          department_name: employees[0].department_name,
          managerId: employees[0].manager_id
        };
      }
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user, employee);

    sendSuccess(res, {
      accessToken: newAccessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Refresh token error:', error);
    return sendError(res, 'Token refresh failed', 401);
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Clear refresh token from database
    await executeQuery('UPDATE users SET refresh_token = NULL WHERE id = ?', [req.user.id]);
    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    sendError(res, 'Logout failed', 500);
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id; // Support both token formats

    const users = await executeQuery('SELECT * FROM users WHERE id = ? AND is_active = TRUE', [userId]);
    if (users.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    const user = users[0];

    // Get employee details if needed (same logic as login)
    let employee = null;
    if (user.role === 'manager' || user.role === 'employee') {
      const employeeQuery = `
        SELECT e.id, e.employee_code, e.first_name, e.last_name,
               e.department_id, e.position, e.manager_id,
               d.name as department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.user_id = ? AND e.status = 'active'
      `;
      const employees = await executeQuery(employeeQuery, [user.id]);
      if (employees.length > 0) {
        employee = {
          id: employees[0].id,
          employeeCode: employees[0].employee_code,
          firstName: employees[0].first_name,
          lastName: employees[0].last_name,
          departmentId: employees[0].department_id,
          position: employees[0].position,
          department_name: employees[0].department_name,
          managerId: employees[0].manager_id
        };
      }
    }

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      employee: employee // null for admin, populated for manager/employee
    };

    sendSuccess(res, responseData, 'Profile retrieved successfully');

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
