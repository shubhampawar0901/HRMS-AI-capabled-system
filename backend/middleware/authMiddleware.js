const jwt = require('jsonwebtoken');
const { AppError, asyncHandler } = require('./errorMiddleware');

// Authenticate JWT token
const authenticateToken = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    console.log('❌ No token provided. Headers:', req.headers.authorization);
    return next(new AppError('Access denied. No token provided.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // DEBUG: Log token details for performance endpoints
    if (req.path.includes('/performance/')) {
      console.log('🔐 Auth middleware - Performance endpoint accessed');
      console.log('- Token (first 20 chars):', token.substring(0, 20) + '...');
      console.log('- Decoded token:', decoded);
      console.log('- Path:', req.path);
    }

    // Add user info to request (support both old and new token formats)
    req.user = {
      id: decoded.id || decoded.userId, // Support both formats
      userId: decoded.userId || decoded.id, // New format
      email: decoded.email,
      role: decoded.role,
      employeeId: decoded.employeeId
    };

    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    console.log('Token:', token?.substring(0, 20) + '...');
    return next(new AppError('Invalid token', 401));
  }
});

// Authorize user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Access denied. User not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = authorize('admin');

// Check if user is admin or manager
const requireManagerOrAdmin = authorize('admin', 'manager');

// Check if user can access employee data (own data or manager/admin)
const canAccessEmployee = asyncHandler(async (req, res, next) => {
  const { employeeId } = req.params;
  const { role, employeeId: userEmployeeId } = req.user;

  // Admin and managers can access any employee data
  if (role === 'admin' || role === 'manager') {
    return next();
  }

  // Employees can only access their own data
  if (role === 'employee' && userEmployeeId === parseInt(employeeId)) {
    return next();
  }

  return next(new AppError('Access denied. Cannot access this employee data.', 403));
});

// Validate user role for AI features
const validateAIAccess = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  const { feature } = req.body;

  // Define AI feature access levels
  const aiFeatureAccess = {
    'chatbot': ['admin', 'manager', 'employee'],
    'attrition_predictor': ['admin', 'manager'],
    'smart_feedback': ['admin', 'manager'],
    'anomaly_detection': ['admin'],
    'resume_parser': ['admin'],
    'smart_reports': ['admin', 'manager']
  };

  // Check if feature exists and user has access
  if (feature && aiFeatureAccess[feature] && !aiFeatureAccess[feature].includes(role)) {
    return next(new AppError(`Access denied. Role '${role}' cannot access '${feature}' feature.`, 403));
  }

  next();
});

module.exports = {
  authenticateToken,
  authorize,
  requireAdmin,
  requireManagerOrAdmin,
  canAccessEmployee,
  validateAIAccess
};
