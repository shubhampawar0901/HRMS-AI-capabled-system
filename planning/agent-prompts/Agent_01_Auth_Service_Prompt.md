# 🔐 AGENT 1 - AUTHENTICATION SERVICE DEVELOPMENT

## 📋 **YOUR ASSIGNMENT**
- **Agent ID**: Agent 1
- **Service**: Authentication Service
- **Workspace Folder**: `backend/services/auth-service/`
- **Git Branch**: `feature/auth-service-implementation`
- **Development Phase**: Phase 1 (Foundation)
- **Priority**: HIGH (Critical Foundation Service)

## 🚨 **CRITICAL RULES - MUST FOLLOW EXACTLY**

### **🚫 ABSOLUTE PROHIBITIONS:**
```bash
# NEVER RUN THESE COMMANDS:
git commit -m "..."          # ❌ FORBIDDEN
git push origin ...          # ❌ FORBIDDEN  
git merge ...                # ❌ FORBIDDEN
git rebase ...               # ❌ FORBIDDEN
git checkout [other-branch]  # ❌ FORBIDDEN
git pull origin main         # ❌ FORBIDDEN
```

### **✅ ALLOWED GIT OPERATIONS:**
```bash
git status                   # ✅ Check file status
git add .                    # ✅ Stage your changes
git diff                     # ✅ View changes
git branch                   # ✅ Check current branch
git log --oneline -10        # ✅ View recent commits
```

### **📁 WORKSPACE BOUNDARIES:**
- ✅ **WORK ONLY** in: `backend/services/auth-service/`
- ❌ **NEVER TOUCH**: 
  - `backend/shared/` folder
  - `backend/config/` folder
  - `backend/app.js`
  - Other service folders
  - Package.json files
  - .env files

## 📚 **MANDATORY READING**
Before starting, read these documents:
1. `planning/Workflow/backend.md`
2. `planning/Backend_Agent_Tasks.md` (Agent 1 section)
3. `planning/API_Integration_Guide.md`
4. `planning/01_Database_Schema_Design.md` (users table)

## 🎯 **YOUR SPECIFIC TASKS**

### **API Endpoints to Implement:**
```javascript
POST /api/auth/login           # User authentication
POST /api/auth/refresh         # Token refresh
POST /api/auth/logout          # User logout
POST /api/auth/forgot-password # Password reset request
POST /api/auth/reset-password  # Password reset
GET  /api/auth/profile         # Get user profile
PUT  /api/auth/profile         # Update user profile
```

### **Required File Structure:**
```
backend/services/auth-service/
├── index.js                    # Service entry point
├── routes.js                   # Route definitions
├── controllers/
│   └── AuthController.js       # Authentication logic
├── services/
│   └── AuthService.js          # Business logic
├── models/
│   └── User.js                 # User database model
├── middleware/
│   └── validation.js           # Input validation
└── tests/
    ├── auth.test.js            # Unit tests
    └── integration/
        └── auth.integration.test.js
```

### **Key Implementation Requirements:**

#### **1. AuthController.js - Core Methods:**
```javascript
class AuthController {
  static async login(req, res)           // Handle user login
  static async refresh(req, res)         // Handle token refresh
  static async logout(req, res)          // Handle user logout
  static async forgotPassword(req, res)  // Handle password reset request
  static async resetPassword(req, res)   // Handle password reset
  static async getProfile(req, res)      // Get user profile
  static async updateProfile(req, res)   // Update user profile
}
```

#### **2. AuthService.js - Business Logic:**
```javascript
class AuthService {
  static async validateCredentials(email, password)  // Validate login
  static async generateTokens(user)                  // Generate JWT tokens
  static async refreshTokens(refreshToken)           // Refresh access token
  static async hashPassword(password)                // Hash password
  static async comparePassword(password, hash)       // Compare passwords
  static async generateResetToken(email)             // Generate reset token
  static async validateResetToken(token)             // Validate reset token
}
```

#### **3. User.js - Database Model:**
```javascript
class User {
  static async findByEmail(email)        // Find user by email
  static async findById(id)              // Find user by ID
  static async create(userData)          // Create new user
  static async updatePassword(id, hash)  // Update user password
  static async updateProfile(id, data)   // Update user profile
}
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

## 📋 **DATABASE INTEGRATION**
Use the `users` table from the database schema:
```sql
-- Reference the users table structure
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🎯 **SUCCESS CRITERIA**
- [ ] All 7 API endpoints implemented and working
- [ ] JWT authentication system functional
- [ ] Password hashing and validation working
- [ ] Input validation and sanitization complete
- [ ] Rate limiting implemented
- [ ] Unit tests >90% coverage
- [ ] Integration tests passing
- [ ] Security measures implemented
- [ ] Error handling comprehensive
- [ ] Code follows project standards

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
