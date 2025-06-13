# 🏗️ Modular Backend Architecture - Independent Services Design

## 🎯 **Architecture Overview for Multi-Agent Development**

This backend architecture is designed so **multiple agents can work independently** on different services without affecting each other. Each service is completely self-contained with its own models, controllers, routes, and middleware.

---

## 📁 **Project Structure**

```
backend/
├── app.js                          # Main application entry point
├── config/
│   ├── database.js                 # Database connection
│   ├── jwt.js                      # JWT configuration
│   └── environment.js              # Environment variables
├── shared/
│   ├── middleware/
│   │   ├── auth.js                 # Authentication middleware
│   │   ├── rbac.js                 # Role-based access control
│   │   ├── validation.js           # Request validation
│   │   └── errorHandler.js         # Global error handling
│   ├── models/
│   │   └── BaseModel.js            # Base model with common methods
│   └── utils/
│       ├── response.js             # Standardized API responses
│       ├── logger.js               # Logging utility
│       └── constants.js            # Application constants
├── services/
│   ├── auth-service/               # 🔐 Authentication Service
│   ├── employee-service/           # 👥 Employee Management Service
│   ├── attendance-service/         # ⏰ Attendance Service
│   ├── leave-service/              # 🏖️ Leave Management Service
│   ├── payroll-service/            # 💰 Payroll Service
│   ├── performance-service/        # 📊 Performance Service
│   ├── ai-service/                 # 🤖 AI Features Service
│   └── reports-service/            # 📈 Reports Service
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```

---

## 🔧 **Main Application Setup (app.js)**

```javascript
// app.js - Main application entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Shared middleware
const { errorHandler } = require('./shared/middleware/errorHandler');
const { logger } = require('./shared/utils/logger');

// Service routes
const authRoutes = require('./services/auth-service/routes');
const employeeRoutes = require('./services/employee-service/routes');
const attendanceRoutes = require('./services/attendance-service/routes');
const leaveRoutes = require('./services/leave-service/routes');
const payrollRoutes = require('./services/payroll-service/routes');
const performanceRoutes = require('./services/performance-service/routes');
const aiRoutes = require('./services/ai-service/routes');
const reportsRoutes = require('./services/reports-service/routes');

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  next();
});

// Service routes - each service is completely independent
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: [
      'auth', 'employee', 'attendance', 'leave', 
      'payroll', 'performance', 'ai', 'reports'
    ]
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

module.exports = app;
```

---

## 🔐 **Service Template Structure**

Each service follows this exact structure for consistency:

```
services/[service-name]/
├── index.js                    # Service entry point
├── routes.js                   # Route definitions
├── controllers/
│   ├── [entity]Controller.js   # Business logic
│   └── index.js                # Controller exports
├── models/
│   ├── [Entity].js             # Database models
│   └── index.js                # Model exports
├── middleware/
│   ├── validation.js           # Service-specific validations
│   └── [service]Middleware.js  # Service-specific middleware
├── services/
│   └── [service]Service.js     # Core business logic
├── utils/
│   └── [service]Utils.js       # Service-specific utilities
└── tests/
    ├── controllers/
    ├── models/
    └── services/
```

---

## 🔐 **Example: Auth Service (Complete Implementation)**

### **services/auth-service/index.js**
```javascript
// Auth service entry point
const routes = require('./routes');
const { AuthController } = require('./controllers');
const { User } = require('./models');
const { AuthService } = require('./services/AuthService');

module.exports = {
  routes,
  controllers: { AuthController },
  models: { User },
  services: { AuthService }
};
```

### **services/auth-service/routes.js**
```javascript
const express = require('express');
const { AuthController } = require('./controllers');
const { validateLogin, validateRegister } = require('./middleware/validation');

const router = express.Router();

// Authentication routes
router.post('/login', validateLogin, AuthController.login);
router.post('/register', validateRegister, AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

module.exports = router;
```

### **services/auth-service/controllers/AuthController.js**
```javascript
const { AuthService } = require('../services/AuthService');
const { successResponse, errorResponse } = require('../../../shared/utils/response');

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      return successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const userData = req.body;
      const result = await AuthService.register(userData);
      
      return successResponse(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      
      return successResponse(res, null, 'Password reset email sent');
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      
      return successResponse(res, null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      
      return successResponse(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      
      return successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
```

### **services/auth-service/models/User.js**
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'employee'),
    allowNull: false,
    defaultValue: 'employee'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    field: 'last_login_at'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.passwordHash = await bcrypt.hash(user.password, 12);
        delete user.password;
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.passwordHash = await bcrypt.hash(user.password, 12);
        delete user.password;
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.passwordHash;
  return values;
};

module.exports = User;
```

### **services/auth-service/services/AuthService.js**
```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Employee } = require('../../employee-service/models');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../../../config/jwt');

class AuthService {
  static async login(email, password) {
    // Find user with employee data
    const user = await User.findOne({
      where: { email, isActive: true },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'department']
      }]
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user: user.toJSON()
    };
  }

  static async register(userData) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await User.create(userData);
    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user: user.toJSON()
    };
  }

  static generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return {
      token: accessToken,
      refreshToken
    };
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token and send email
    // Implementation depends on email service
    console.log(`Password reset requested for ${email}`);
  }

  static async resetPassword(token, newPassword) {
    // Verify reset token and update password
    // Implementation depends on token storage strategy
    console.log('Password reset completed');
  }

  static async logout(refreshToken) {
    // Invalidate refresh token
    // Implementation depends on token blacklist strategy
    console.log('User logged out');
  }
}

module.exports = AuthService;
```

---

## 🎯 **Service Independence Guidelines**

### **1. Database Models**
- Each service manages its own models
- Cross-service data access through APIs only
- No direct database queries across services

### **2. Business Logic**
- All business logic contained within service
- No shared business logic between services
- Service-specific utilities and helpers

### **3. API Contracts**
- Well-defined API contracts between services
- Versioned APIs for backward compatibility
- Standardized error responses

### **4. Testing**
- Each service has its own test suite
- Mock external service dependencies
- Independent test execution

### **5. Development Workflow**
```bash
# Agent 1 works on auth-service
cd services/auth-service
npm test
npm run dev:auth

# Agent 2 works on employee-service
cd services/employee-service
npm test
npm run dev:employee

# No conflicts between agents
```

---

## 🔄 **Inter-Service Communication**

### **Service-to-Service API Calls**
```javascript
// Example: Employee service calling Auth service
const axios = require('axios');

class EmployeeService {
  static async validateUser(userId) {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/validate/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('User validation failed');
    }
  }
}
```

### **Event-Driven Communication** (Optional)
```javascript
// Using event emitters for loose coupling
const EventEmitter = require('events');
const serviceEvents = new EventEmitter();

// Employee service emits event
serviceEvents.emit('employee.created', { employeeId, userId });

// Payroll service listens
serviceEvents.on('employee.created', (data) => {
  PayrollService.createSalaryStructure(data.employeeId);
});
```

This modular architecture ensures that multiple agents can work simultaneously on different services without any conflicts or dependencies, while maintaining clean separation of concerns and scalability.
