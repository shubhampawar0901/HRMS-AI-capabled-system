const { body, param, validationResult } = require('express-validator');
const { sendError } = require('../../../utils/responseHelper');

// Validation middleware for chatbot query
const validateChatbotQuery = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .trim()
    .escape(),
  
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

// Validation middleware for session ID parameter
const validateSessionId = [
  param('sessionId')
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Invalid session ID', 400, errors.array());
    }
    next();
  }
];

// Validation middleware for AI features
const validateAttritionRequest = [
  body('employeeIds')
    .optional()
    .isArray()
    .withMessage('Employee IDs must be an array'),
  
  body('employeeIds.*')
    .isUUID()
    .withMessage('Each employee ID must be a valid UUID'),

  body('includeDetails')
    .optional()
    .isBoolean()
    .withMessage('Include details must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

const validateSmartFeedbackRequest = [
  body('employeeId')
    .isUUID()
    .withMessage('Employee ID must be a valid UUID'),
  
  body('reviewPeriod')
    .optional()
    .isIn(['monthly', 'quarterly', 'annual'])
    .withMessage('Review period must be monthly, quarterly, or annual'),

  body('includeGoals')
    .optional()
    .isBoolean()
    .withMessage('Include goals must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

const validateAnomalyDetectionRequest = [
  body('dateRange')
    .optional()
    .isObject()
    .withMessage('Date range must be an object'),
  
  body('dateRange.startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('dateRange.endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  body('employeeIds')
    .optional()
    .isArray()
    .withMessage('Employee IDs must be an array'),

  body('anomalyTypes')
    .optional()
    .isArray()
    .withMessage('Anomaly types must be an array'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

const validateSmartReportsRequest = [
  body('reportType')
    .isIn(['employee', 'department', 'company', 'team'])
    .withMessage('Report type must be employee, department, company, or team'),
  
  body('entityId')
    .optional()
    .isUUID()
    .withMessage('Entity ID must be a valid UUID'),

  body('dateRange')
    .optional()
    .isObject()
    .withMessage('Date range must be an object'),

  body('includeCharts')
    .optional()
    .isBoolean()
    .withMessage('Include charts must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

const validateResumeParserRequest = [
  body('resumeText')
    .optional()
    .isLength({ min: 10, max: 50000 })
    .withMessage('Resume text must be between 10 and 50000 characters'),
  
  body('fileName')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters'),

  body('extractSkills')
    .optional()
    .isBoolean()
    .withMessage('Extract skills must be a boolean'),

  body('extractExperience')
    .optional()
    .isBoolean()
    .withMessage('Extract experience must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

// Security validation middleware
const validateUserAccess = (requiredRole = null) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return errorResponse(res, 'User role not found', 401);
    }

    // If specific role is required, check it
    if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
      return errorResponse(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

// Middleware to validate employee access based on role
const validateEmployeeAccess = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === 'admin') {
      // Admin can access any employee
      return next();
    }

    if (userRole === 'manager') {
      // Check if employee is a direct report
      const { Employee } = require('../../../shared/models');
      const employee = await Employee.findOne({
        where: { id: employeeId, managerId: userId }
      });

      if (!employee) {
        return errorResponse(res, 'Access denied: Employee is not your direct report', 403);
      }
    } else if (userRole === 'employee') {
      // Employee can only access their own data
      if (req.user.employeeId !== employeeId) {
        return errorResponse(res, 'Access denied: Can only access your own data', 403);
      }
    } else {
      return errorResponse(res, 'Invalid user role', 403);
    }

    next();
  } catch (error) {
    console.error('Employee access validation error:', error);
    return errorResponse(res, 'Access validation failed', 500);
  }
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize common XSS patterns
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

module.exports = {
  validateChatbotQuery,
  validateSessionId,
  validateAttritionRequest,
  validateSmartFeedbackRequest,
  validateAnomalyDetectionRequest,
  validateSmartReportsRequest,
  validateResumeParserRequest,
  validateUserAccess,
  validateEmployeeAccess,
  sanitizeInput
};
