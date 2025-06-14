const { validationResult } = require('express-validator');
const { AppError } = require('./errorMiddleware');

// Validate request using express-validator
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return next(new AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400));
  }

  next();
};

// Common validation schemas
const commonValidations = {
  email: {
    isEmail: {
      errorMessage: 'Please provide a valid email address'
    },
    normalizeEmail: true
  },
  
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    }
  },
  
  employeeId: {
    isInt: {
      options: { min: 1 },
      errorMessage: 'Employee ID must be a positive integer'
    }
  },
  
  role: {
    isIn: {
      options: [['admin', 'manager', 'employee']],
      errorMessage: 'Role must be admin, manager, or employee'
    }
  },
  
  date: {
    isISO8601: {
      errorMessage: 'Please provide a valid date in ISO format'
    }
  },
  
  phoneNumber: {
    isMobilePhone: {
      errorMessage: 'Please provide a valid phone number'
    }
  }
};

// Pagination validation
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return next(new AppError('Page must be a positive integer', 400));
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 10000) {
    return next(new AppError('Limit must be between 1 and 10000', 400));
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };

  next();
};

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      return next(new AppError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400));
    }

    // Check file size
    if (req.file.size > maxSize) {
      return next(new AppError(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`, 400));
    }

    next();
  };
};

module.exports = {
  validateRequest,
  commonValidations,
  validatePagination,
  validateFileUpload
};
