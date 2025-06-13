# 🔐 AGENT 1 - AUTHENTICATION SERVICE DEVELOPMENT

## 🚨 **CRITICAL: USE DEVELOP BRANCH & NEW ARCHITECTURE**

### **🔄 MANDATORY FIRST STEPS:**
```bash
# 1. Switch to develop branch and get latest code
git checkout develop
git pull origin develop

# 2. Check the new architecture (NO SEQUELIZE, NO SHARED FOLDER)
ls backend/  # You should see: models/, controllers/, routes/, middleware/, utils/, services/
```

## 📋 **YOUR ASSIGNMENT**
- **Agent ID**: Agent 1
- **Service**: Authentication Service
- **Architecture**: **PLAIN SQL** (No Sequelize) + **Global Folder Structure**
- **Your Files**: `AuthController.js`, `authRoutes.js`, `AuthService.js`
- **Priority**: HIGH (Critical Foundation Service)

## 🏗️ **NEW ARCHITECTURE (CRITICAL CHANGES)**

### **✅ CORRECTED STRUCTURE:**
```
backend/
├── models/                  # 🔥 GLOBAL MODELS (Plain SQL)
├── controllers/             # 🔥 GLOBAL CONTROLLERS
│   └── AuthController.js    # ← YOUR CONTROLLER
├── routes/                  # 🔥 GLOBAL ROUTES
│   └── authRoutes.js        # ← YOUR ROUTES
├── middleware/              # 🔥 GLOBAL MIDDLEWARE
├── utils/                   # 🔥 GLOBAL UTILITIES
└── services/                # 🔥 BUSINESS LOGIC ONLY
    └── AuthService.js       # ← YOUR SERVICE
```

### **🚫 ABSOLUTE PROHIBITIONS:**
```bash
# NEVER RUN THESE COMMANDS:
git commit -m "..."          # ❌ FORBIDDEN
git push origin ...          # ❌ FORBIDDEN
git merge ...                # ❌ FORBIDDEN
git rebase ...               # ❌ FORBIDDEN
```

### **📁 YOUR EXACT WORKSPACE:**
- ✅ **WORK ONLY ON**:
  - `backend/controllers/AuthController.js`
  - `backend/routes/authRoutes.js`
  - `backend/services/AuthService.js`
- ❌ **NEVER TOUCH**:
  - `backend/models/` (read-only, already created)
  - `backend/middleware/` (read-only, already created)
  - `backend/config/` folder
  - `backend/app.js`
  - Other agents' files

## 📚 **MANDATORY READING**
Before starting, read these documents:
1. `backend/ARCHITECTURE.md` (NEW - explains corrected structure)
2. `planning/Workflow/backend.md`
3. `planning/Backend_Agent_Tasks.md` (Agent 1 section)
4. `backend/database/schema.sql` (users table structure)

## 🎯 **YOUR SPECIFIC TASKS**

### **API Endpoints to Implement:**
```javascript
POST /api/auth/login           # User authentication
POST /api/auth/refresh         # Token refresh
POST /api/auth/logout          # User logout
GET  /api/auth/profile         # Get user profile
PUT  /api/auth/profile         # Update user profile
```

### **🚨 CRITICAL: NO FORGOT PASSWORD (Per Requirements)**
**DO NOT IMPLEMENT**: forgot-password and reset-password endpoints (removed per user requirements)

### **YOUR EXACT FILES TO WORK ON:**
```
backend/
├── controllers/
│   └── AuthController.js       # ← IMPLEMENT THIS
├── routes/
│   └── authRoutes.js          # ← IMPLEMENT THIS
└── services/
    └── AuthService.js         # ← IMPLEMENT THIS
```

### **🔍 EXISTING FILES TO USE (READ-ONLY):**
```
backend/
├── models/
│   ├── User.js                # ← USE THIS (Plain SQL model)
│   └── index.js               # ← IMPORT FROM HERE
├── middleware/
│   └── authMiddleware.js      # ← USE THIS (already created)
└── utils/
    └── responseHelper.js      # ← USE THIS (sendSuccess, sendError)
```

### **🔥 IMPLEMENTATION REQUIREMENTS (PLAIN SQL):**

#### **1. AuthController.js - Core Methods:**
```javascript
const { User } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const AuthService = require('../services/AuthService');

class AuthController {
  static async login(req, res)           // Handle user login
  static async refresh(req, res)         // Handle token refresh
  static async logout(req, res)          // Handle user logout
  static async getProfile(req, res)      // Get user profile
  static async updateProfile(req, res)   // Update user profile
}
```

#### **2. AuthService.js - Business Logic:**
```javascript
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  static async validateCredentials(email, password)  // Validate login
  static async generateTokens(user)                  // Generate JWT tokens
  static async refreshTokens(refreshToken)           // Refresh access token
  static async hashPassword(password)                // Hash password
  static async comparePassword(password, hash)       // Compare passwords
}
```

#### **3. authRoutes.js - Route Definitions:**
```javascript
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);

// Protected routes
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
```

#### **4. Use Existing User Model (Plain SQL):**
The User model is already created with Plain SQL. Import and use it:
```javascript
const { User } = require('../models');

// Available methods:
await User.findByEmail(email)
await User.findById(id)
await User.create(userData)
await User.update(id, updateData)
```

#### **4. JWT Implementation:**
- Use `jsonwebtoken` library
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Include user ID, email, and role in payload
- Store refresh tokens in database

#### **5. Password Security:**
- Use `bcrypt` for password hashing
- Salt rounds: 12
- Validate password strength (min 8 chars, uppercase, lowercase, number)

#### **6. Input Validation:**
- Email format validation
- Password strength validation
- Sanitize all inputs
- Rate limiting for login attempts

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests (>90% coverage):**
```javascript
// Test all controller methods
describe('AuthController', () => {
  test('login with valid credentials')
  test('login with invalid credentials')
  test('token refresh with valid token')
  test('token refresh with invalid token')
  test('password reset flow')
  test('profile update')
})

// Test all service methods
describe('AuthService', () => {
  test('password hashing and comparison')
  test('JWT token generation and validation')
  test('reset token generation')
})
```

### **Integration Tests:**
```javascript
// Test complete authentication flows
describe('Auth API Integration', () => {
  test('complete login flow')
  test('token refresh flow')
  test('password reset flow')
  test('profile management flow')
})
```

## 🔒 **SECURITY REQUIREMENTS**
- Implement rate limiting (5 attempts per 15 minutes)
- Sanitize all inputs to prevent injection
- Use HTTPS-only cookies for refresh tokens
- Implement CSRF protection
- Log all authentication attempts
- Hash passwords with bcrypt (12 rounds)
- Validate JWT tokens properly
- Implement secure password reset flow

## 📋 **DATABASE INTEGRATION (PLAIN SQL)**
Use the existing `users` table with **INTEGER IDs** (not UUIDs):
```sql
-- Actual users table structure (from schema.sql)
users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME NULL,
  refresh_token TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### **🔥 CRITICAL: Use Plain SQL, Not Sequelize**
```javascript
// ❌ DON'T USE: Sequelize syntax
// const user = await User.findOne({ where: { email } });

// ✅ USE: Plain SQL methods (already implemented)
const user = await User.findByEmail(email);
const users = await User.findAll();
const newUser = await User.create(userData);
```

## 🎯 **SUCCESS CRITERIA**
- [ ] All 5 API endpoints implemented and working (no forgot/reset password)
- [ ] JWT authentication system functional
- [ ] Password hashing and validation working
- [ ] Input validation and sanitization complete
- [ ] Rate limiting implemented
- [ ] Plain SQL integration working
- [ ] Uses existing User model correctly
- [ ] Uses global middleware and utils
- [ ] Error handling comprehensive
- [ ] Code follows new architecture standards

## 📋 **COMPLETION PROTOCOL**

### **When You Complete Your Work:**
1. **Stage Changes**: Run `git add .`
2. **Check Status**: Run `git status`
3. **Report Completion** with this format:

```markdown
🤖 **AGENT 1 COMPLETION REPORT**

✅ **Status**: COMPLETED
📁 **Workspace**: backend/services/auth-service/
🌿 **Branch**: feature/auth-service-implementation
📝 **Files Modified**: 
[Paste output of 'git status']

🧪 **Tests**: 
- Unit Tests: [PASS/FAIL] - [X]% coverage
- Integration Tests: [PASS/FAIL]
- Security Tests: [PASS/FAIL]

📚 **API Endpoints Implemented**:
- POST /api/auth/login: [✅/❌]
- POST /api/auth/refresh: [✅/❌]
- POST /api/auth/logout: [✅/❌]
- POST /api/auth/forgot-password: [✅/❌]
- POST /api/auth/reset-password: [✅/❌]
- GET /api/auth/profile: [✅/❌]
- PUT /api/auth/profile: [✅/❌]

🔒 **Security Features**:
- JWT implementation: [✅/❌]
- Password hashing: [✅/❌]
- Rate limiting: [✅/❌]
- Input validation: [✅/❌]

🔗 **Integration Notes**:
- Service ready for Employee Service integration
- JWT middleware available for other services
- User authentication system fully functional

⚠️ **Issues Encountered**: [None/List any issues]

🚀 **Ready for User Commit**: [YES/NO]
```

## 🆘 **EMERGENCY PROTOCOL**
**STOP IMMEDIATELY and report if you encounter:**
- Database connection issues
- JWT library configuration problems
- Security implementation questions
- Need to modify shared middleware
- Integration with other services needed

**Report Format**: "🚨 URGENT: Agent 1 needs assistance - [brief issue description]"

## 🚀 **START COMMAND**
Begin by reading the mandatory documentation, then create the service structure and implement the authentication system. Remember: **WORK ONLY in backend/services/auth-service/** and **NEVER commit code**.

This is a critical foundation service - other agents depend on your completion! 🎯
